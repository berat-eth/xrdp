export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface ProductVariant {
  type: 'color' | 'size';
  name: string;
  value: string;
  stock: number;
  priceModifier?: number; // Ek fiyat
}

export interface Product {
  id: string;
  name: string;
  category: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[]; // Birden fazla resim
  description: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew?: boolean;
  isSale?: boolean;
  brand: string;
  features: string[];
  variants?: ProductVariant[]; // Varyasyonlar
}

export const categories: Category[] = [
  {
    id: '1',
    name: 'Kamp',
    icon: 'tent',
    color: '#4CAF50',
    description: 'Çadır, uyku tulumu ve kamp malzemeleri'
  },
  {
    id: '2',
    name: 'Trekking',
    icon: 'hiking',
    color: '#2196F3',
    description: 'Yürüyüş botları, sırt çantaları ve aksesuarlar'
  },
  {
    id: '3',
    name: 'Dağcılık',
    icon: 'terrain',
    color: '#FF5722',
    description: 'Tırmanış ekipmanları ve güvenlik malzemeleri'
  },
  {
    id: '4',
    name: 'Bisiklet',
    icon: 'bike-scooter',
    color: '#9C27B0',
    description: 'Dağ bisikleti, yol bisikleti ve aksesuarlar'
  },
  {
    id: '5',
    name: 'Su Sporları',
    icon: 'kayaking',
    color: '#00BCD4',
    description: 'Kano, sörf tahtası ve yüzme ekipmanları'
  },
  {
    id: '6',
    name: 'Kış Sporları',
    icon: 'ski',
    color: '#3F51B5',
    description: 'Kayak, snowboard ve kış giyim'
  },
  {
    id: '7',
    name: 'Koşu',
    icon: 'run',
    color: '#FFC107',
    description: 'Koşu ayakkabıları ve atletik giyim'
  },
  {
    id: '8',
    name: 'Balıkçılık',
    icon: 'fish',
    color: '#607D8B',
    description: 'Olta, olta takımları ve balıkçılık ekipmanları'
  },
  {
    id: '9',
    name: 'Outdoor Giyim',
    icon: 'tshirt-crew',
    color: '#795548',
    description: 'Mont, pantolon ve outdoor kıyafetler'
  },
  {
    id: '10',
    name: 'Navigasyon',
    icon: 'compass',
    color: '#E91E63',
    description: 'GPS, pusula ve harita ekipmanları'
  }
];

export const products: Product[] = [
  // Kamp Kategorisi
  {
    id: '1',
    name: 'Coleman 4 Kişilik Çadır',
    category: 'Kamp',
    categoryId: '1',
    price: 2499.99,
    originalPrice: 3199.99,
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    images: [
      'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      'https://images.unsplash.com/photo-1487730116645-74489c95b41b?w=800',
      'https://images.unsplash.com/photo-1510672981848-a1c4f1cb5ccf?w=800'
    ],
    description: '4 kişilik geniş aile çadırı. Su geçirmez ve dayanıklı yapı.',
    rating: 4.5,
    reviews: 234,
    inStock: true,
    isSale: true,
    brand: 'Coleman',
    features: ['4 kişilik kapasite', 'Su geçirmez', 'Kolay kurulum', 'UV korumalı'],
    variants: [
      { type: 'color', name: 'Yeşil', value: '#4CAF50', stock: 15 },
      { type: 'color', name: 'Turuncu', value: '#FF5722', stock: 10 },
      { type: 'color', name: 'Mavi', value: '#2196F3', stock: 8 }
    ]
  },
  {
    id: '2',
    name: 'The North Face Uyku Tulumu',
    category: 'Kamp',
    categoryId: '1',
    price: 1899.99,
    image: 'https://images.unsplash.com/photo-1525811902-f2342640856e?w=800',
    description: '-10°C\'ye kadar koruma sağlayan profesyonel uyku tulumu.',
    rating: 4.8,
    reviews: 189,
    inStock: true,
    isNew: true,
    brand: 'The North Face',
    features: ['-10°C koruma', 'Hafif ve kompakt', 'Yüksek kalite yalıtım']
  },
  {
    id: '3',
    name: 'Campingaz Kamp Ocağı',
    category: 'Kamp',
    categoryId: '1',
    price: 799.99,
    image: 'https://images.unsplash.com/photo-1563299796-17596ed6b017?w=800',
    description: 'Taşınabilir ve güvenli kamp ocağı.',
    rating: 4.3,
    reviews: 156,
    inStock: true,
    brand: 'Campingaz',
    features: ['Rüzgar korumalı', 'Ayarlanabilir alev', 'Taşınabilir']
  },
  {
    id: '4',
    name: 'Quechua Kamp Sandalyesi',
    category: 'Kamp',
    categoryId: '1',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800',
    description: 'Katlanabilir ve hafif kamp sandalyesi.',
    rating: 4.1,
    reviews: 98,
    inStock: true,
    brand: 'Quechua',
    features: ['120kg taşıma kapasitesi', 'Katlanabilir', 'Taşıma çantalı']
  },

  // Trekking Kategorisi
  {
    id: '5',
    name: 'Salomon Quest 4D GTX',
    category: 'Trekking',
    categoryId: '2',
    price: 3499.99,
    image: 'https://images.unsplash.com/photo-1542219550-76e77e5b6c3a?w=800',
    description: 'Gore-Tex teknolojili profesyonel trekking botu.',
    rating: 4.9,
    reviews: 456,
    inStock: true,
    brand: 'Salomon',
    features: ['Gore-Tex membran', 'Vibram taban', 'Ayak bileği desteği']
  },
  {
    id: '6',
    name: 'Osprey Atmos 65L Sırt Çantası',
    category: 'Trekking',
    categoryId: '2',
    price: 4299.99,
    originalPrice: 4999.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
    description: 'Uzun yürüyüşler için ideal 65 litrelik sırt çantası.',
    rating: 4.7,
    reviews: 312,
    inStock: true,
    isSale: true,
    brand: 'Osprey',
    features: ['65L kapasite', 'Anti-Gravity askı sistemi', 'Yağmurluk dahil']
  },
  {
    id: '7',
    name: 'Black Diamond Trekking Batonu',
    category: 'Trekking',
    categoryId: '2',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
    description: 'Karbon fiber ayarlanabilir trekking batonu.',
    rating: 4.4,
    reviews: 178,
    inStock: true,
    brand: 'Black Diamond',
    features: ['Karbon fiber', 'Teleskopik', 'Ergonomik tutma kolu']
  },
  {
    id: '8',
    name: 'Merrell Moab 3 Mid',
    category: 'Trekking',
    categoryId: '2',
    price: 2299.99,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    description: 'Orta seviye trekking için ideal outdoor ayakkabı.',
    rating: 4.2,
    reviews: 234,
    inStock: true,
    isNew: true,
    brand: 'Merrell',
    features: ['Vibram taban', 'Su itici', 'Nefes alabilen']
  },

  // Dağcılık Kategorisi
  {
    id: '9',
    name: 'Petzl Sirius Kask',
    category: 'Dağcılık',
    categoryId: '3',
    price: 1599.99,
    image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=800',
    description: 'Profesyonel tırmanış kaskı.',
    rating: 4.8,
    reviews: 89,
    inStock: true,
    brand: 'Petzl',
    features: ['CE sertifikalı', 'Ayarlanabilir', 'Havalandırma']
  },
  {
    id: '10',
    name: 'Mammut 9.5mm Tırmanış İpi',
    category: 'Dağcılık',
    categoryId: '3',
    price: 2899.99,
    image: 'https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800',
    description: '60 metre dinamik tırmanış ipi.',
    rating: 4.9,
    reviews: 67,
    inStock: true,
    brand: 'Mammut',
    features: ['UIAA sertifikalı', '60m uzunluk', 'Dinamik']
  },
  {
    id: '11',
    name: 'Black Diamond Momentum Emniyet Kemeri',
    category: 'Dağcılık',
    categoryId: '3',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1564769610726-638d86b9b766?w=800',
    description: 'Rahat ve güvenli tırmanış kemeri.',
    rating: 4.6,
    reviews: 134,
    inStock: true,
    brand: 'Black Diamond',
    features: ['4 halka', 'Ayarlanabilir', 'Yastıklı']
  },
  {
    id: '12',
    name: 'La Sportiva Solution Tırmanış Ayakkabısı',
    category: 'Dağcılık',
    categoryId: '3',
    price: 2199.99,
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
    description: 'Profesyonel kaya tırmanış ayakkabısı.',
    rating: 4.7,
    reviews: 98,
    inStock: true,
    isNew: true,
    brand: 'La Sportiva',
    features: ['Vibram XS Grip2', 'P3 teknolojisi', 'Hassas tırmanış']
  },

  // Bisiklet Kategorisi
  {
    id: '13',
    name: 'Trek Marlin 7 Dağ Bisikleti',
    category: 'Bisiklet',
    categoryId: '4',
    price: 18999.99,
    originalPrice: 22999.99,
    image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=800',
    description: '29" jant, 21 vites dağ bisikleti.',
    rating: 4.6,
    reviews: 245,
    inStock: true,
    isSale: true,
    brand: 'Trek',
    features: ['29" jant', '21 vites', 'Hidrolik disk fren', 'Alüminyum kadro']
  },
  {
    id: '14',
    name: 'Giro Syntax MIPS Kask',
    category: 'Bisiklet',
    categoryId: '4',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    description: 'MIPS teknolojili yol bisikleti kaskı.',
    rating: 4.8,
    reviews: 167,
    inStock: true,
    brand: 'Giro',
    features: ['MIPS koruma', 'Hafif', '25 havalandırma']
  },
  {
    id: '15',
    name: 'Shimano SPD-SL Pedal',
    category: 'Bisiklet',
    categoryId: '4',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1553978297-833d09932d31?w=800',
    description: 'Profesyonel yol bisikleti pedalı.',
    rating: 4.5,
    reviews: 89,
    inStock: true,
    brand: 'Shimano',
    features: ['Karbon gövde', 'Ayarlanabilir gerilim', 'Hafif']
  },
  {
    id: '16',
    name: 'Giant Contend AR 3',
    category: 'Bisiklet',
    categoryId: '4',
    price: 14999.99,
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=800',
    description: 'Gravel bisiklet, çok yönlü kullanım.',
    rating: 4.4,
    reviews: 123,
    inStock: true,
    isNew: true,
    brand: 'Giant',
    features: ['Gravel geometri', 'Disk fren', 'Tubeless hazır']
  },

  // Su Sporları Kategorisi
  {
    id: '17',
    name: 'Red Paddle Co 10\'6" SUP',
    category: 'Su Sporları',
    categoryId: '5',
    price: 7999.99,
    image: 'https://images.unsplash.com/photo-1530870110042-98b2cb110834?w=800',
    description: 'Şişme stand up paddle board seti.',
    rating: 4.7,
    reviews: 201,
    inStock: true,
    brand: 'Red Paddle Co',
    features: ['10\'6" uzunluk', 'Komple set', 'RSS battens', '15 PSI']
  },
  {
    id: '18',
    name: 'O\'Neill Reactor 3/2mm Wetsuit',
    category: 'Su Sporları',
    categoryId: '5',
    price: 1899.99,
    image: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800',
    description: 'Esnek ve sıcak tutan sörf giysisi.',
    rating: 4.3,
    reviews: 145,
    inStock: true,
    brand: 'O\'Neill',
    features: ['3/2mm kalınlık', 'FluidFlex', 'Kinetica göğüs paneli']
  },
  {
    id: '19',
    name: 'Perception Pescador Pro 12 Kayak',
    category: 'Su Sporları',
    categoryId: '5',
    price: 12999.99,
    originalPrice: 14999.99,
    image: 'https://images.unsplash.com/photo-1527004760902-f524844a7118?w=800',
    description: 'Balıkçılık ve tur için ideal kayak.',
    rating: 4.6,
    reviews: 98,
    inStock: true,
    isSale: true,
    brand: 'Perception',
    features: ['3.7m uzunluk', 'Ayarlanabilir koltuk', 'Olta tutucular']
  },
  {
    id: '20',
    name: 'Aqua Marina Breeze SUP Küregi',
    category: 'Su Sporları',
    categoryId: '5',
    price: 699.99,
    image: 'https://images.unsplash.com/photo-1571019613531-039efbfae4d8?w=800',
    description: 'Ayarlanabilir alüminyum SUP küregi.',
    rating: 4.2,
    reviews: 67,
    inStock: true,
    brand: 'Aqua Marina',
    features: ['Ayarlanabilir boy', 'Alüminyum', 'Ergonomik sap']
  },

  // Kış Sporları Kategorisi
  {
    id: '21',
    name: 'Salomon QST 92 Kayak',
    category: 'Kış Sporları',
    categoryId: '6',
    price: 8999.99,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    description: 'All-mountain freeride kayak.',
    rating: 4.8,
    reviews: 234,
    inStock: true,
    brand: 'Salomon',
    features: ['92mm genişlik', 'C/FX teknolojisi', 'All-mountain']
  },
  {
    id: '22',
    name: 'Burton Custom Snowboard',
    category: 'Kış Sporları',
    categoryId: '6',
    price: 7499.99,
    originalPrice: 8999.99,
    image: 'https://images.unsplash.com/photo-1478827387698-1527781a4887?w=800',
    description: 'İkonik all-mountain snowboard.',
    rating: 4.9,
    reviews: 345,
    inStock: true,
    isSale: true,
    brand: 'Burton',
    features: ['Camber profil', 'FSC sertifikalı', 'Sintered base']
  },
  {
    id: '23',
    name: 'Atomic Hawx Prime 110 S',
    category: 'Kış Sporları',
    categoryId: '6',
    price: 5999.99,
    image: 'https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800',
    description: 'Orta sertlikte all-mountain kayak botu.',
    rating: 4.5,
    reviews: 178,
    inStock: true,
    brand: 'Atomic',
    features: ['110 flex', 'Memory Fit', 'Prolite yapı']
  },
  {
    id: '24',
    name: 'The North Face Freedom Pantolon',
    category: 'Kış Sporları',
    categoryId: '6',
    price: 2499.99,
    image: 'https://images.unsplash.com/photo-1565992441121-4367c2967103?w=800',
    description: 'DryVent teknolojili kayak pantolonu.',
    rating: 4.3,
    reviews: 123,
    inStock: true,
    isNew: true,
    brand: 'The North Face',
    features: ['DryVent membran', 'Havalandırma', 'Kar eteği']
  },

  // Koşu Kategorisi
  {
    id: '25',
    name: 'Nike Pegasus Trail 4',
    category: 'Koşu',
    categoryId: '7',
    price: 2899.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    description: 'Trail koşu ayakkabısı.',
    rating: 4.6,
    reviews: 289,
    inStock: true,
    brand: 'Nike',
    features: ['React köpük', 'Gore-Tex üst', 'Trail taban']
  },
  {
    id: '26',
    name: 'Garmin Forerunner 955',
    category: 'Koşu',
    categoryId: '7',
    price: 12999.99,
    image: 'https://images.unsplash.com/photo-1579721840641-7d0e67f1204e?w=800',
    description: 'GPS li multispor akıllı saat.',
    rating: 4.8,
    reviews: 456,
    inStock: true,
    brand: 'Garmin',
    features: ['GPS/GLONASS', 'Nabız sensörü', 'Müzik depolama']
  },
  {
    id: '27',
    name: 'Salomon ADV Skin 12 Set',
    category: 'Koşu',
    categoryId: '7',
    price: 2199.99,
    originalPrice: 2699.99,
    image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800',
    description: 'Ultra trail koşu yeleği.',
    rating: 4.7,
    reviews: 167,
    inStock: true,
    isSale: true,
    brand: 'Salomon',
    features: ['12L kapasite', '2x500ml matara', 'SensiFit']
  },
  {
    id: '28',
    name: 'Hoka One One Speedgoat 5',
    category: 'Koşu',
    categoryId: '7',
    price: 3499.99,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
    description: 'Maksimal yastıklamalı trail ayakkabı.',
    rating: 4.5,
    reviews: 234,
    inStock: true,
    isNew: true,
    brand: 'Hoka One One',
    features: ['Vibram Megagrip', 'Geniş taban', 'Meta-Rocker']
  },

  // Balıkçılık Kategorisi
  {
    id: '29',
    name: 'Shimano Stradic FM 3000',
    category: 'Balıkçılık',
    categoryId: '8',
    price: 3899.99,
    image: 'https://images.unsplash.com/photo-1615111784767-4d7c527f32a1?w=800',
    description: 'Profesyonel olta makinesi.',
    rating: 4.9,
    reviews: 345,
    inStock: true,
    brand: 'Shimano',
    features: ['HAGANE gövde', 'X-Ship', '6+1 rulman']
  },
  {
    id: '30',
    name: 'Daiwa Ninja X Spin',
    category: 'Balıkçılık',
    categoryId: '8',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
    description: '2.40m spin olta kamışı.',
    rating: 4.3,
    reviews: 123,
    inStock: true,
    brand: 'Daiwa',
    features: ['HVF karbon', '10-30g atış ağırlığı', 'Ergonomik sap']
  },
  {
    id: '31',
    name: 'Rapala Balıkçı Yeleği',
    category: 'Balıkçılık',
    categoryId: '8',
    price: 1299.99,
    originalPrice: 1599.99,
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
    description: 'Çok cepli balıkçı yeleği.',
    rating: 4.4,
    reviews: 89,
    inStock: true,
    isSale: true,
    brand: 'Rapala',
    features: ['15+ cep', 'Mesh sırt', 'D-ring bağlantılar']
  },
  {
    id: '32',
    name: 'Abu Garcia Beast Pro',
    category: 'Balıkçılık',
    categoryId: '8',
    price: 1599.99,
    image: 'https://images.unsplash.com/photo-1617895153857-82fe79adfcd4?w=800',
    description: 'Ağır hizmet tipi olta kamışı.',
    rating: 4.6,
    reviews: 156,
    inStock: true,
    brand: 'Abu Garcia',
    features: ['24T karbon', '40-120g atış', 'EVA tutma kolu']
  },

  // Outdoor Giyim Kategorisi
  {
    id: '33',
    name: 'Patagonia Down Sweater Hoodie',
    category: 'Outdoor Giyim',
    categoryId: '9',
    price: 4999.99,
    image: 'https://images.unsplash.com/photo-1566479179817-0ddb5fa87cd9?w=800',
    images: [
      'https://images.unsplash.com/photo-1566479179817-0ddb5fa87cd9?w=800',
      'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800'
    ],
    description: '800 dolgu gücü kaz tüyü mont.',
    rating: 4.8,
    reviews: 567,
    inStock: true,
    brand: 'Patagonia',
    features: ['800 fill power', 'DWR kaplama', 'Geri dönüşümlü'],
    variants: [
      { type: 'size', name: 'XS', value: 'XS', stock: 5 },
      { type: 'size', name: 'S', value: 'S', stock: 10 },
      { type: 'size', name: 'M', value: 'M', stock: 15 },
      { type: 'size', name: 'L', value: 'L', stock: 12 },
      { type: 'size', name: 'XL', value: 'XL', stock: 8 },
      { type: 'size', name: 'XXL', value: 'XXL', stock: 4 },
      { type: 'color', name: 'Siyah', value: '#000000', stock: 30 },
      { type: 'color', name: 'Lacivert', value: '#000080', stock: 20 },
      { type: 'color', name: 'Kırmızı', value: '#FF0000', stock: 10 }
    ]
  },
  {
    id: '34',
    name: 'Arc\'teryx Beta AR Ceket',
    category: 'Outdoor Giyim',
    categoryId: '9',
    price: 12999.99,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800',
      'https://images.unsplash.com/photo-1527004760263-cb09f9ca9109?w=800',
      'https://images.unsplash.com/photo-1495105787522-5334e3ffa0ef?w=800'
    ],
    description: 'Gore-Tex Pro shell ceket.',
    rating: 4.9,
    reviews: 234,
    inStock: true,
    isNew: true,
    brand: 'Arc\'teryx',
    features: ['Gore-Tex Pro', '3 katman', 'Kask uyumlu'],
    variants: [
      { type: 'size', name: 'S', value: 'S', stock: 3 },
      { type: 'size', name: 'M', value: 'M', stock: 5 },
      { type: 'size', name: 'L', value: 'L', stock: 7 },
      { type: 'size', name: 'XL', value: 'XL', stock: 4 },
      { type: 'size', name: 'XXL', value: 'XXL', stock: 2 },
      { type: 'color', name: 'Siyah', value: '#000000', stock: 10 },
      { type: 'color', name: 'Dynasty Yeşil', value: '#2E7D32', stock: 8 },
      { type: 'color', name: 'Kingfisher Mavi', value: '#0288D1', stock: 3 }
    ]
  },
  {
    id: '35',
    name: 'Mammut Softshell Pantolon',
    category: 'Outdoor Giyim',
    categoryId: '9',
    price: 2799.99,
    originalPrice: 3299.99,
    image: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800',
    description: 'Esnek ve dayanıklı outdoor pantolon.',
    rating: 4.5,
    reviews: 178,
    inStock: true,
    isSale: true,
    brand: 'Mammut',
    features: ['4 yönlü stretch', 'DWR kaplama', 'Takviyeli dizler']
  },
  {
    id: '36',
    name: 'Columbia Flash Forward',
    category: 'Outdoor Giyim',
    categoryId: '9',
    price: 1299.99,
    image: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800',
    description: 'Rüzgarlık ceket.',
    rating: 4.2,
    reviews: 123,
    inStock: true,
    brand: 'Columbia',
    features: ['Omni-Shield', 'Paketlenebilir', 'UV korumalı']
  },

  // Navigasyon Kategorisi
  {
    id: '37',
    name: 'Garmin GPSMAP 66i',
    category: 'Navigasyon',
    categoryId: '10',
    price: 15999.99,
    image: 'https://images.unsplash.com/photo-1524522173746-f628baad3644?w=800',
    description: 'Uydu haberleşmeli GPS cihazı.',
    rating: 4.9,
    reviews: 89,
    inStock: true,
    brand: 'Garmin',
    features: ['inReach teknolojisi', 'SOS butonu', 'Topo haritalar']
  },
  {
    id: '38',
    name: 'Suunto MC-2 Pusula',
    category: 'Navigasyon',
    categoryId: '10',
    price: 899.99,
    image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800',
    description: 'Profesyonel ayna pusula.',
    rating: 4.7,
    reviews: 145,
    inStock: true,
    brand: 'Suunto',
    features: ['Ayna vizör', 'Klinometre', 'Fosforlu ibre']
  },
  {
    id: '39',
    name: 'Casio Pro Trek PRW-3500',
    category: 'Navigasyon',
    categoryId: '10',
    price: 4999.99,
    originalPrice: 5999.99,
    image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=800',
    description: 'Altimetre, barometre, pusulalı saat.',
    rating: 4.6,
    reviews: 234,
    inStock: true,
    isSale: true,
    brand: 'Casio',
    features: ['Triple sensor', 'Solar şarj', '200m su geçirmez']
  },
  {
    id: '40',
    name: 'Garmin inReach Mini 2',
    category: 'Navigasyon',
    categoryId: '10',
    price: 8999.99,
    image: 'https://images.unsplash.com/photo-1542840843-3349799cded6?w=800',
    description: 'Kompakt uydu haberleşme cihazı.',
    rating: 4.8,
    reviews: 167,
    inStock: true,
    isNew: true,
    brand: 'Garmin',
    features: ['2 yönlü mesajlaşma', 'SOS', 'GPS takip']
  }
];