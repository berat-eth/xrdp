import { OrderModel } from '../models/Order';
import { CartController } from './CartController';
import { Order, OrderStatus } from '../utils/types';

export class OrderController {
  static async createOrder(
    userId: number,
    shippingAddress: string,
    paymentMethod: string
  ): Promise<{
    success: boolean;
    message: string;
    orderId?: number;
  }> {
    try {
      // Sepet boş mu kontrol et
      const cartItems = await CartController.getCartItems(userId);
      if (cartItems.length === 0) {
        return { success: false, message: 'Sepetiniz boş' };
      }

      // Adres kontrolü
      if (!shippingAddress || shippingAddress.trim().length < 10) {
        return { success: false, message: 'Geçerli bir teslimat adresi giriniz' };
      }

      // Ödeme yöntemi kontrolü
      const validPaymentMethods = ['credit_card', 'debit_card', 'cash_on_delivery'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        return { success: false, message: 'Geçersiz ödeme yöntemi' };
      }

      const orderId = await OrderModel.create(userId, shippingAddress, paymentMethod);

      if (orderId) {
        return { 
          success: true, 
          message: 'Siparişiniz başarıyla oluşturuldu', 
          orderId 
        };
      } else {
        return { success: false, message: 'Sipariş oluşturulamadı' };
      }
    } catch (error) {
      console.error('OrderController - createOrder error:', error);
      return { success: false, message: 'Bir hata oluştu' };
    }
  }

  static async getUserOrders(userId: number): Promise<Order[]> {
    try {
      return await OrderModel.getByUserId(userId);
    } catch (error) {
      console.error('OrderController - getUserOrders error:', error);
      return [];
    }
  }

  static async getOrderDetails(orderId: number): Promise<Order | null> {
    try {
      return await OrderModel.getById(orderId);
    } catch (error) {
      console.error('OrderController - getOrderDetails error:', error);
      return null;
    }
  }

  static async cancelOrder(orderId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const cancelled = await OrderModel.cancel(orderId);
      
      if (cancelled) {
        return { success: true, message: 'Sipariş iptal edildi' };
      } else {
        return { 
          success: false, 
          message: 'Sipariş iptal edilemedi. Sipariş zaten işlemde olabilir.' 
        };
      }
    } catch (error) {
      console.error('OrderController - cancelOrder error:', error);
      return { success: false, message: 'Bir hata oluştu' };
    }
  }

  static async updateOrderStatus(orderId: number, status: OrderStatus): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const updated = await OrderModel.updateStatus(orderId, status);
      
      if (updated) {
        return { success: true, message: 'Sipariş durumu güncellendi' };
      } else {
        return { success: false, message: 'Sipariş durumu güncellenemedi' };
      }
    } catch (error) {
      console.error('OrderController - updateOrderStatus error:', error);
      return { success: false, message: 'Bir hata oluştu' };
    }
  }

  static getStatusText(status: OrderStatus): string {
    const statusTexts = {
      [OrderStatus.PENDING]: 'Beklemede',
      [OrderStatus.PROCESSING]: 'İşleniyor',
      [OrderStatus.SHIPPED]: 'Kargoya Verildi',
      [OrderStatus.DELIVERED]: 'Teslim Edildi',
      [OrderStatus.CANCELLED]: 'İptal Edildi'
    };
    return statusTexts[status] || status;
  }

  static getStatusColor(status: OrderStatus): string {
    const statusColors = {
      [OrderStatus.PENDING]: '#FFA500',
      [OrderStatus.PROCESSING]: '#4169E1',
      [OrderStatus.SHIPPED]: '#9370DB',
      [OrderStatus.DELIVERED]: '#32CD32',
      [OrderStatus.CANCELLED]: '#DC143C'
    };
    return statusColors[status] || '#808080';
  }

  static canCancelOrder(order: Order): boolean {
    return order.status === OrderStatus.PENDING;
  }

  static formatOrderDate(date: string): string {
    const orderDate = new Date(date);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return orderDate.toLocaleDateString('tr-TR', options);
  }

  static getPaymentMethodText(method: string): string {
    const methods: { [key: string]: string } = {
      'credit_card': 'Kredi Kartı',
      'debit_card': 'Banka Kartı',
      'cash_on_delivery': 'Kapıda Ödeme'
    };
    return methods[method] || method;
  }
}