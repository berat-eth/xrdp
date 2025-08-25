# Supabase Kurulum Rehberi

Bu uygulama artık SQLite yerine Supabase kullanmaktadır. Aşağıdaki adımları izleyerek Supabase'i kurabilirsiniz.

## 1. Supabase Projesi Oluşturma

1. [Supabase.com](https://supabase.com) adresine gidin ve ücretsiz hesap oluşturun
2. "New Project" butonuna tıklayın
3. Proje bilgilerini doldurun:
   - Project name: OutdoorStore (veya istediğiniz bir isim)
   - Database Password: Güçlü bir şifre belirleyin
   - Region: Size en yakın bölgeyi seçin

## 2. Veritabanı Tablolarını Oluşturma

1. Supabase Dashboard'da SQL Editor'e gidin
2. `supabase_schema.sql` dosyasındaki tüm SQL kodunu kopyalayın
3. SQL Editor'e yapıştırın ve "Run" butonuna tıklayın
4. Tablolar ve örnek veriler otomatik olarak oluşturulacaktır

## 3. Proje Ayarları

1. Supabase Dashboard'da Settings > API bölümüne gidin
2. Aşağıdaki bilgileri kopyalayın:
   - Project URL
   - anon/public API key

3. Projenizin kök dizininde `.env` dosyası oluşturun:
```bash
cp .env.example .env
```

4. `.env` dosyasını düzenleyin ve Supabase bilgilerinizi ekleyin:
```
SUPABASE_URL=your-project-url
SUPABASE_ANON_KEY=your-anon-key
```

## 4. Authentication Ayarları

1. Supabase Dashboard'da Authentication > Providers bölümüne gidin
2. Email provider'ı aktif olduğundan emin olun
3. İsteğe bağlı olarak diğer provider'ları (Google, Facebook vb.) ekleyebilirsiniz

## 5. Storage Ayarları (Opsiyonel)

Eğer ürün resimlerini Supabase Storage'da saklamak isterseniz:

1. Storage bölümüne gidin
2. "New bucket" oluşturun (örn: "product-images")
3. Bucket'ı public yapın (Settings > Public)

## 6. Uygulamayı Çalıştırma

```bash
cd OutdoorStore
npm install
npm start
```

## Önemli Notlar

- **Güvenlik**: Production'da kullanmadan önce Row Level Security (RLS) politikalarını gözden geçirin
- **Backup**: Düzenli olarak veritabanı yedekleri alın
- **Monitoring**: Supabase Dashboard'dan kullanım istatistiklerini takip edin

## Sorun Giderme

### Bağlantı Hatası
- SUPABASE_URL ve SUPABASE_ANON_KEY değerlerinin doğru olduğundan emin olun
- İnternet bağlantınızı kontrol edin

### Tablo Bulunamadı Hatası
- SQL schema'nın başarıyla çalıştırıldığından emin olun
- Supabase Dashboard'da Table Editor'den tabloların oluştuğunu kontrol edin

### Authentication Hatası
- Email provider'ın aktif olduğundan emin olun
- Kullanıcı kayıt ve giriş işlemlerinde doğru email/şifre kullanıldığından emin olun

## Geliştirme İpuçları

1. **Realtime Özelliği**: Supabase'in realtime özelliğini kullanarak canlı güncellemeler ekleyebilirsiniz
2. **Edge Functions**: Sunucu tarafı mantığı için Supabase Edge Functions kullanabilirsiniz
3. **Database Functions**: Karmaşık sorgular için PostgreSQL fonksiyonları oluşturabilirsiniz