import { supabase } from '../utils/supabase';
import { CartItem, Product } from '../utils/types';

export class CartModel {
  static async getByUserId(userId: string): Promise<CartItem[]> {
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          id,
          user_id,
          product_id,
          quantity,
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
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our CartItem interface
      return (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        productId: item.product_id,
        quantity: item.quantity,
        product: item.products ? {
          ...item.products,
          reviewCount: item.products.review_count
        } : undefined
      }));
    } catch (error) {
      console.error('Error getting cart by user id:', error);
      return [];
    }
  }

  static async add(userId: string, productId: number, quantity: number): Promise<boolean> {
    try {
      // Check if item already exists in cart
      const { data: existingItem, error: checkError } = await supabase
        .from('cart')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = No rows found
        throw checkError;
      }

      if (existingItem) {
        // Update quantity if item exists
        const { error: updateError } = await supabase
          .from('cart')
          .update({ quantity: existingItem.quantity + quantity })
          .eq('id', existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from('cart')
          .insert({
            user_id: userId,
            product_id: productId,
            quantity
          });

        if (insertError) throw insertError;
      }

      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  static async updateQuantity(id: number, quantity: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart')
        .update({ quantity })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating cart quantity:', error);
      return false;
    }
  }

  static async remove(id: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  static async clear(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  static async getCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('cart')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }

  static async getTotalAmount(userId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('cart')
        .select(`
          quantity,
          products (price)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      let total = 0;
      (data || []).forEach(item => {
        if (item.products) {
          total += item.quantity * item.products.price;
        }
      });

      return total;
    } catch (error) {
      console.error('Error getting cart total:', error);
      return 0;
    }
  }
}