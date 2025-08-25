import { supabase } from '../utils/supabase';
import { Product } from '../utils/types';

export class ProductModel {
  static async getAll(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to interface fields
      return (data || []).map(product => ({
        ...product,
        reviewCount: product.review_count
      }));
    } catch (error) {
      console.error('Error getting all products:', error);
      return [];
    }
  }

  static async getById(id: number): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (!data) return null;
      
      // Map database fields to interface fields
      return {
        ...data,
        reviewCount: data.review_count
      };
    } catch (error) {
      console.error('Error getting product by id:', error);
      return null;
    }
  }

  static async getByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to interface fields
      return (data || []).map(product => ({
        ...product,
        reviewCount: product.review_count
      }));
    } catch (error) {
      console.error('Error getting products by category:', error);
      return [];
    }
  }

  static async search(query: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map database fields to interface fields
      return (data || []).map(product => ({
        ...product,
        reviewCount: product.review_count
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  static async updateStock(id: number, quantity: number): Promise<boolean> {
    try {
      // First, check if there's enough stock
      const { data: product, error: fetchError } = await supabase
        .from('products')
        .select('stock')
        .eq('id', id)
        .single();

      if (fetchError || !product) throw fetchError;

      if (product.stock < quantity) {
        console.error('Insufficient stock');
        return false;
      }

      // Update the stock
      const { error: updateError } = await supabase
        .from('products')
        .update({ stock: product.stock - quantity })
        .eq('id', id);

      if (updateError) throw updateError;

      return true;
    } catch (error) {
      console.error('Error updating product stock:', error);
      return false;
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .order('category');

      if (error) throw error;
      
      // Get unique categories
      const categories = [...new Set((data || []).map(item => item.category))];
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      return [];
    }
  }
}