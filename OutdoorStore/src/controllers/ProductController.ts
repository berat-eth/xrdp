import { ProductModel } from '../models/Product';
import { Product } from '../utils/types';

export class ProductController {
  static async getAllProducts(): Promise<Product[]> {
    try {
      return await ProductModel.getAll();
    } catch (error) {
      console.error('ProductController - getAllProducts error:', error);
      return [];
    }
  }

  static async getProductById(id: number): Promise<Product | null> {
    try {
      return await ProductModel.getById(id);
    } catch (error) {
      console.error('ProductController - getProductById error:', error);
      return null;
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      return await ProductModel.getByCategory(category);
    } catch (error) {
      console.error('ProductController - getProductsByCategory error:', error);
      return [];
    }
  }

  static async searchProducts(query: string): Promise<Product[]> {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }
      return await ProductModel.search(query.trim());
    } catch (error) {
      console.error('ProductController - searchProducts error:', error);
      return [];
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      return await ProductModel.getCategories();
    } catch (error) {
      console.error('ProductController - getCategories error:', error);
      return [];
    }
  }

  static async checkStock(productId: number, quantity: number): Promise<boolean> {
    try {
      const product = await ProductModel.getById(productId);
      if (!product) return false;
      return product.stock >= quantity;
    } catch (error) {
      console.error('ProductController - checkStock error:', error);
      return false;
    }
  }

  static async getPopularProducts(): Promise<Product[]> {
    try {
      const products = await ProductModel.getAll();
      // Popüler ürünleri rating'e göre sırala ve ilk 6 tanesini al
      return products
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 6);
    } catch (error) {
      console.error('ProductController - getPopularProducts error:', error);
      return [];
    }
  }

  static async getNewProducts(): Promise<Product[]> {
    try {
      const products = await ProductModel.getAll();
      // En yeni ürünleri ID'ye göre sırala (en büyük ID = en yeni)
      return products
        .sort((a, b) => b.id - a.id)
        .slice(0, 6);
    } catch (error) {
      console.error('ProductController - getNewProducts error:', error);
      return [];
    }
  }

  static formatPrice(price: number): string {
    return `₺${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
  }
}