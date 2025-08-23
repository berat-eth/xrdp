import db from '../utils/database';
import { Order, OrderItem, OrderStatus } from '../utils/types';
import { CartModel } from './Cart';
import { ProductModel } from './Product';

export class OrderModel {
  static async create(
    userId: number, 
    shippingAddress: string, 
    paymentMethod: string
  ): Promise<number | null> {
    try {
      // Sepet öğelerini al
      const cartItems = await CartModel.getCartItems(userId);
      if (cartItems.length === 0) return null;

      // Toplam tutarı hesapla
      const totalAmount = await CartModel.getCartTotal(userId);

      // Siparişi oluştur
      const orderResult = await db.runAsync(
        `INSERT INTO orders (userId, totalAmount, status, shippingAddress, paymentMethod) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, totalAmount, OrderStatus.PENDING, shippingAddress, paymentMethod]
      );

      const orderId = orderResult.lastInsertRowId;

      // Sipariş öğelerini ekle
      for (const item of cartItems) {
        if (item.product) {
          await db.runAsync(
            `INSERT INTO order_items (orderId, productId, quantity, price) 
             VALUES (?, ?, ?, ?)`,
            [orderId, item.productId, item.quantity, item.product.price]
          );

          // Stok güncelle
          await ProductModel.updateStock(item.productId, item.quantity);
        }
      }

      // Sepeti temizle
      await CartModel.clearCart(userId);

      return orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  static async getByUserId(userId: number): Promise<Order[]> {
    try {
      const orders = await db.getAllAsync<Order>(
        'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );

      if (!orders) return [];

      // Her sipariş için öğeleri al
      for (const order of orders) {
        const items = await db.getAllAsync<OrderItem & { name: string; image: string }>(
          `SELECT oi.*, p.name, p.image 
           FROM order_items oi 
           JOIN products p ON oi.productId = p.id 
           WHERE oi.orderId = ?`,
          [order.id]
        );

        order.items = items?.map(item => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          product: {
            id: item.productId,
            name: item.name,
            description: '',
            price: item.price,
            category: '',
            image: item.image,
            stock: 0,
            brand: '',
            rating: 0,
            reviewCount: 0
          }
        })) || [];
      }

      return orders;
    } catch (error) {
      console.error('Error getting user orders:', error);
      return [];
    }
  }

  static async getById(id: number): Promise<Order | null> {
    try {
      const order = await db.getFirstAsync<Order>(
        'SELECT * FROM orders WHERE id = ?',
        [id]
      );

      if (!order) return null;

      // Sipariş öğelerini al
      const items = await db.getAllAsync<OrderItem & { name: string; image: string; brand: string }>(
        `SELECT oi.*, p.name, p.image, p.brand 
         FROM order_items oi 
         JOIN products p ON oi.productId = p.id 
         WHERE oi.orderId = ?`,
        [order.id]
      );

      order.items = items?.map(item => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        product: {
          id: item.productId,
          name: item.name,
          description: '',
          price: item.price,
          category: '',
          image: item.image,
          stock: 0,
          brand: item.brand,
          rating: 0,
          reviewCount: 0
        }
      })) || [];

      return order;
    } catch (error) {
      console.error('Error getting order by id:', error);
      return null;
    }
  }

  static async updateStatus(id: number, status: OrderStatus): Promise<boolean> {
    try {
      await db.runAsync(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
      );
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  static async cancel(id: number): Promise<boolean> {
    try {
      const order = await this.getById(id);
      if (!order || order.status !== OrderStatus.PENDING) {
        return false;
      }

      // Stokları geri yükle
      for (const item of order.items) {
        await db.runAsync(
          'UPDATE products SET stock = stock + ? WHERE id = ?',
          [item.quantity, item.productId]
        );
      }

      // Sipariş durumunu güncelle
      return await this.updateStatus(id, OrderStatus.CANCELLED);
    } catch (error) {
      console.error('Error cancelling order:', error);
      return false;
    }
  }
}