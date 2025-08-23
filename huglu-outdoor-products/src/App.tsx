import React, { useState, useEffect } from 'react';
import './App.css';
import ProductCard from './components/ProductCard';
import CategoryFilter from './components/CategoryFilter';
import { ProductService } from './services/ProductService';
import { Product } from './types/Product';

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = ProductService.filterByCategory(products, selectedCategory);
    setFilteredProducts(filtered);
  }, [products, selectedCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await ProductService.fetchProducts();
      setProducts(fetchedProducts);
      setFilteredProducts(fetchedProducts);
      
      const uniqueCategories = ProductService.getCategories(fetchedProducts);
      setCategories(uniqueCategories);
      
      setError(null);
    } catch (err) {
      setError('Ürünler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="container">
          <h1 className="app-title">Huğlu Outdoor</h1>
          <p className="app-subtitle">Premium Outdoor Ürünleri</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Ürünler yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p className="error-message">{error}</p>
              <button onClick={fetchProducts} className="retry-button">
                Tekrar Dene
              </button>
            </div>
          ) : (
            <>
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />

              <div className="products-info">
                <p className="product-count">
                  {filteredProducts.length} ürün listeleniyor
                </p>
              </div>

              <div className="products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.UrunKartiID} product={product} />
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="no-products">
                  <p>Bu kategoride ürün bulunamadı.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="container">
          <p>&copy; 2024 Huğlu Outdoor. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
