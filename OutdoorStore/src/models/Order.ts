import { supabase } from '../utils/supabase';
import { Order, OrderItem, OrderStatus, CartItem } from '../utils/types';
import { CartModel } from './Cart';
import { ProductModel } from './Product';

export class OrderModel {
  static async create(
    userId: string,
    shippingAddress: string,
    paymentMethod: string
  ): Promise<number | null> {
    try {
      // Get cart items
      const cartItems = await CartModel.getByUserId(userId);
      if (cartItems.length === 0) {
        console.error('Cart is empty');
        return null;
      }

      // Calculate total amount
      let totalAmount = 0;
      const orderItems: Omit<OrderItem, 'id' | 'orderId'>[] = [];

      for (const item of cartItems) {
        if (item.product) {
          totalAmount += item.product.price * item.quantity;
          orderItems.push({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          });

          // Update product stock
          const stockUpdated = await ProductModel.updateStock(item.productId, item.quantity);
          if (!stockUpdated) {
            throw new Error(`Failed to update stock for product ${item.productId}`);
          }
        }
      }

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          total_amount: totalAmount,
          status: OrderStatus.PENDING,
          shipping_address: shippingAddress,
          payment_method: paymentMethod
        })
        .select('id')
        .single();

      if (orderError || !order) {
        throw orderError || new Error('Failed to create order');
      }

      // Create order items
      const orderItemsData = orderItems.map(item => ({
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) {
        // Rollback order if items creation fails
        await supabase.from('orders').delete().eq('id', order.id);
        throw itemsError;
      }

      // Clear cart
      await CartModel.clear(userId);

      return order.id;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  static async getByUserId(userId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          total_amount,
          status,
          shipping_address,
          payment_method,
          created_at,
          order_items (
            id,
            order_id,
            product_id,
            quantity,
            price,
            products (
              id,
              name,
              description,
              price,
              category,
              image,
              stock,
              brand,
              rating,
              review_count
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Order interface
      return (data || []).map(order => ({
        id: order.id,
        userId: order.user_id,
        totalAmount: order.total_amount,
        status: order.status as OrderStatus,
        shippingAddress: order.shipping_address,
        paymentMethod: order.payment_method,
        createdAt: order.created_at,
        items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
          product: item.products ? {
            ...item.products,
            reviewCount: item.products.review_count
          } : undefined
        }))
      }));
    } catch (error) {
      console.error('Error getting orders by user id:', error);
      return [];
    }
  }

  static async getById(id: number): Promise<Order | null> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          user_id,
          total_amount,
          status,
          shipping_address,
          payment_method,
          created_at,
          order_items (
            id,
            order_id,
            product_id,
            quantity,
            price,
            products (
              id,
              name,
              description,
              price,
              category,
              image,
              stock,
              brand,
              rating,
              review_count
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error || !data) return null;

      // Transform the data to match our Order interface
      return {
        id: data.id,
        userId: data.user_id,
        totalAmount: data.total_amount,
        status: data.status as OrderStatus,
        shippingAddress: data.shipping_address,
        paymentMethod: data.payment_method,
        createdAt: data.created_at,
        items: (data.order_items || []).map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          quantity: item.quantity,
          price: item.price,
          product: item.products ? {
            ...item.products,
            reviewCount: item.products.review_count
          } : undefined
        }))
      };
    } catch (error) {
      console.error('Error getting order by id:', error);
      return null;
    }
  }

  static async updateStatus(id: number, status: OrderStatus): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }

  static async cancel(id: number): Promise<boolean> {
    try {
      // Get order details first
      const order = await this.getById(id);
      if (!order || order.status !== OrderStatus.PENDING) {
        console.error('Order cannot be cancelled');
        return false;
      }

      // Update order status
      const statusUpdated = await this.updateStatus(id, OrderStatus.CANCELLED);
      if (!statusUpdated) return false;

      // Restore product stock
      for (const item of order.items) {
        if (item.product) {
          const { error } = await supabase
            .from('products')
            .update({ stock: item.product.stock + item.quantity })
            .eq('id', item.productId);

          if (error) {
            console.error(`Failed to restore stock for product ${item.productId}:`, error);
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Error cancelling order:', error);
      return false;
    }
  }
}