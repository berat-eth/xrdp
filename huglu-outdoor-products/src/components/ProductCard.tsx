import React from 'react';
import { Product } from '../types/Product';
import { ProductService } from '../services/ProductService';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  // Get the first image or use a placeholder
  let imageUrl = '/placeholder.svg';
  if (product.Resimler?.Resim) {
    if (Array.isArray(product.Resimler.Resim)) {
      imageUrl = product.Resimler.Resim[0] || '/placeholder.svg';
    } else {
      imageUrl = product.Resimler.Resim || '/placeholder.svg';
    }
  }
  
  // Get price information
  const originalPrice = product.UrunSecenek?.Secenek?.SatisFiyati || '0';
  const discountedPrice = product.UrunSecenek?.Secenek?.IndirimliFiyat || '0';
  const hasDiscount = discountedPrice !== originalPrice && parseFloat(discountedPrice.replace(',', '.')) > 0;
  
  // Clean the description HTML
  const cleanDescription = ProductService.cleanHtml(product.Aciklama || '');
  
  return (
    <div className="product-card">
      <div className="product-image-container">
        <img 
          src={imageUrl} 
          alt={product.UrunAdi}
          className="product-image"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        {hasDiscount && (
          <div className="discount-badge">
            İndirimli
          </div>
        )}
      </div>
      
      <div className="product-info">
        <h3 className="product-title">{product.UrunAdi}</h3>
        
        <div className="product-meta">
          <span className="product-brand">{product.Marka}</span>
          <span className="product-category">{product.Kategori}</span>
        </div>
        
        <p className="product-description">
          {cleanDescription.substring(0, 150)}
          {cleanDescription.length > 150 && '...'}
        </p>
        
        <div className="product-pricing">
          {hasDiscount ? (
            <>
              <span className="original-price">
                {ProductService.formatPrice(originalPrice)}
              </span>
              <span className="discounted-price">
                {ProductService.formatPrice(discountedPrice)}
              </span>
            </>
          ) : (
            <span className="regular-price">
              {ProductService.formatPrice(originalPrice)}
            </span>
          )}
        </div>
        
        <div className="product-stock">
          <span className={`stock-status ${parseInt(product.UrunSecenek?.Secenek?.StokAdedi || '0') > 0 ? 'in-stock' : 'out-of-stock'}`}>
            {parseInt(product.UrunSecenek?.Secenek?.StokAdedi || '0') > 0 ? 'Stokta Var' : 'Stokta Yok'}
          </span>
        </div>
        
        <a 
          href={product.UrunUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="product-link"
        >
          Ürün Detayları →
        </a>
      </div>
    </div>
  );
};

export default ProductCard;