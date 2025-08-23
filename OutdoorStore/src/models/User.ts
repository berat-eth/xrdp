import db from '../utils/database';
import { User } from '../utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class UserModel {
  static async create(user: Omit<User, 'id' | 'createdAt'>): Promise<number | null> {
    try {
      const result = await db.runAsync(
        'INSERT INTO users (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
        [user.name, user.email, user.password, user.phone || '', user.address || '']
      );
      return result.lastInsertRowId;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  static async getByEmail(email: string): Promise<User | null> {
    try {
      const user = await db.getFirstAsync<User>(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return user || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  static async getById(id: number): Promise<User | null> {
    try {
      const user = await db.getFirstAsync<User>(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return user || null;
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  }

  static async update(id: number, data: Partial<User>): Promise<boolean> {
    try {
      const fields = [];
      const values = [];
      
      if (data.name) {
        fields.push('name = ?');
        values.push(data.name);
      }
      if (data.phone) {
        fields.push('phone = ?');
        values.push(data.phone);
      }
      if (data.address) {
        fields.push('address = ?');
        values.push(data.address);
      }
      if (data.password) {
        fields.push('password = ?');
        values.push(data.password);
      }
      
      if (fields.length === 0) return false;
      
      values.push(id);
      await db.runAsync(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      return false;
    }
  }

  static async login(email: string, password: string): Promise<User | null> {
    try {
      const user = await db.getFirstAsync<User>(
        'SELECT * FROM users WHERE email = ? AND password = ?',
        [email, password]
      );
      
      if (user) {
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      }
      
      return user || null;
    } catch (error) {
      console.error('Error logging in:', error);
      return null;
    }
  }

  static async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
}