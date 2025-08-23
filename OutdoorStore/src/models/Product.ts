import db from '../utils/database';
import { Product } from '../utils/types';

export class ProductModel {
  static async getAll(): Promise<Product[]> {
    try {
      const products = await db.getAllAsync<Product>('SELECT * FROM products');
      return products || [];
    } catch (error) {
      console.error('Error getting all products:', error);
      return [];
    }
  }

  static async getById(id: number): Promise<Product | null> {
    try {
      const product = await db.getFirstAsync<Product>(
        'SELECT * FROM products WHERE id = ?',
        [id]
      );
      return product || null;
    } catch (error) {
      console.error('Error getting product by id:', error);
      return null;
    }
  }

  static async getByCategory(category: string): Promise<Product[]> {
    try {
      const products = await db.getAllAsync<Product>(
        'SELECT * FROM products WHERE category = ?',
        [category]
      );
      return products || [];
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  }

  static async search(query: string): Promise<Product[]> {
    try {
      const products = await db.getAllAsync<Product>(
        'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR brand LIKE ?',
        [`%${query}%`, `%${query}%`, `%${query}%`]
      );
      return products || [];
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  static async updateStock(id: number, quantity: number): Promise<boolean> {
    try {
      await db.runAsync(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?',
        [quantity, id, quantity]
      );
      return true;
    } catch (error) {
      console.error('Error updating product stock:', error);
      return false;
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      const result = await db.getAllAsync<{ category: string }>(
        'SELECT DISTINCT category FROM products'
      );
      return result?.map(r => r.category) || [];
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }
}