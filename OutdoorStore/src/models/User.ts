import { supabase } from '../utils/supabase';
import { User } from '../utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class UserModel {
  static async create(user: Omit<User, 'id' | 'createdAt'>): Promise<string | null> {
    try {
      // Sign up user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password || '',
        options: {
          data: {
            name: user.name,
          }
        }
      });

      if (authError || !authData.user) {
        console.error('Error creating auth user:', authError);
        return null;
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || null,
          address: user.address || null
        });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        // Rollback auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return null;
      }

      return authData.user.id;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  static async getByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  static async getById(id: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        address: data.address || '',
        createdAt: data.created_at
      };
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  }

  static async update(id: string, data: Partial<User>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (data.name) updateData.name = data.name;
      if (data.phone) updateData.phone = data.phone;
      if (data.address) updateData.address = data.address;
      
      if (Object.keys(updateData).length === 0) return false;
      
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Update password separately if provided
      if (data.password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: data.password
        });
        
        if (passwordError) throw passwordError;
      }

      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  static async login(email: string, password: string): Promise<User | null> {
    try {
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        console.error('Authentication error:', authError);
        return null;
      }

      // Get user profile
      const user = await this.getById(authData.user.id);
      
      if (user) {
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      console.error('Error logging in:', error);
      return null;
    }
  }

  static async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      // First check Supabase auth session
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        await AsyncStorage.removeItem('currentUser');
        return null;
      }

      // Get full user profile
      const user = await this.getById(authUser.id);
      
      if (user) {
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      console.error('Error getting current user:', error);
      // Fallback to AsyncStorage
      try {
        const userStr = await AsyncStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
      } catch {
        return null;
      }
    }
  }
}