export interface ProductImage {
  Resim: string | string[];
}

export interface ProductOption {
  VaryasyonID: string;
  StokKodu: string;
  Barkod?: string;
  StokAdedi: string;
  AlisFiyati: string;
  SatisFiyati: string;
  IndirimliFiyat: string;
  KDVDahil: string;
  KdvOrani: string;
  ParaBirimi: string;
  ParaBirimiKodu: string;
  Desi: string;
  EkSecenekOzellik?: string;
}

export interface Product {
  UrunKartiID: string;
  UrunAdi: string;
  OnYazi: string;
  Aciklama: string;
  Marka: string;
  SatisBirimi: string;
  KategoriID: string;
  Kategori: string;
  KategoriTree: string;
  UrunUrl: string;
  Resimler: ProductImage;
  UrunSecenek: {
    Secenek: ProductOption;
  };
  TeknikDetaylar?: string;
}

export interface ProductsData {
  Root: {
    Urunler: {
      Urun: Product[];
    };
  };
}