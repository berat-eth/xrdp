#!/bin/bash

# Güncellemeler ve temel paketlerin kurulumu
echo "Sistem güncelleniyor ve temel paketler kuruluyor..."
sudo apt update -y
sudo apt upgrade -y

# GNOME masaüstü ortamının kurulumu
echo "GNOME masaüstü ortamı kuruluyor..."
sudo apt install -y ubuntu-desktop

# XRDP'nin kurulumu
echo "XRDP kuruluyor..."
sudo apt install -y xrdp

# XRDP servisini başlatma ve sistem açılışında başlatmak için etkinleştirme
echo "XRDP servisi başlatılıyor ve etkinleştiriliyor..."
sudo systemctl enable xrdp
sudo systemctl start xrdp

# XRDP kullanıcılarını ssl-cert grubuna ekleme
echo "XRDP kullanıcısı ssl-cert grubuna ekleniyor..."
sudo adduser xrdp ssl-cert

# Güvenlik duvarı ayarları
echo "Güvenlik duvarı ayarları yapılıyor (3389 portu açılıyor)..."
sudo ufw allow 3389
sudo ufw reload

# GNOME oturumunu belirtmek için ~/.xsession dosyasını oluşturma
echo "GNOME oturumu belirtiliyor..."
echo gnome-session > ~/.xsession

# XRDP servisini yeniden başlatma
echo "XRDP servisi yeniden başlatılıyor..."
sudo systemctl restart xrdp

echo "Kurulum tamamlandı! Artık RDP istemciniz ile VPS'inize bağlanabilirsiniz."

