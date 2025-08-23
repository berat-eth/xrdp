import db from '../utils/database';
import { CartItem, Product } from '../utils/types';

export class CartModel {
  static async addItem(userId: number, productId: number, quantity: number): Promise<boolean> {
    try {
      // Önce ürün sepette var mı kontrol et
      const existingItem = await db.getFirstAsync<CartItem>(
        'SELECT * FROM cart WHERE userId = ? AND productId = ?',
        [userId, productId]
      );

      if (existingItem) {
        // Varsa miktarı güncelle
        await db.runAsync(
          'UPDATE cart SET quantity = quantity + ? WHERE id = ?',
          [quantity, existingItem.id]
        );
      } else {
        // Yoksa yeni ekle
        await db.runAsync(
          'INSERT INTO cart (userId, productId, quantity) VALUES (?, ?, ?)',
          [userId, productId, quantity]
        );
      }
      return true;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return false;
    }
  }

  static async removeItem(id: number): Promise<boolean> {
    try {
      await db.runAsync('DELETE FROM cart WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return false;
    }
  }

  static async updateQuantity(id: number, quantity: number): Promise<boolean> {
    try {
      if (quantity <= 0) {
        return await this.removeItem(id);
      }
      
      await db.runAsync(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [quantity, id]
      );
      return true;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return false;
    }
  }

  static async getCartItems(userId: number): Promise<CartItem[]> {
    try {
      const items = await db.getAllAsync<CartItem & Product>(
        `SELECT c.*, p.name, p.price, p.image, p.stock, p.brand 
         FROM cart c 
         JOIN products p ON c.productId = p.id 
         WHERE c.userId = ?`,
        [userId]
      );

      return items?.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        userId: item.userId,
        product: {
          id: item.productId,
          name: item.name,
          description: '',
          price: item.price,
          category: '',
          image: item.image,
          stock: item.stock,
          brand: item.brand,
          rating: 0,
          reviewCount: 0
        }
      })) || [];
    } catch (error) {
      console.error('Error getting cart items:', error);
      return [];
    }
  }

  static async clearCart(userId: number): Promise<boolean> {
    try {
      await db.runAsync('DELETE FROM cart WHERE userId = ?', [userId]);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  static async getCartTotal(userId: number): Promise<number> {
    try {
      const result = await db.getFirstAsync<{ total: number }>(
        `SELECT SUM(c.quantity * p.price) as total 
         FROM cart c 
         JOIN products p ON c.productId = p.id 
         WHERE c.userId = ?`,
        [userId]
      );
      return result?.total || 0;
    } catch (error) {
      console.error('Error getting cart total:', error);
      return 0;
    }
  }

  static async getCartItemCount(userId: number): Promise<number> {
    try {
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT SUM(quantity) as count FROM cart WHERE userId = ?',
        [userId]
      );
      return result?.count || 0;
    } catch (error) {
      console.error('Error getting cart item count:', error);
      return 0;
    }
  }
}