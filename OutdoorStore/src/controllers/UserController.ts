import { UserModel } from '../models/User';
import { User } from '../utils/types';

export class UserController {
  static async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }): Promise<{ success: boolean; message: string; userId?: number }> {
    try {
      // Email validasyonu
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        return { success: false, message: 'Geçerli bir email adresi giriniz' };
      }

      // Şifre validasyonu
      if (userData.password.length < 6) {
        return { success: false, message: 'Şifre en az 6 karakter olmalıdır' };
      }

      // Email zaten kayıtlı mı kontrol et
      const existingUser = await UserModel.getByEmail(userData.email);
      if (existingUser) {
        return { success: false, message: 'Bu email adresi zaten kayıtlı' };
      }

      // Kullanıcıyı oluştur
      const userId = await UserModel.create({
        name: userData.name,
        email: userData.email,
        password: userData.password, // Gerçek uygulamada hash'lenmeli
        phone: userData.phone || '',
        address: userData.address || ''
      });

      if (userId) {
        return { success: true, message: 'Kayıt başarılı', userId };
      } else {
        return { success: false, message: 'Kayıt sırasında bir hata oluştu' };
      }
    } catch (error) {
      console.error('UserController - register error:', error);
      return { success: false, message: 'Bir hata oluştu' };
    }
  }

  static async login(email: string, password: string): Promise<{ 
    success: boolean; 
    message: string; 
    user?: User 
  }> {
    try {
      // Email validasyonu
      if (!email || !password) {
        return { success: false, message: 'Email ve şifre gereklidir' };
      }

      const user = await UserModel.login(email, password);
      
      if (user) {
        return { success: true, message: 'Giriş başarılı', user };
      } else {
        return { success: false, message: 'Email veya şifre hatalı' };
      }
    } catch (error) {
      console.error('UserController - login error:', error);
      return { success: false, message: 'Giriş sırasında bir hata oluştu' };
    }
  }

  static async logout(): Promise<boolean> {
    try {
      await UserModel.logout();
      return true;
    } catch (error) {
      console.error('UserController - logout error:', error);
      return false;
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      return await UserModel.getCurrentUser();
    } catch (error) {
      console.error('UserController - getCurrentUser error:', error);
      return null;
    }
  }

  static async updateProfile(userId: number, data: {
    name?: string;
    phone?: string;
    address?: string;
    password?: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      // Validasyonlar
      if (data.password && data.password.length < 6) {
        return { success: false, message: 'Şifre en az 6 karakter olmalıdır' };
      }

      const updated = await UserModel.update(userId, data);
      
      if (updated) {
        return { success: true, message: 'Profil güncellendi' };
      } else {
        return { success: false, message: 'Güncelleme başarısız' };
      }
    } catch (error) {
      console.error('UserController - updateProfile error:', error);
      return { success: false, message: 'Bir hata oluştu' };
    }
  }

  static async getUserInfo(userId: number): Promise<User | null> {
    try {
      return await UserModel.getById(userId);
    } catch (error) {
      console.error('UserController - getUserInfo error:', error);
      return null;
    }
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
      return { valid: false, message: 'Şifre en az 6 karakter olmalıdır' };
    }
    return { valid: true };
  }
}