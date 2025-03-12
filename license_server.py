import os
import sys
import json
import time
import uuid
import hashlib
import base64
import random
import string
import logging
import re
import datetime
import secrets
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timedelta
from pathlib import Path
import configparser

from flask import Flask, request, jsonify, abort, render_template, send_from_directory, url_for, redirect
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.ext.declarative import declarative_base
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from functools import wraps
from waitress import serve

from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.serialization import load_pem_private_key, load_pem_public_key
from cryptography.hazmat.primitives.serialization import Encoding, PrivateFormat, PublicFormat, NoEncryption
from cryptography.hazmat.backends import default_backend

# Loglama ayarları
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("/var/log/zstok/license_server.log", mode='a'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Linux'ta log dosyası için klasör oluşturma
os.makedirs("/var/log/zstok", exist_ok=True)

# Yapılandırma dosyası
CONFIG_DIR = Path("/etc/zstok")
CONFIG_DIR.mkdir(exist_ok=True, parents=True)

CONFIG_FILE = CONFIG_DIR / "config.ini"
DEFAULT_CONFIG = {
    'server': {
        'host': '0.0.0.0',
        'port': '5000',
        'debug': 'False',
        'secret_key': secrets.token_hex(32),
        'server_url': 'http://5.133.102.14:5000'  # Sunucu URL'si
    },
    'database': {
        'uri': 'sqlite:////var/lib/zstok/licenses.db'  # Linux dosya yolu
    },
    'jwt': {
        'expiration_seconds': '86400'  # 24 saat
    },
    'license': {
        'default_max_activations': '1',
        'default_expiry_days': '365'
    },
    'security': {
        'password_min_length': '8',
        'failed_login_max_attempts': '5',
        'failed_login_lockout_minutes': '30',
        'allow_trial': 'True'
    }
}

def load_or_create_config():
    """Yapılandırma dosyasını yükle veya oluştur"""
    config = configparser.ConfigParser()
    
    if not CONFIG_FILE.exists():
        # Varsayılan yapılandırmayı oluştur
        for section, options in DEFAULT_CONFIG.items():
            config[section] = options
        
        # Dosyaya kaydet
        with open(CONFIG_FILE, 'w') as f:
            config.write(f)
        
        logger.info(f"Varsayılan yapılandırma dosyası oluşturuldu: {CONFIG_FILE}")
    else:
        # Mevcut yapılandırmayı yükle
        config.read(CONFIG_FILE)
        
        # Eksik bölümleri varsayılan değerlerle doldur
        for section, options in DEFAULT_CONFIG.items():
            if section not in config:
                config[section] = {}
            
            # Eksik seçenekleri varsayılan değerlerle doldur
            for option, value in options.items():
                if option not in config[section]:
                    config[section][option] = value
        
        # Güncellenmiş yapılandırmayı kaydet
        with open(CONFIG_FILE, 'w') as f:
            config.write(f)
    
    return config

# Linux için gerekli klasörleri oluştur
def create_linux_directories():
    """Linux için gerekli klasörleri oluştur"""
    dirs = [
        "/var/lib/zstok",
        "/var/log/zstok",
        "/etc/zstok",
        "/opt/zstok/license-server"
    ]
    
    for directory in dirs:
        os.makedirs(directory, exist_ok=True)
        logger.info(f"Klasör oluşturuldu veya zaten var: {directory}")

# Linux sistem başlatma işlemi
try:
    create_linux_directories()
except Exception as e:
    logger.warning(f"Klasör oluşturma işlemi başarısız olabilir: {str(e)}")

# Yapılandırmayı yükle
config = load_or_create_config()

# Flask uygulamasını başlat
app = Flask(__name__, 
            static_folder='frontend/build/static',
            template_folder='frontend/build')
CORS(app)

# Yapılandırmayı uygula
app.config['SECRET_KEY'] = config['server']['secret_key']
app.config['JWT_EXPIRATION_DELTA'] = int(config['jwt']['expiration_seconds'])
app.config['SQLALCHEMY_DATABASE_URI'] = config['database']['uri']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Veritabanı bağlantısı
db = SQLAlchemy(app)

# RSA Anahtarları için dosya yolları
PRIVATE_KEY_PATH = CONFIG_DIR / "private_key.pem"
PUBLIC_KEY_PATH = CONFIG_DIR / "public_key.pem"

# Oturum yönetimi için kullanıcı modeli
class FailedLoginAttempt(db.Model):
    """Başarısız giriş denemelerini izlemek için model"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, index=True)
    ip_address = db.Column(db.String(50), nullable=False)
    attempt_time = db.Column(db.DateTime, default=datetime.utcnow)
    user_agent = db.Column(db.String(200))

class AuditLog(db.Model):
    """Denetim günlüğü modeli"""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=True)
    username = db.Column(db.String(50), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    details = db.Column(db.Text)
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(200))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

# Veritabanı modelleri
class Customer(db.Model):
    """Müşteri veritabanı modeli"""
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True, index=True)
    phone = db.Column(db.String(20))
    company = db.Column(db.String(100))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class License(db.Model):
    """Lisans veritabanı modeli"""
    id = db.Column(db.Integer, primary_key=True)
    license_key = db.Column(db.String(50), nullable=False, unique=True, index=True)
    customer_id = db.Column(db.Integer, db.ForeignKey('customer.id'), nullable=False)
    customer = db.relationship('Customer', backref=db.backref('licenses', lazy=True))
    activation_date = db.Column(db.DateTime)
    expiry_date = db.Column(db.DateTime, nullable=False)
    edition = db.Column(db.String(50), default='standard')
    features = db.Column(db.Text)  # JSON formatında özellikler
    max_activations = db.Column(db.Integer, default=1)
    is_active = db.Column(db.Boolean, default=True)
    notes = db.Column(db.Text)
    created_by = db.Column(db.Integer, db.ForeignKey('admin_user.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Activation(db.Model):
    """Lisans aktivasyon veritabanı modeli"""
    id = db.Column(db.Integer, primary_key=True)
    license_id = db.Column(db.Integer, db.ForeignKey('license.id'), nullable=True)  # Deneme süreci için nullable
    license = db.relationship('License', backref=db.backref('activations', lazy=True), foreign_keys=[license_id])
    hardware_id = db.Column(db.String(100), nullable=False)
    activation_date = db.Column(db.DateTime, default=datetime.utcnow)
    last_check_date = db.Column(db.DateTime, default=datetime.utcnow)
    system_info = db.Column(db.Text)  # JSON formatında sistem bilgileri
    is_active = db.Column(db.Boolean, default=True)
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(200))
    is_trial = db.Column(db.Boolean, default=False)  # Deneme süreci mi?
    trial_start_date = db.Column(db.DateTime, nullable=True)  # Deneme başlangıç tarihi
    trial_hardware_hash = db.Column(db.String(128), nullable=True)  # Donanım bilgilerinin güvenli hash'i

class AdminUser(db.Model):
    """Admin kullanıcı veritabanı modeli"""
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    full_name = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    is_superadmin = db.Column(db.Boolean, default=False)
    last_login = db.Column(db.DateTime)
    lockout_until = db.Column(db.DateTime, nullable=True)
    failed_login_attempts = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
        
    def is_locked_out(self):
        if self.lockout_until and self.lockout_until > datetime.utcnow():
            return True
        return False

# RSA anahtarlarını yükle veya oluştur
def load_or_create_keys():
    """RSA anahtarlarını yükle veya yoksa oluştur"""
    try:
        if not PRIVATE_KEY_PATH.exists() or not PUBLIC_KEY_PATH.exists():
            # Yeni anahtar çifti oluştur
            private_key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048,
                backend=default_backend()
            )
            
            # Özel anahtarı kaydet
            private_pem = private_key.private_bytes(
                encoding=Encoding.PEM,
                format=PrivateFormat.PKCS8,
                encryption_algorithm=NoEncryption()
            )
            PRIVATE_KEY_PATH.write_bytes(private_pem)
            
            # Dosya izinlerini sınırla (sadece root ve grup okuyabilir)
            os.chmod(PRIVATE_KEY_PATH, 0o640)
            
            # Genel anahtarı kaydet
            public_key = private_key.public_key()
            public_pem = public_key.public_bytes(
                encoding=Encoding.PEM,
                format=PublicFormat.SubjectPublicKeyInfo
            )
            PUBLIC_KEY_PATH.write_bytes(public_pem)
            
            logger.info("Yeni RSA anahtar çifti oluşturuldu")
        
        # Anahtarları yükle
        private_key_data = PRIVATE_KEY_PATH.read_bytes()
        public_key_data = PUBLIC_KEY_PATH.read_bytes()
        
        return private_key_data, public_key_data
    except Exception as e:
        logger.error(f"RSA anahtar yönetimi hatası: {str(e)}")
        raise

# RSA anahtarlarını yükle
try:
    PRIVATE_KEY_DATA, PUBLIC_KEY_DATA = load_or_create_keys()
except Exception as e:
    logger.critical(f"RSA anahtarları yüklenemedi: {str(e)}")
    sys.exit(1)

# Denetim günlüğü ekleme fonksiyonu
def add_audit_log(action, details=None, user=None, request=None):
    """Denetim günlüğü ekle"""
    try:
        log_entry = AuditLog(
            action=action,
            details=json.dumps(details) if details else None
        )
        
        if user:
            log_entry.user_id = user.id
            log_entry.username = user.username
            
        if request:
            log_entry.ip_address = request.remote_addr
            log_entry.user_agent = request.headers.get('User-Agent', '')
            
        db.session.add(log_entry)
        db.session.commit()
        
        logger.info(f"Denetim günlüğü eklendi: {action}")
    except Exception as e:
        logger.error(f"Denetim günlüğü eklenirken hata: {str(e)}")
        db.session.rollback()

# Yardımcı Fonksiyonlar
def generate_license_key():
    """Lisans anahtarı oluştur: ZS-XXXX-XXXX-XXXX-XXXX formatında"""
    chars = string.ascii_uppercase + string.digits
    parts = ['ZS']
    for _ in range(4):
        # Her bir parça için 4 karakter oluştur
        part = ''.join(random.choice(chars) for _ in range(4))
        parts.append(part)
    
    return '-'.join(parts)

def create_signature(data):
    """Veriyi RSA ile imzala"""
    try:
        private_key = load_pem_private_key(
            PRIVATE_KEY_DATA, 
            password=None, 
            backend=default_backend()
        )
        
        signature = private_key.sign(
            data.encode(),
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        
        # Base64 ile kodla
        return base64.b64encode(signature).decode()
    except Exception as e:
        logger.error(f"İmza oluşturma hatası: {str(e)}")
        return None

# Başarısız giriş denemelerini kontrol et
def check_failed_login_attempts(username, ip_address):
    """Başarısız giriş denemelerini kontrol et"""
    max_attempts = int(config['security']['failed_login_max_attempts'])
    lockout_minutes = int(config['security']['failed_login_lockout_minutes'])
    
    # Son girişimlerin zamanını hesapla
    lockout_time = datetime.utcnow() - timedelta(minutes=lockout_minutes)
    
    # Belirli bir kullanıcı ve IP için son giriş denemeleri
    attempts = FailedLoginAttempt.query.filter(
        FailedLoginAttempt.username == username,
        FailedLoginAttempt.ip_address == ip_address,
        FailedLoginAttempt.attempt_time >= lockout_time
    ).count()
    
    return attempts >= max_attempts

# Başarısız giriş denemesi ekle
def add_failed_login_attempt(username, ip_address, user_agent=None):
    """Başarısız giriş denemesini kaydet"""
    try:
        # Hatalı oturum açma işlemini kaydet
        attempt = FailedLoginAttempt(
            username=username,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.session.add(attempt)
        
        # Kullanıcı varsa, sayacı güncelle ve gerekirse kilitle
        user = AdminUser.query.filter_by(username=username).first()
        if user:
            user.failed_login_attempts += 1
            
            # Maksimum denemeden sonra kilitle
            max_attempts = int(config['security']['failed_login_max_attempts'])
            if user.failed_login_attempts >= max_attempts:
                lockout_minutes = int(config['security']['failed_login_lockout_minutes'])
                user.lockout_until = datetime.utcnow() + timedelta(minutes=lockout_minutes)
                logger.warning(f"Kullanıcı kilitlendi: {username}, IP: {ip_address}")
                
                # Denetim günlüğüne ekle
                add_audit_log(
                    action="ACCOUNT_LOCKOUT",
                    details={"username": username, "ip_address": ip_address},
                    request=None
                )
        
        db.session.commit()
    except Exception as e:
        logger.error(f"Başarısız giriş denemesi kaydedilirken hata: {str(e)}")
        db.session.rollback()

# JWT ile kimlik doğrulama dekoratörü
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Token'ı header'dan al
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
        
        if not token:
            add_audit_log(
                action="UNAUTHORIZED_ACCESS",
                details={"path": request.path},
                request=request
            )
            return jsonify({
                'status': 'error',
                'message': 'Token gerekli'
            }), 401
        
        try:
            # Token'ı doğrula
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = AdminUser.query.filter_by(id=data['user_id']).first()
            
            if not current_user:
                add_audit_log(
                    action="INVALID_TOKEN",
                    details={"path": request.path, "decoded_token": data},
                    request=request
                )
                return jsonify({
                    'status': 'error',
                    'message': 'Geçersiz token'
                }), 401
                
            if not current_user.is_active:
                add_audit_log(
                    action="INACTIVE_USER_ACCESS",
                    details={"username": current_user.username, "path": request.path},
                    user=current_user,
                    request=request
                )
                return jsonify({
                    'status': 'error',
                    'message': 'Kullanıcı aktif değil'
                }), 401
                
            if current_user.is_locked_out():
                add_audit_log(
                    action="LOCKED_USER_ACCESS",
                    details={"username": current_user.username, "path": request.path},
                    user=current_user,
                    request=request
                )
                return jsonify({
                    'status': 'error',
                    'message': 'Hesabınız kilitlendi. Lütfen daha sonra tekrar deneyin.'
                }), 401
                
        except jwt.ExpiredSignatureError:
            add_audit_log(
                action="EXPIRED_TOKEN",
                details={"path": request.path},
                request=request
            )
            return jsonify({
                'status': 'error',
                'message': 'Token süresi dolmuş'
            }), 401
        except jwt.InvalidTokenError:
            add_audit_log(
                action="INVALID_TOKEN_FORMAT",
                details={"path": request.path},
                request=request
            )
            return jsonify({
                'status': 'error',
                'message': 'Geçersiz token'
            }), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

# Admin giriş API'si
@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """Admin kullanıcı girişi"""
    try:
        data = request.json
        
        # Gerekli alanları kontrol et
        required_fields = ['username', 'password']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Eksik alan: {field}'
                }), 400
        
        username = data['username']
        password = data['password']
        
        # IP kilitlemesini kontrol et
        if check_failed_login_attempts(username, request.remote_addr):
            add_audit_log(
                action="BLOCKED_LOGIN_ATTEMPT",
                details={"username": username, "reason": "too_many_attempts"},
                request=request
            )
            return jsonify({
                'status': 'error',
                'message': 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin.'
            }), 429
        
        # Kullanıcıyı bul
        user = AdminUser.query.filter_by(username=username).first()
        if not user or not user.check_password(password):
            add_failed_login_attempt(username, request.remote_addr, request.headers.get('User-Agent', ''))
            return jsonify({
                'status': 'error',
                'message': 'Geçersiz kullanıcı adı veya şifre'
            }), 401
        
        # Kullanıcı kilitli mi?
        if user.is_locked_out():
            add_audit_log(
                action="LOCKED_USER_LOGIN_ATTEMPT",
                details={"username": username},
                user=user,
                request=request
            )
            return jsonify({
                'status': 'error',
                'message': 'Hesabınız kilitlendi. Lütfen daha sonra tekrar deneyin.'
            }), 403
        
        if not user.is_active:
            add_audit_log(
                action="INACTIVE_USER_LOGIN_ATTEMPT",
                details={"username": username},
                user=user,
                request=request
            )
            return jsonify({
                'status': 'error',
                'message': 'Kullanıcı aktif değil'
            }), 403
        
        # Başarılı giriş - sayaçları sıfırla
        user.failed_login_attempts = 0
        user.lockout_until = None
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Denetim günlüğüne ekle
        add_audit_log(
            action="USER_LOGIN",
            details={"username": username},
            user=user,
            request=request
        )
        
        # JWT token oluştur
        token = jwt.encode({
            'user_id': user.id,
            'username': user.username,
            'is_superadmin': user.is_superadmin,
            'exp': datetime.utcnow() + timedelta(seconds=app.config['JWT_EXPIRATION_DELTA'])
        }, app.config['SECRET_KEY'], algorithm="HS256")
        
        return jsonify({
            'status': 'success',
            'message': 'Giriş başarılı',
            'token': token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'full_name': user.full_name,
                'is_superadmin': user.is_superadmin
            }
        })
        
    except Exception as e:
        logger.error(f"Giriş hatası: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Giriş işlemi sırasında bir hata oluştu: {str(e)}'
        }), 500

# Lisans doğrulama ve aktivasyon işlemleri için yardımcı fonksiyonlar
def verify_signature(data, signature):
    """İmzayı doğrula"""
    try:
        public_key = load_pem_public_key(
            PUBLIC_KEY_DATA,
            backend=default_backend()
        )
        
        # Base64 ile kodlanmış imzayı çöz
        signature_bytes = base64.b64decode(signature)
        
        # İmzayı doğrula
        public_key.verify(
            signature_bytes,
            data.encode(),
            padding.PKCS1v15(),
            hashes.SHA256()
        )
        
        return True
    except Exception as e:
        logger.error(f"İmza doğrulama hatası: {str(e)}")
        return False

def check_license_validity(license_obj, hardware_id=None):
    """Lisansın geçerliliğini kontrol et ve sonuç döndür"""
    now = datetime.utcnow()
    
    # Lisans aktif mi?
    if not license_obj.is_active:
        return {
            'valid': False,
            'message': 'Bu lisans artık aktif değil',
            'code': 'LICENSE_REVOKED'
        }
    
    # Lisans süresi dolmuş mu?
    if license_obj.expiry_date < now:
        return {
            'valid': False,
            'message': 'Lisans süresi dolmuş',
            'code': 'LICENSE_EXPIRED',
            'expiry_date': license_obj.expiry_date.isoformat()
        }
    
    # Donanım ID'si belirtilmişse, bu donanım için aktivasyon var mı kontrol et
    if hardware_id:
        activation = Activation.query.filter_by(
            license_id=license_obj.id,
            hardware_id=hardware_id,
            is_active=True
        ).first()
        
        if not activation:
            return {
                'valid': False,
                'message': 'Bu lisans bu cihaz için etkinleştirilmemiş',
                'code': 'HARDWARE_NOT_ACTIVATED'
            }
    
    # Lisans geçerli
    days_remaining = (license_obj.expiry_date - now).days
    needs_renewal = days_remaining <= 30
    
    return {
        'valid': True,
        'message': 'Lisans geçerli',
        'code': 'LICENSE_VALID',
        'days_remaining': days_remaining,
        'needs_renewal': needs_renewal,
        'expiry_date': license_obj.expiry_date.isoformat()
    }

def get_license_features(license_obj):
    """Lisans özelliklerini döndür"""
    features = []
    if license_obj.features:
        try:
            features = json.loads(license_obj.features)
        except:
            features = []
    
    # Edisyona göre varsayılan özellikleri ekle
    if license_obj.edition == 'standard':
        if 'basic_features' not in features:
            features.append('basic_features')
    elif license_obj.edition == 'professional':
        if 'basic_features' not in features:
            features.append('basic_features')
        if 'advanced_features' not in features:
            features.append('advanced_features')
    elif license_obj.edition == 'enterprise':
        if 'basic_features' not in features:
            features.append('basic_features')
        if 'advanced_features' not in features:
            features.append('advanced_features')
        if 'premium_features' not in features:
            features.append('premium_features')
    
    return features

# Otomatik lisans oluşturma API'si
@app.route('/api/admin/licenses/auto-generate', methods=['POST'])
@token_required
def admin_auto_generate_license(current_user):
    """Otomatik lisans anahtarı oluştur (Admin)"""
    try:
        data = request.json
        
        # Gerekli alanları kontrol et
        required_fields = ['edition', 'count']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Eksik alan: {field}'
                }), 400
        
        # Parametreleri al
        edition = data['edition']
        count = int(data['count'])
        customer_id = data.get('customer_id')
        expiry_days = int(data.get('expiry_days', config['license']['default_expiry_days']))
        max_activations = int(data.get('max_activations', config['license']['default_max_activations']))
        
        # Müşteriyi doğrula
        if customer_id:
            customer = Customer.query.get(customer_id)
            if not customer:
                return jsonify({
                    'status': 'error',
                    'message': 'Müşteri bulunamadı'
                }), 404
        else:
            return jsonify({
                'status': 'error',
                'message': 'Lisans oluşturmak için müşteri ID\'si gerekli'
            }), 400
        
        # Maksimum sayıyı sınırla
        if count > 100:
            return jsonify({
                'status': 'error',
                'message': 'Tek seferde en fazla 100 lisans oluşturabilirsiniz'
            }), 400
        
        # Lisans anahtarlarını oluştur
        licenses = []
        for _ in range(count):
            # Lisans anahtarı oluştur
            license_key = generate_license_key()
            
            # Son kullanma tarihi belirle
            expiry_date = datetime.utcnow() + timedelta(days=expiry_days)
            
            # Özellikleri belirle
            features = data.get('features', [])
            if isinstance(features, list):
                features_json = json.dumps(features)
            else:
                features_json = '[]'
            
            # Yeni lisans oluştur
            new_license = License(
                license_key=license_key,
                customer_id=customer.id,
                expiry_date=expiry_date,
                edition=edition,
                features=features_json,
                max_activations=max_activations,
                is_active=True,
                created_by=current_user.id,
                notes=data.get('notes')
            )
            
            db.session.add(new_license)
            
            # Lisans bilgilerini listeye ekle
            licenses.append({
                'license_key': license_key,
                'customer_id': customer.id,
                'customer_name': customer.name,
                'expiry_date': expiry_date.isoformat(),
                'edition': edition
            })
        
        db.session.commit()
        
        # Denetim günlüğüne ekle
        add_audit_log(
            action="AUTO_GENERATE_LICENSES",
            details={
                "count": count, 
                "edition": edition, 
                "customer_id": customer_id,
                "customer_name": customer.name
            },
            user=current_user,
            request=request
        )
        
        # Başarılı yanıt döndür
        return jsonify({
            'status': 'success',
            'message': f'{count} adet lisans başarıyla oluşturuldu',
            'licenses': licenses
        })
        
    except Exception as e:
        logger.error(f"Otomatik lisans oluşturma hatası: {str(e)}")
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Lisans oluşturma işlemi sırasında bir hata oluştu: {str(e)}'
        }), 500

@app.route('/api/v1/activate', methods=['POST'])
def activate_license():
    """Lisans aktivasyon API'si"""
    try:
        data = request.json
        
        # Gerekli alanları kontrol et
        required_fields = ['license_key', 'email', 'hardware_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Eksik alan: {field}'
                }), 400
        
        license_key = data['license_key']
        email = data['email']
        hardware_id = data['hardware_id']
        
        # Lisansı veritabanında bul
        license_obj = License.query.filter_by(license_key=license_key).first()
        if not license_obj:
            return jsonify({
                'status': 'error',
                'message': 'Geçersiz lisans anahtarı'
            }), 404
        
        # Müşteriyi bul
        customer = Customer.query.get(license_obj.customer_id)
        if not customer or customer.email.lower() != email.lower():
            return jsonify({
                'status': 'error',
                'message': 'Lisans anahtarı bu e-posta ile eşleşmiyor'
            }), 403
        
        # Lisansın geçerliliğini kontrol et
        validity = check_license_validity(license_obj)
        if not validity['valid']:
            return jsonify({
                'status': 'error',
                'message': validity['message'],
                'code': validity['code']
            }), 403
        
        # Bu donanım için daha önce aktivasyon yapılmış mı kontrol et
        existing_activation = Activation.query.filter_by(
            license_id=license_obj.id,
            hardware_id=hardware_id
        ).first()
        
        # Aktif aktivasyon sayısını kontrol et
        active_activations = Activation.query.filter_by(
            license_id=license_obj.id, 
            is_active=True
        ).count()
        
        now = datetime.utcnow()
        
        if existing_activation:
            # Zaten aktif mi kontrol et
            if existing_activation.is_active:
                # Yeniden etkinleştiriliyor, son kontrol tarihini güncelle
                existing_activation.last_check_date = now
                
                # Sistem bilgilerini güncelle
                if 'system_info' in data:
                    existing_activation.system_info = json.dumps(data['system_info'])
                
                # IP ve User Agent güncelle
                existing_activation.ip_address = request.remote_addr
                existing_activation.user_agent = request.headers.get('User-Agent', '')
                
                db.session.commit()
                
            else:
                # Deaktive edilmiş bir aktivasyonu yeniden etkinleştir
                if active_activations >= license_obj.max_activations:
                    return jsonify({
                        'status': 'error',
                        'message': f'Maksimum aktivasyon sayısına ulaşıldı ({license_obj.max_activations})',
                        'code': 'MAX_ACTIVATIONS_REACHED'
                    }), 403
                
                # Aktivasyonu yeniden etkinleştir
                existing_activation.is_active = True
                existing_activation.activation_date = now
                existing_activation.last_check_date = now
                
                # Sistem bilgilerini güncelle
                if 'system_info' in data:
                    existing_activation.system_info = json.dumps(data['system_info'])
                
                # IP ve User Agent güncelle
                existing_activation.ip_address = request.remote_addr
                existing_activation.user_agent = request.headers.get('User-Agent', '')
                
                db.session.commit()
        else:
            # Yeni bir aktivasyon
            if active_activations >= license_obj.max_activations:
                return jsonify({
                    'status': 'error',
                    'message': f'Maksimum aktivasyon sayısına ulaşıldı ({license_obj.max_activations})',
                    'code': 'MAX_ACTIVATIONS_REACHED'
                }), 403
            
            # Yeni aktivasyon kaydı oluştur
            new_activation = Activation(
                license_id=license_obj.id,
                hardware_id=hardware_id,
                activation_date=now,
                last_check_date=now,
                is_active=True,
                ip_address=request.remote_addr,
                user_agent=request.headers.get('User-Agent', '')
            )
            
            # Sistem bilgilerini kaydet
            if 'system_info' in data:
                new_activation.system_info = json.dumps(data['system_info'])
            
            db.session.add(new_activation)
            
            # İlk aktivasyon ise lisansın aktivasyon tarihini güncelle
            if not license_obj.activation_date:
                license_obj.activation_date = now
            
            db.session.commit()
        
        # İstemciye gönderilecek lisans bilgilerini hazırla
        validation_string = (
            license_obj.license_key + 
            str(license_obj.customer_id) + 
            hardware_id + 
            license_obj.expiry_date.isoformat()
        )
        
        signature = create_signature(validation_string)
        
        # Lisans özelliklerini al
        features = get_license_features(license_obj)
        
        # Lisans verisini oluştur
        license_data = {
            'license_key': license_obj.license_key,
            'customer_id': str(license_obj.customer_id),
            'customer_name': customer.name,
            'customer_email': customer.email,
            'activation_date': datetime.utcnow().isoformat(),
            'expiry_date': license_obj.expiry_date.isoformat(),
            'hardware_id': hardware_id,
            'edition': license_obj.edition,
            'features': features,
            'signature': signature,
            'days_remaining': validity['days_remaining'],
            'needs_renewal': validity['needs_renewal']
        }
        
        # İşlemi logla
        logger.info(f"Lisans etkinleştirildi - Key: {license_key}, Müşteri: {customer.name}, IP: {request.remote_addr}")
        
        # Başarılı yanıt döndür
        return jsonify({
            'status': 'success',
            'message': 'Lisans başarıyla etkinleştirildi',
            'license_data': license_data
        })
        
    except Exception as e:
        logger.error(f"Lisans aktivasyon hatası: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lisans etkinleştirme işlemi sırasında bir hata oluştu: {str(e)}'
        }), 500

@app.route('/api/v1/validate', methods=['POST'])
def validate_license():
    """Lisans doğrulama API'si"""
    try:
        data = request.json
        
        # Gerekli alanları kontrol et
        required_fields = ['license_key', 'hardware_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Eksik alan: {field}'
                }), 400
        
        license_key = data['license_key']
        hardware_id = data['hardware_id']
        
        # İmza kontrolü (opsiyonel)
        if 'signature' in data and 'validation_string' in data:
            # İmzayı doğrula
            is_valid = verify_signature(data['validation_string'], data['signature'])
            if not is_valid:
                return jsonify({
                    'status': 'invalid',
                    'message': 'Geçersiz imza',
                    'code': 'INVALID_SIGNATURE'
                })
        
        # Lisansı veritabanında bul
        license_obj = License.query.filter_by(license_key=license_key).first()
        if not license_obj:
            return jsonify({
                'status': 'invalid',
                'message': 'Geçersiz lisans anahtarı',
                'code': 'INVALID_LICENSE'
            })
        
        # Lisansın geçerliliğini kontrol et
        validity = check_license_validity(license_obj, hardware_id)
        if not validity['valid']:
            return jsonify({
                'status': 'invalid',
                'message': validity['message'],
                'code': validity['code']
            })
        
        # Son kontrol tarihini güncelle
        activation = Activation.query.filter_by(
            license_id=license_obj.id,
            hardware_id=hardware_id,
            is_active=True
        ).first()
        
        if activation:
            activation.last_check_date = datetime.utcnow()
        db.session.commit()
        
        # Lisans geçerli, müşteriyi bul
        customer = Customer.query.get(license_obj.customer_id)
        
        # Müşteri, lisans ve aktivasyon bilgilerini logla
        logger.info(f"Lisans doğrulandı - Key: {license_key}, Müşteri: {customer.name}, IP: {request.remote_addr}")
        
        # İstemciye yanıt döndür
        return jsonify({
            'status': 'valid',
            'message': 'Lisans geçerli',
            'days_remaining': validity['days_remaining'],
            'needs_renewal': validity['needs_renewal'],
            'expiry_date': validity['expiry_date']
        })
        
    except Exception as e:
        logger.error(f"Lisans doğrulama hatası: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lisans doğrulama işlemi sırasında bir hata oluştu: {str(e)}'
        }), 500

@app.route('/api/v1/deactivate', methods=['POST'])
def deactivate_license():
    """Lisans deaktivasyon API'si"""
    try:
        data = request.json
        
        # Gerekli alanları kontrol et
        required_fields = ['license_key', 'hardware_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Eksik alan: {field}'
                }), 400
        
        license_key = data['license_key']
        hardware_id = data['hardware_id']
        
        # Lisansı veritabanında bul
        license_obj = License.query.filter_by(license_key=license_key).first()
        if not license_obj:
            return jsonify({
                'status': 'error',
                'message': 'Geçersiz lisans anahtarı'
            }), 404
        
        # Bu donanım için aktivasyon var mı kontrol et
        activation = Activation.query.filter_by(
            license_id=license_obj.id,
            hardware_id=hardware_id,
            is_active=True
        ).first()
        
        if not activation:
            return jsonify({
                'status': 'error',
                'message': 'Bu lisans bu cihaz için etkinleştirilmemiş'
            }), 404
        
        # Aktivasyonu deaktive et
        activation.is_active = False
        db.session.commit()
        
        # Müşteri bilgilerini logla
        customer = Customer.query.get(license_obj.customer_id)
        logger.info(f"Lisans deaktive edildi - Key: {license_key}, Müşteri: {customer.name}, IP: {request.remote_addr}")
        
        # Başarılı yanıt döndür
        return jsonify({
            'status': 'success',
            'message': 'Lisans başarıyla deaktive edildi'
        })
        
    except Exception as e:
        logger.error(f"Lisans deaktivasyon hatası: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lisans deaktivasyon işlemi sırasında bir hata oluştu: {str(e)}'
        }), 500

# Admin API'leri - JWT ile korunuyor
@app.route('/api/admin/licenses/create', methods=['POST'])
@token_required
def admin_create_license(current_user):
    """Yeni lisans oluştur (Admin)"""
    try:
        data = request.json
        
        # Gerekli alanları kontrol et
        required_fields = ['customer_email', 'expiry_days', 'edition']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Eksik alan: {field}'
                }), 400
        
        customer_email = data['customer_email']
        expiry_days = int(data['expiry_days'])
        edition = data['edition']
        
        # Müşteriyi kontrol et veya oluştur
        customer = Customer.query.filter_by(email=customer_email).first()
        if not customer:
            # Yeni müşteri oluştur
            if 'customer_name' not in data:
                return jsonify({
                    'status': 'error',
                    'message': 'Yeni müşteri için isim gerekli'
                }), 400
            
            customer = Customer(
                name=data['customer_name'],
                email=customer_email,
                phone=data.get('customer_phone', ''),
                company=data.get('customer_company', '')
            )
            db.session.add(customer)
            db.session.commit()
        
        # Lisans anahtarı oluştur
        license_key = generate_license_key()
        
        # Son kullanma tarihi belirle
        expiry_date = datetime.utcnow() + timedelta(days=expiry_days)
        
        # Özellikleri belirle
        features = data.get('features', [])
        if isinstance(features, list):
            features_json = json.dumps(features)
        else:
            features_json = '[]'
        
        # Maksimum aktivasyon sayısı
        max_activations = int(data.get('max_activations', 1))
        
        # Yeni lisans oluştur
        new_license = License(
            license_key=license_key,
            customer_id=customer.id,
            expiry_date=expiry_date,
            edition=edition,
            features=features_json,
            max_activations=max_activations,
            is_active=True
        )
        
        db.session.add(new_license)
        db.session.commit()
        
        # Başarılı yanıt döndür
        return jsonify({
            'status': 'success',
            'message': 'Yeni lisans başarıyla oluşturuldu',
            'license_key': license_key,
            'customer_id': customer.id,
            'customer_name': customer.name,
            'expiry_date': expiry_date.isoformat(),
            'edition': edition
        })
        
    except Exception as e:
        logger.error(f"Lisans oluşturma hatası: {str(e)}")
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Lisans oluşturma işlemi sırasında bir hata oluştu: {str(e)}'
        }), 500

@app.route('/api/admin/licenses/revoke', methods=['POST'])
@token_required
def admin_revoke_license(current_user):
    """Lisansı iptal et (Admin)"""
    try:
        data = request.json
        
        # Gerekli alanları kontrol et
        if 'license_key' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Lisans anahtarı gerekli'
            }), 400
        
        license_key = data['license_key']
        
        # Lisansı bul
        license_obj = License.query.filter_by(license_key=license_key).first()
        if not license_obj:
            return jsonify({
                'status': 'error',
                'message': 'Lisans bulunamadı'
            }), 404
        
        # Lisansı iptal et
        license_obj.is_active = False
        
        # Tüm aktivasyonları iptal et
        for activation in license_obj.activations:
            activation.is_active = False
        
        db.session.commit()
        
        # İşlemi logla
        logger.info(f"Lisans iptal edildi - Key: {license_key}, Admin: {current_user.username}")
        
        # Başarılı yanıt döndür
        return jsonify({
            'status': 'success',
            'message': 'Lisans başarıyla iptal edildi'
        })
        
    except Exception as e:
        logger.error(f"Lisans iptal hatası: {str(e)}")
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Lisans iptal işlemi sırasında bir hata oluştu: {str(e)}'
        }), 500

@app.route('/api/admin/licenses/extend', methods=['POST'])
@token_required
def admin_extend_license(current_user):
    """Lisans süresini uzat (Admin)"""
    try:
        data = request.json
        
        # Gerekli alanları kontrol et
        required_fields = ['license_key', 'days']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Eksik alan: {field}'
                }), 400
        
        license_key = data['license_key']
        days = int(data['days'])
        
        # Lisansı bul
        license_obj = License.query.filter_by(license_key=license_key).first()
        if not license_obj:
            return jsonify({
                'status': 'error',
                'message': 'Lisans bulunamadı'
            }), 404
        
        # Süreyi uzat
        if license_obj.expiry_date < datetime.utcnow():
            # Süresi dolmuşsa şu anki tarihten itibaren uzat
            license_obj.expiry_date = datetime.utcnow() + timedelta(days=days)
        else:
            # Süresi dolmamışsa mevcut son kullanma tarihine ekle
            license_obj.expiry_date = license_obj.expiry_date + timedelta(days=days)
        
        # Lisansı aktifleştir (eğer iptal edilmişse)
        license_obj.is_active = True
        
        db.session.commit()
        
        # İşlemi logla
        logger.info(f"Lisans süresi uzatıldı - Key: {license_key}, Gün: {days}, Admin: {current_user.username}")
        
        # Başarılı yanıt döndür
        return jsonify({
            'status': 'success',
            'message': f'Lisans süresi {days} gün uzatıldı',
            'new_expiry_date': license_obj.expiry_date.isoformat()
        })
        
    except Exception as e:
        logger.error(f"Lisans süre uzatma hatası: {str(e)}")
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'Lisans süre uzatma işlemi sırasında bir hata oluştu: {str(e)}'
        }), 500

# Yeni admin API'leri
@app.route('/api/admin/licenses/list', methods=['GET'])
@token_required
def admin_list_licenses(current_user):
    """Tüm lisansları listele (Admin)"""
    try:
        # Sayfalama parametreleri
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Filtreleme parametreleri
        customer_email = request.args.get('customer_email')
        is_active = request.args.get('is_active')
        edition = request.args.get('edition')
        
        # Sorguyu oluştur
        query = License.query
        
        # Filtreleri uygula
        if customer_email:
            customers = Customer.query.filter(Customer.email.like(f'%{customer_email}%')).all()
            customer_ids = [c.id for c in customers]
            query = query.filter(License.customer_id.in_(customer_ids))
        
        if is_active is not None:
            is_active_bool = is_active.lower() == 'true'
            query = query.filter_by(is_active=is_active_bool)
            
        if edition:
            query = query.filter_by(edition=edition)
        
        # Sayfalama uygula
        licenses_page = query.order_by(License.created_at.desc()).paginate(page=page, per_page=per_page)
        
        # Sonuçları hazırla
        licenses_list = []
        for license_obj in licenses_page.items:
            customer = Customer.query.get(license_obj.customer_id)
            active_activations = Activation.query.filter_by(
                license_id=license_obj.id, 
                is_active=True
            ).count()
            
            licenses_list.append({
                'id': license_obj.id,
                'license_key': license_obj.license_key,
                'customer_name': customer.name if customer else 'Bilinmeyen',
                'customer_email': customer.email if customer else 'Bilinmeyen',
                'activation_date': license_obj.activation_date.isoformat() if license_obj.activation_date else None,
                'expiry_date': license_obj.expiry_date.isoformat(),
                'edition': license_obj.edition,
                'is_active': license_obj.is_active,
                'active_activations': active_activations,
                'max_activations': license_obj.max_activations,
                'created_at': license_obj.created_at.isoformat()
            })
        
        # Yanıt döndür
        return jsonify({
            'status': 'success',
            'licenses': licenses_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': licenses_page.total,
                'pages': licenses_page.pages
            }
        })
        
    except Exception as e:
        logger.error(f"Lisans listeleme hatası: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Lisans listeleme işlemi sırasında bir hata oluştu: {str(e)}'
        }), 500

@app.route('/api/admin/customers/list', methods=['GET'])
@token_required
def admin_list_customers(current_user):
    """Tüm müşterileri listele (Admin)"""
    try:
        # Sayfalama parametreleri
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Filtreleme parametreleri
        email = request.args.get('email')
        name = request.args.get('name')
        
        # Sorguyu oluştur
        query = Customer.query
        
        # Filtreleri uygula
        if email:
            query = query.filter(Customer.email.like(f'%{email}%'))
            
        if name:
            query = query.filter(Customer.name.like(f'%{name}%'))
        
        # Sayfalama uygula
        customers_page = query.order_by(Customer.created_at.desc()).paginate(page=page, per_page=per_page)
        
        # Sonuçları hazırla
        customers_list = []
        for customer in customers_page.items:
            # Müşterinin aktif lisans sayısını bul
            active_licenses = License.query.filter_by(
                customer_id=customer.id, 
                is_active=True
            ).count()
            
            customers_list.append({
                'id': customer.id,
                'name': customer.name,
                'email': customer.email,
                'phone': customer.phone,
                'company': customer.company,
                'active_licenses': active_licenses,
                'created_at': customer.created_at.isoformat()
            })
        
        # Yanıt döndür
        return jsonify({
            'status': 'success',
            'customers': customers_list,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': customers_page.total,
                'pages': customers_page.pages
            }
        })
        
    except Exception as e:
        logger.error(f"Müşteri listeleme hatası: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Müşteri listeleme işlemi sırasında bir hata oluştu: {str(e)}'
        }), 500

# Lisans istatistikleri ve raporlama API'leri
@app.route('/api/admin/dashboard/stats', methods=['GET'])
@token_required
def admin_dashboard_stats(current_user):
    """Dashboard istatistiklerini döndür (Admin)"""
    try:
        # Toplam müşteri sayısı
        total_customers = Customer.query.count()
        
        # Toplam lisans sayısı
        total_licenses = License.query.count()
        
        # Aktif lisans sayısı
        active_licenses = License.query.filter_by(is_active=True).count()
        
        # Süresi dolmuş lisans sayısı
        now = datetime.utcnow()
        expired_licenses = License.query.filter(
            License.expiry_date < now
        ).count()
        
        # Toplam aktivasyon sayısı
        total_activations = Activation.query.count()
        
        # Aktif aktivasyon sayısı
        active_activations = Activation.query.filter_by(is_active=True).count()
        
        # Son 30 gündeki yeni lisanslar
        thirty_days_ago = now - timedelta(days=30)
        new_licenses_30d = License.query.filter(
            License.created_at > thirty_days_ago
        ).count()
        
        # Son 30 gündeki yeni müşteriler
        new_customers_30d = Customer.query.filter(
            Customer.created_at > thirty_days_ago
        ).count()
        
        # Son 30 gündeki yeni aktivasyonlar
        new_activations_30d = Activation.query.filter(
            Activation.activation_date > thirty_days_ago
        ).count()
        
        # Edisyonlara göre lisans dağılımı
        edition_stats = db.session.query(
            License.edition, 
            db.func.count(License.id)
        ).group_by(License.edition).all()
        
        edition_distribution = {edition: count for edition, count in edition_stats}
        
        # 30 gün içinde süresi dolacak lisanslar
        expiring_soon = License.query.filter(
            License.expiry_date > now,
            License.expiry_date < now + timedelta(days=30),
            License.is_active == True
        ).count()
        
        # Deneme süreci istatistikleri
        total_trials = Activation.query.filter_by(is_trial=True).count()
        active_trials = Activation.query.filter_by(is_trial=True, is_active=True).count()
        
        # Son 30 gündeki yeni deneme süreçleri
        new_trials_30d = Activation.query.filter(
            Activation.is_trial == True,
            Activation.trial_start_date > thirty_days_ago
        ).count()
        
        # Deneme sürecinden tam lisansa geçiş oranı
        # (Deneme süreci başlatan donanımlar için tam lisans aktivasyonu yapılmış olanların oranı)
        trial_hardware_ids = db.session.query(Activation.hardware_id).filter(
            Activation.is_trial == True
        ).distinct().all()
        
        trial_hardware_ids = [item[0] for item in trial_hardware_ids]
        
        converted_trials = 0
        if trial_hardware_ids:
            converted_trials = Activation.query.filter(
                Activation.hardware_id.in_(trial_hardware_ids),
                Activation.is_trial == False
            ).distinct(Activation.hardware_id).count()
        
        conversion_rate = 0
        if total_trials > 0:
            conversion_rate = round((converted_trials / total_trials) * 100, 2)
        
        # İstatistikleri döndür
        return jsonify({
            'status': 'success',
            'stats': {
                'total_customers': total_customers,
                'total_licenses': total_licenses,
                'active_licenses': active_licenses,
                'expired_licenses': expired_licenses,
                'total_activations': total_activations,
                'active_activations': active_activations,
                'new_licenses_30d': new_licenses_30d,
                'new_customers_30d': new_customers_30d,
                'new_activations_30d': new_activations_30d,
                'edition_distribution': edition_distribution,
                'expiring_soon': expiring_soon,
                'trial': {
                    'total_trials': total_trials,
                    'active_trials': active_trials,
                    'new_trials_30d': new_trials_30d,
                    'converted_trials': converted_trials,
                    'conversion_rate': conversion_rate
                }
            }
        })
        
    except Exception as e:
        logger.error(f"İstatistik hatası: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'İstatistik oluşturma sırasında bir hata oluştu: {str(e)}'
        }), 500

@app.route('/api/admin/reports/licenses', methods=['GET'])
@token_required
def admin_license_report(current_user):
    """Lisans raporu oluştur (Admin)"""
    try:
        # Rapor tipi
        report_type = request.args.get('type', 'all')
        
        # Sorguyu oluştur
        query = License.query
        
        # Rapor tipine göre filtrele
        now = datetime.utcnow()
        if report_type == 'active':
            query = query.filter_by(is_active=True)
        elif report_type == 'expired':
            query = query.filter(License.expiry_date < now)
        elif report_type == 'expiring_soon':
            query = query.filter(
                License.expiry_date > now,
                License.expiry_date < now + timedelta(days=30),
                License.is_active == True
            )
        
        # Lisansları al
        licenses = query.all()
        
        # Rapor verilerini hazırla
        report_data = []
        for license_obj in licenses:
            customer = Customer.query.get(license_obj.customer_id)
            active_activations = Activation.query.filter_by(
                license_id=license_obj.id, 
                is_active=True
            ).count()
            
            # Lisans özelliklerini al
            features = []
            if license_obj.features:
                try:
                    features = json.loads(license_obj.features)
                except:
                    features = []
            
            report_data.append({
                'license_key': license_obj.license_key,
                'customer_name': customer.name if customer else 'Bilinmeyen',
                'customer_email': customer.email if customer else 'Bilinmeyen',
                'customer_company': customer.company if customer else '',
                'activation_date': license_obj.activation_date.isoformat() if license_obj.activation_date else None,
                'expiry_date': license_obj.expiry_date.isoformat(),
                'edition': license_obj.edition,
                'features': features,
                'is_active': license_obj.is_active,
                'active_activations': active_activations,
                'max_activations': license_obj.max_activations,
                'created_at': license_obj.created_at.isoformat()
            })
        
        # Raporu döndür
        return jsonify({
            'status': 'success',
            'report_type': report_type,
            'generated_at': now.isoformat(),
            'total_records': len(report_data),
            'data': report_data
        })
        
    except Exception as e:
        logger.error(f"Rapor oluşturma hatası: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Rapor oluşturma sırasında bir hata oluştu: {str(e)}'
        }), 500

@app.route('/api/admin/reports/activations', methods=['GET'])
@token_required
def admin_activation_report(current_user):
    """Aktivasyon raporu oluştur (Admin)"""
    try:
        # Rapor tipi
        report_type = request.args.get('type', 'all')
        license_key = request.args.get('license_key')
        
        # Sorguyu oluştur
        query = Activation.query
        
        # Lisans anahtarına göre filtrele
        if license_key:
            license_obj = License.query.filter_by(license_key=license_key).first()
            if license_obj:
                query = query.filter_by(license_id=license_obj.id)
            else:
                return jsonify({
                    'status': 'error',
                    'message': 'Geçersiz lisans anahtarı'
                }), 404
        
        # Rapor tipine göre filtrele
        if report_type == 'active':
            query = query.filter_by(is_active=True)
        elif report_type == 'inactive':
            query = query.filter_by(is_active=False)
        
        # Aktivasyonları al
        activations = query.all()
        
        # Rapor verilerini hazırla
        report_data = []
        for activation in activations:
            license_obj = License.query.get(activation.license_id)
            customer = None
            if license_obj:
                customer = Customer.query.get(license_obj.customer_id)
            
            # Sistem bilgilerini al
            system_info = {}
            if activation.system_info:
                try:
                    system_info = json.loads(activation.system_info)
                except:
                    system_info = {}
            
            report_data.append({
                'id': activation.id,
                'license_key': license_obj.license_key if license_obj else 'Bilinmeyen',
                'customer_name': customer.name if customer else 'Bilinmeyen',
                'customer_email': customer.email if customer else 'Bilinmeyen',
                'hardware_id': activation.hardware_id,
                'activation_date': activation.activation_date.isoformat(),
                'last_check_date': activation.last_check_date.isoformat(),
                'is_active': activation.is_active,
                'ip_address': activation.ip_address,
                'user_agent': activation.user_agent,
                'system_info': system_info
            })
        
        # Raporu döndür
        now = datetime.utcnow()
        return jsonify({
            'status': 'success',
            'report_type': report_type,
            'license_key': license_key,
            'generated_at': now.isoformat(),
            'total_records': len(report_data),
            'data': report_data
        })
        
    except Exception as e:
        logger.error(f"Aktivasyon raporu oluşturma hatası: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Aktivasyon raporu oluşturma sırasında bir hata oluştu: {str(e)}'
        }), 500

@app.route('/api/admin/reports/trials', methods=['GET'])
@token_required
def admin_trial_report(current_user):
    """Deneme süreci raporu oluştur (Admin)"""
    try:
        # Rapor tipi
        report_type = request.args.get('type', 'all')
        
        # Sorguyu oluştur
        query = Activation.query.filter_by(is_trial=True)
        
        # Rapor tipine göre filtrele
        now = datetime.utcnow()
        if report_type == 'active':
            query = query.filter_by(is_active=True)
        elif report_type == 'expired':
            query = query.filter(
                Activation.trial_start_date + timedelta(days=7) < now
            )
        elif report_type == 'expiring_soon':
            query = query.filter(
                Activation.is_active == True,
                Activation.trial_start_date + timedelta(days=7) > now,
                Activation.trial_start_date + timedelta(days=7) < now + timedelta(days=2)
            )
        
        # Aktivasyonları al
        trials = query.all()
        
        # Rapor verilerini hazırla
        report_data = []
        for trial in trials:
            # Deneme süresi hesapla
            trial_end_date = trial.trial_start_date + timedelta(days=7)
            days_remaining = max(0, (trial_end_date - now).days)
            is_expired = trial_end_date < now
            
            # Sistem bilgilerini al
            system_info = {}
            if trial.system_info:
                try:
                    system_info = json.loads(trial.system_info)
                except:
                    system_info = {}
            
            report_data.append({
                'id': trial.id,
                'hardware_id': trial.hardware_id,
                'hardware_hash': trial.trial_hardware_hash,
                'start_date': trial.trial_start_date.isoformat(),
                'end_date': trial_end_date.isoformat(),
                'days_remaining': days_remaining,
                'is_active': trial.is_active,
                'is_expired': is_expired,
                'last_check_date': trial.last_check_date.isoformat(),
                'ip_address': trial.ip_address,
                'user_agent': trial.user_agent,
                'system_info': system_info
            })
        
        # Raporu döndür
        return jsonify({
            'status': 'success',
            'report_type': report_type,
            'generated_at': now.isoformat(),
            'total_records': len(report_data),
            'data': report_data
        })
        
    except Exception as e:
        logger.error(f"Deneme süreci raporu oluşturma hatası: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Deneme süreci raporu oluşturma sırasında bir hata oluştu: {str(e)}'
        }), 500

# Frontend için route'lar
@app.route('/')
def serve_frontend():
    """Ana sayfa - React uygulamasını sun"""
    return render_template('index.html')

@app.route('/favicon.ico')
def favicon():
    """Favicon için route"""
    return send_from_directory(app.template_folder, 'favicon.ico')

@app.route('/manifest.json')
def manifest():
    """Manifest dosyası için route"""
    return send_from_directory(app.template_folder, 'manifest.json')

@app.route('/static/<path:path>')
def serve_static(path):
    """Statik dosyaları sun"""
    return send_from_directory(app.static_folder, path)

@app.route('/<path:path>')
def catch_all(path):
    """Tüm diğer route'ları React uygulamasına yönlendir"""
    return render_template('index.html')

# Ana uygulama başlatma kodu
def init_db():
    """Veritabanını oluştur ve varsayılan admin kullanıcısını ekle"""
    with app.app_context():
        db.create_all()
        
        # Admin kullanıcısı var mı kontrol et
        admin = AdminUser.query.filter_by(username='admin').first()
        if not admin:
            # Varsayılan admin kullanıcısı oluştur
            admin = AdminUser(
                username='admin',
                email='admin@zstok.com'
            )
            admin.set_password('admin123')  # Gerçek uygulamada daha güçlü bir şifre kullanın
            db.session.add(admin)
            db.session.commit()
            logger.info("Varsayılan admin kullanıcısı oluşturuldu")

# Deneme süreci için yardımcı fonksiyonlar
def generate_hardware_hash(hardware_id, system_info=None):
    """Donanım bilgilerinden benzersiz ve sıfırlanamaz bir hash oluştur"""
    # Temel olarak hardware_id kullanılır
    base_data = hardware_id
    
    # Eğer sistem bilgileri varsa, bunları da ekle
    if system_info:
        if isinstance(system_info, str):
            try:
                system_info = json.loads(system_info)
            except:
                system_info = {}
        
        # Önemli donanım bilgilerini seç (CPU, anakart, disk seri numarası gibi)
        important_keys = ['cpu_id', 'motherboard_serial', 'disk_serial', 'mac_address']
        for key in important_keys:
            if key in system_info:
                base_data += str(system_info[key])
    
    # Sabit bir tuz ekle (gerçek uygulamada bu gizli bir değer olmalı)
    salt = "ZStok_Trial_Salt_8X4tP9zQ"
    
    # Hash oluştur
    hash_data = (base_data + salt).encode()
    return hashlib.sha256(hash_data).hexdigest()

def check_trial_eligibility(hardware_id, system_info=None):
    """Belirli bir donanımın deneme sürecine uygun olup olmadığını kontrol et"""
    # Donanım hash'i oluştur
    hardware_hash = generate_hardware_hash(hardware_id, system_info)
    
    # Bu hash ile daha önce deneme süreci başlatılmış mı kontrol et
    existing_trial = Activation.query.filter_by(
        trial_hardware_hash=hardware_hash,
        is_trial=True
    ).first()
    
    if existing_trial:
        # Deneme süreci daha önce başlatılmış
        now = datetime.utcnow()
        trial_end_date = existing_trial.trial_start_date + timedelta(days=7)
        
        # Deneme süresi dolmuş mu?
        if now > trial_end_date:
            return {
                'eligible': False,
                'message': 'Bu cihaz için deneme süresi dolmuş',
                'code': 'TRIAL_EXPIRED',
                'activation': existing_trial
            }
        else:
            # Deneme süresi devam ediyor
            days_remaining = (trial_end_date - now).days
            return {
                'eligible': True,
                'message': f'Deneme süresi devam ediyor, {days_remaining} gün kaldı',
                'code': 'TRIAL_ACTIVE',
                'activation': existing_trial,
                'days_remaining': days_remaining
            }
    else:
        # Yeni deneme süreci başlatılabilir
        return {
            'eligible': True,
            'message': 'Deneme süreci başlatılabilir',
            'code': 'TRIAL_ELIGIBLE',
            'hardware_hash': hardware_hash
        }

def start_trial(hardware_id, system_info=None):
    """Yeni bir deneme süreci başlat"""
    # Uygunluk kontrolü yap
    eligibility = check_trial_eligibility(hardware_id, system_info)
    
    if not eligibility['eligible']:
        return eligibility
    
    if eligibility['code'] == 'TRIAL_ACTIVE':
        # Zaten aktif bir deneme süreci var
        return eligibility
    
    # Yeni deneme süreci başlat
    now = datetime.utcnow()
    new_trial = Activation(
        hardware_id=hardware_id,
        activation_date=now,
        last_check_date=now,
        is_active=True,
        is_trial=True,
        trial_start_date=now,
        trial_hardware_hash=eligibility['hardware_hash'],
        ip_address=request.remote_addr if request else None,
        user_agent=request.headers.get('User-Agent', '') if request else None
    )
    
    # Sistem bilgilerini kaydet
    if system_info:
        if isinstance(system_info, dict):
            new_trial.system_info = json.dumps(system_info)
        else:
            new_trial.system_info = system_info
    
    db.session.add(new_trial)
    db.session.commit()
    
    # Başarılı yanıt döndür
    return {
        'eligible': True,
        'message': 'Deneme süreci başlatıldı',
        'code': 'TRIAL_STARTED',
        'activation': new_trial,
        'days_remaining': 7
    }

def check_trial_validity(hardware_id, system_info=None):
    """Deneme sürecinin geçerliliğini kontrol et"""
    # Donanım hash'i oluştur
    hardware_hash = generate_hardware_hash(hardware_id, system_info)
    
    # Bu hash ile aktif deneme süreci var mı kontrol et
    trial = Activation.query.filter_by(
        trial_hardware_hash=hardware_hash,
        is_trial=True,
        is_active=True
    ).first()
    
    if not trial:
        return {
            'valid': False,
            'message': 'Bu cihaz için aktif deneme süreci bulunamadı',
            'code': 'TRIAL_NOT_FOUND'
        }
    
    # Deneme süresinin geçerliliğini kontrol et
    now = datetime.utcnow()
    trial_end_date = trial.trial_start_date + timedelta(days=7)
    
    if now > trial_end_date:
        # Deneme süresi dolmuş, deaktive et
        trial.is_active = False
        db.session.commit()
        
        return {
            'valid': False,
            'message': 'Deneme süresi dolmuş',
            'code': 'TRIAL_EXPIRED'
        }
    
    # Deneme süresi geçerli
    days_remaining = (trial_end_date - now).days
    hours_remaining = int((trial_end_date - now).total_seconds() / 3600)
    
    # Son kontrol tarihini güncelle
    trial.last_check_date = now
    db.session.commit()
    
    return {
        'valid': True,
        'message': 'Deneme süresi geçerli',
        'code': 'TRIAL_VALID',
        'days_remaining': days_remaining,
        'hours_remaining': hours_remaining,
        'trial_end_date': trial_end_date.isoformat()
    }

# Deneme süreci API'leri
@app.route('/api/v1/trial/start', methods=['POST'])
def start_trial_api():
    """Deneme süreci başlatma API'si"""
    try:
        data = request.json
        
        # Gerekli alanları kontrol et
        required_fields = ['hardware_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Eksik alan: {field}'
                }), 400
        
        hardware_id = data['hardware_id']
        system_info = data.get('system_info', {})
        
        # Deneme sürecini başlat
        result = start_trial(hardware_id, system_info)
        
        if result['code'] == 'TRIAL_EXPIRED':
            return jsonify({
                'status': 'error',
                'message': result['message'],
                'code': result['code']
            }), 403
        
        # Başarılı yanıt döndür
        return jsonify({
            'status': 'success',
            'message': result['message'],
            'code': result['code'],
            'days_remaining': result.get('days_remaining', 7),
            'trial_end_date': (datetime.utcnow() + timedelta(days=7)).isoformat() if result['code'] == 'TRIAL_STARTED' else None
        })
        
    except Exception as e:
        logger.error(f"Deneme süreci başlatma hatası: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Deneme süreci başlatma işlemi sırasında bir hata oluştu: {str(e)}'
        }), 500

@app.route('/api/v1/trial/validate', methods=['POST'])
def validate_trial_api():
    """Deneme süreci doğrulama API'si"""
    try:
        data = request.json
        
        # Gerekli alanları kontrol et
        required_fields = ['hardware_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Eksik alan: {field}'
                }), 400
        
        hardware_id = data['hardware_id']
        system_info = data.get('system_info', {})
        
        # Deneme sürecinin geçerliliğini kontrol et
        validity = check_trial_validity(hardware_id, system_info)
        
        if not validity['valid']:
            return jsonify({
                'status': 'invalid',
                'message': validity['message'],
                'code': validity['code']
            })
        
        # Başarılı yanıt döndür
        return jsonify({
            'status': 'valid',
            'message': validity['message'],
            'days_remaining': validity['days_remaining'],
            'hours_remaining': validity['hours_remaining'],
            'trial_end_date': validity['trial_end_date']
        })
        
    except Exception as e:
        logger.error(f"Deneme süreci doğrulama hatası: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Deneme süreci doğrulama işlemi sırasında bir hata oluştu: {str(e)}'
        }), 500

@app.route('/api/v1/trial/check', methods=['POST'])
def check_trial_eligibility_api():
    """Deneme süreci uygunluk kontrolü API'si"""
    try:
        data = request.json
        
        # Gerekli alanları kontrol et
        required_fields = ['hardware_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Eksik alan: {field}'
                }), 400
        
        hardware_id = data['hardware_id']
        system_info = data.get('system_info', {})
        
        # Deneme süreci uygunluğunu kontrol et
        eligibility = check_trial_eligibility(hardware_id, system_info)
        
        # Yanıt döndür
        if eligibility['eligible']:
            if eligibility['code'] == 'TRIAL_ACTIVE':
                # Aktif deneme süreci var
                now = datetime.utcnow()
                trial_end_date = eligibility['activation'].trial_start_date + timedelta(days=7)
                days_remaining = (trial_end_date - now).days
                
                return jsonify({
                    'status': 'success',
                    'message': eligibility['message'],
                    'code': eligibility['code'],
                    'eligible': True,
                    'days_remaining': days_remaining,
                    'trial_end_date': trial_end_date.isoformat()
                })
            else:
                # Yeni deneme süreci başlatılabilir
                return jsonify({
                    'status': 'success',
                    'message': eligibility['message'],
                    'code': eligibility['code'],
                    'eligible': True
                })
        else:
            # Deneme süreci uygun değil
            return jsonify({
                'status': 'error',
                'message': eligibility['message'],
                'code': eligibility['code'],
                'eligible': False
            })
        
    except Exception as e:
        logger.error(f"Deneme süreci uygunluk kontrolü hatası: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'Deneme süreci uygunluk kontrolü sırasında bir hata oluştu: {str(e)}'
        }), 500

def main():
    """Ana uygulama başlatma fonksiyonu"""
    try:
        # Komut satırı argümanlarını işle
        import argparse
        parser = argparse.ArgumentParser(description='ZStok Lisans Sunucusu')
        parser.add_argument('--host', help='Sunucu host adresi', default=config['server']['host'])
        parser.add_argument('--port', type=int, help='Sunucu port numarası', default=int(config['server']['port']))
        parser.add_argument('--debug', action='store_true', help='Debug modunu etkinleştir')
        parser.add_argument('--init-only', action='store_true', help='Sadece veritabanını başlat ve çık')
        parser.add_argument('--production', action='store_true', help='Üretim modu (Waitress WSGI sunucusu kullanır)')
        args = parser.parse_args()
        
        # Veritabanını başlat
        init_db()
        
        if args.init_only:
            logger.info("Veritabanı başlatıldı, çıkılıyor...")
            return
        
        # Sunucu bilgilerini logla
        logger.info(f"Lisans sunucusu başlatılıyor - Host: {args.host}, Port: {args.port}")
        logger.info(f"Veritabanı URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
        
        # Debug modu
        debug_mode = args.debug or config['server'].get('debug', 'False').lower() == 'true'
        
        # Üretim modu
        if args.production:
            logger.info("Üretim modunda başlatılıyor (Waitress WSGI)")
            # Waitress WSGI sunucusu başlat
            from waitress import serve
            serve(app, host=args.host, port=args.port, threads=8)
        else:
            # Geliştirme Flask sunucusu başlat
            app.run(debug=debug_mode, host=args.host, port=args.port)
        
    except Exception as e:
        logger.error(f"Uygulama başlatma hatası: {str(e)}")
        sys.exit(1)

# Kurulum komutları oluştur
def generate_install_instructions():
    """Linux sunucusu için kurulum komutlarını oluştur"""
    instructions = """
# ZStok Lisans Sunucusu Kurulum Talimatları (Linux)

## Gerekli Paketleri Yükle
```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv nginx
```

## Uygulama Klasörlerini Oluştur
```bash
sudo mkdir -p /opt/zstok/license-server
sudo mkdir -p /var/lib/zstok
sudo mkdir -p /var/log/zstok
sudo mkdir -p /etc/zstok
```

## Uygulama Dosyalarını Kopyala
```bash
sudo cp -r * /opt/zstok/license-server/
```

## İzinleri Ayarla
```bash
sudo chown -R www-data:www-data /opt/zstok/license-server
sudo chown -R www-data:www-data /var/lib/zstok
sudo chown -R www-data:www-data /var/log/zstok
sudo chown -R www-data:www-data /etc/zstok
```

## Python Sanal Ortamı Oluştur
```bash
cd /opt/zstok
python3 -m venv venv
source venv/bin/activate
pip install -r license-server/requirements.txt
```

## Systemd Servis Dosyasını Kopyala
```bash
sudo cp /opt/zstok/license-server/server/zstok-license.service /etc/systemd/system/
sudo systemctl daemon-reload
```

## Veritabanını Başlat
```bash
cd /opt/zstok/license-server
python server/license_server.py --init-only
```

## Servisi Etkinleştir ve Başlat
```bash
sudo systemctl enable zstok-license
sudo systemctl start zstok-license
```

## Nginx Konfigürasyonu
```
server {
    listen 80;
    server_name 5.133.102.14;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Nginx Yapılandırmasını Etkinleştir
```bash
sudo cp /opt/zstok/license-server/server/nginx-zstok.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/nginx-zstok.conf /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## Servisi Kontrol Et
```bash
sudo systemctl status zstok-license
```
"""
    return instructions

if __name__ == '__main__':
    main() 