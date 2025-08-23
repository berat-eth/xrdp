import { CartModel } from '../models/Cart';
import { ProductController } from './ProductController';
import { CartItem } from '../utils/types';

export class CartController {
  static async addToCart(userId: number, productId: number, quantity: number = 1): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      // Stok kontrolü
      const hasStock = await ProductController.checkStock(productId, quantity);
      if (!hasStock) {
        return { success: false, message: 'Ürün stokta yok veya yetersiz stok' };
      }

      const added = await CartModel.addItem(userId, productId, quantity);
      
      if (added) {
        return { success: true, message: 'Ürün sepete eklendi' };
      } else {
        return { success: false, message: 'Ürün sepete eklenemedi' };
      }
    } catch (error) {
      console.error('CartController - addToCart error:', error);
      return { success: false, message: 'Bir hata oluştu' };
    }
  }

  static async removeFromCart(cartItemId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const removed = await CartModel.removeItem(cartItemId);
      
      if (removed) {
        return { success: true, message: 'Ürün sepetten kaldırıldı' };
      } else {
        return { success: false, message: 'Ürün sepetten kaldırılamadı' };
      }
    } catch (error) {
      console.error('CartController - removeFromCart error:', error);
      return { success: false, message: 'Bir hata oluştu' };
    }
  }

  static async updateQuantity(cartItemId: number, quantity: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      if (quantity < 0) {
        return { success: false, message: 'Miktar negatif olamaz' };
      }

      // TODO: Stok kontrolü yapılabilir

      const updated = await CartModel.updateQuantity(cartItemId, quantity);
      
      if (updated) {
        return { success: true, message: 'Miktar güncellendi' };
      } else {
        return { success: false, message: 'Miktar güncellenemedi' };
      }
    } catch (error) {
      console.error('CartController - updateQuantity error:', error);
      return { success: false, message: 'Bir hata oluştu' };
    }
  }

  static async getCartItems(userId: number): Promise<CartItem[]> {
    try {
      return await CartModel.getCartItems(userId);
    } catch (error) {
      console.error('CartController - getCartItems error:', error);
      return [];
    }
  }

  static async getCartTotal(userId: number): Promise<number> {
    try {
      return await CartModel.getCartTotal(userId);
    } catch (error) {
      console.error('CartController - getCartTotal error:', error);
      return 0;
    }
  }

  static async getCartItemCount(userId: number): Promise<number> {
    try {
      return await CartModel.getCartItemCount(userId);
    } catch (error) {
      console.error('CartController - getCartItemCount error:', error);
      return 0;
    }
  }

  static async clearCart(userId: number): Promise<boolean> {
    try {
      return await CartModel.clearCart(userId);
    } catch (error) {
      console.error('CartController - clearCart error:', error);
      return false;
    }
  }

  static async increaseQuantity(cartItemId: number, currentQuantity: number): Promise<{
    success: boolean;
    message: string;
  }> {
    return await this.updateQuantity(cartItemId, currentQuantity + 1);
  }

  static async decreaseQuantity(cartItemId: number, currentQuantity: number): Promise<{
    success: boolean;
    message: string;
  }> {
    if (currentQuantity <= 1) {
      return await this.removeFromCart(cartItemId);
    }
    return await this.updateQuantity(cartItemId, currentQuantity - 1);
  }

  static calculateSubtotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      if (item.product) {
        return total + (item.product.price * item.quantity);
      }
      return total;
    }, 0);
  }

  static calculateShipping(subtotal: number): number {
    // 500 TL üzeri ücretsiz kargo
    return subtotal >= 500 ? 0 : 29.90;
  }

  static calculateTotal(subtotal: number, shipping: number): number {
    return subtotal + shipping;
  }
}