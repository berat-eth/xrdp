// Product Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  stock: number;
  brand: string;
  rating: number;
  reviewCount: number;
}

// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  createdAt: string;
}

// Cart Types
export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  userId: number;
  product?: Product;
}

// Order Types
export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: string;
  paymentMethod: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  product?: Product;
}

export enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled'
}

// Category Types
export const Categories = {
  JACKETS: 'Ceketler',
  PANTS: 'Pantolonlar',
  SHOES: 'Ayakkabılar',
  BACKPACKS: 'Sırt Çantaları',
  TENTS: 'Çadırlar',
  SLEEPING_BAGS: 'Uyku Tulumları',
  ACCESSORIES: 'Aksesuarlar'
} as const;