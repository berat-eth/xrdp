# Outdoor Store - MVC React Native Mobil Uygulaması

Outdoor giyim ürünleri satışı için React Native ve SQLite kullanılarak geliştirilmiş MVC mimarisinde mobil uygulama.

## Özellikler

- 📱 MVC (Model-View-Controller) mimarisi
- 🗄️ SQLite veritabanı ile yerel veri saklama
- 🛍️ Ürün listeleme ve detay görüntüleme
- 🛒 Sepet yönetimi
- 👤 Kullanıcı girişi ve kayıt
- 📦 Sipariş oluşturma ve takibi
- 🔍 Ürün arama ve kategori filtreleme
- 🎨 Modern ve kullanıcı dostu arayüz

## Teknolojiler

- **React Native** (TypeScript)
- **Expo**
- **SQLite** (expo-sqlite)
- **React Navigation** (Bottom Tabs + Stack)
- **AsyncStorage**

## Kurulum

1. Proje dizinine gidin:
```bash
cd OutdoorStore
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Uygulamayı başlatın:
```bash
npm start
```

4. Expo Go uygulaması ile QR kodu okutarak mobil cihazınızda test edin veya:
   - Android: `npm run android`
   - iOS: `npm run ios`

## Proje Yapısı

```
OutdoorStore/
├── src/
│   ├── models/          # Veri modelleri (Product, User, Cart, Order)
│   ├── views/           # Ekranlar (Home, ProductList, Cart, Profile vb.)
│   ├── controllers/     # İş mantığı katmanı
│   ├── components/      # Yeniden kullanılabilir bileşenler
│   ├── navigation/      # Navigasyon yapılandırması
│   └── utils/           # Yardımcı fonksiyonlar ve veritabanı
├── App.tsx              # Ana uygulama dosyası
└── package.json
```

## MVC Mimarisi

### Model Katmanı
- **ProductModel**: Ürün veritabanı işlemleri
- **UserModel**: Kullanıcı işlemleri ve kimlik doğrulama
- **CartModel**: Sepet yönetimi
- **OrderModel**: Sipariş işlemleri

### View Katmanı
- **HomeScreen**: Ana sayfa
- **ProductListScreen**: Ürün listesi
- **ProductDetailScreen**: Ürün detayları
- **CartScreen**: Sepet
- **ProfileScreen**: Kullanıcı profili ve giriş/kayıt
- **OrderScreen**: Sipariş oluşturma

### Controller Katmanı
- **ProductController**: Ürün iş mantığı
- **UserController**: Kullanıcı işlemleri ve validasyonlar
- **CartController**: Sepet hesaplamaları ve yönetimi
- **OrderController**: Sipariş işlemleri ve durumları

## Özellikler Detayı

### Kullanıcı Yönetimi
- Email ve şifre ile giriş/kayıt
- Profil bilgilerini güncelleme
- Otomatik oturum yönetimi

### Ürün Yönetimi
- Kategorilere göre filtreleme
- Ürün arama
- Stok kontrolü
- Popüler ve yeni ürünler

### Sepet ve Sipariş
- Sepete ürün ekleme/çıkarma
- Miktar güncelleme
- 500 TL üzeri ücretsiz kargo
- Sipariş durumu takibi

## Örnek Veriler

Uygulama ilk açıldığında otomatik olarak örnek ürünler eklenir:
- Gore-Tex ceketler
- Trekking pantolonları
- Outdoor ayakkabılar
- Sırt çantaları
- Çadırlar
- Uyku tulumları

## Geliştirici Notları

- Şifreler şu anda düz metin olarak saklanıyor. Gerçek uygulamada hash'lenmeli.
- Ürün görselleri Unsplash'tan alınmaktadır.
- SQLite veritabanı cihazda yerel olarak saklanır.