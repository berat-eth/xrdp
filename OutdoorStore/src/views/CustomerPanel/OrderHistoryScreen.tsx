import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'delivered' | 'shipping' | 'preparing' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
  trackingNumber?: string;
}

export const OrderHistoryScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: '12345',
      date: '15 Ocak 2024',
      status: 'delivered',
      totalAmount: 189.90,
      items: [
        {
          id: '1',
          productName: 'Outdoor Çadır 2 Kişilik',
          productImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=200',
          price: 189.90,
          quantity: 1,
        },
      ],
      trackingNumber: 'TR123456789',
    },
    {
      id: '2',
      orderNumber: '12344',
      date: '10 Ocak 2024',
      status: 'shipping',
      totalAmount: 329.99,
      items: [
        {
          id: '1',
          productName: 'Trekking Ayakkabısı',
          productImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200',
          price: 329.99,
          quantity: 1,
        },
      ],
      trackingNumber: 'TR987654321',
    },
    {
      id: '3',
      orderNumber: '12343',
      date: '5 Ocak 2024',
      status: 'preparing',
      totalAmount: 450.00,
      items: [
        {
          id: '1',
          productName: 'Sırt Çantası 50L',
          productImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200',
          price: 250.00,
          quantity: 1,
        },
        {
          id: '2',
          productName: 'Kamp Matı',
          productImage: 'https://images.unsplash.com/photo-1520095972714-909e91b038e5?w=200',
          price: 200.00,
          quantity: 1,
        },
      ],
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return '#059669';
      case 'shipping':
        return '#3B82F6';
      case 'preparing':
        return '#F59E0B';
      case 'cancelled':
        return '#DC2626';
      default:
        return '#64748B';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'Teslim Edildi';
      case 'shipping':
        return 'Kargoda';
      case 'preparing':
        return 'Hazırlanıyor';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'delivered':
        return 'check-circle';
      case 'shipping':
        return 'truck-delivery';
      case 'preparing':
        return 'package-variant';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'information';
    }
  };

  const renderOrder = (order: Order) => (
    <TouchableOpacity
      key={order.id}
      style={styles.orderCard}
      onPress={() => navigation.navigate('OrderDetail', { order })}
    >
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>Sipariş #{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{order.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <MaterialCommunityIcons
            name={getStatusIcon(order.status) as any}
            size={16}
            color={getStatusColor(order.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.items.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <Image source={{ uri: item.productImage }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>{item.productName}</Text>
              <Text style={styles.productQuantity}>Adet: {item.quantity}</Text>
            </View>
            <Text style={styles.productPrice}>₺{item.price.toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalLabel}>Toplam:</Text>
        <Text style={styles.totalAmount}>₺{order.totalAmount.toFixed(2)}</Text>
      </View>

      {order.trackingNumber && order.status === 'shipping' && (
        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => navigation.navigate('CargoTracking', { trackingNumber: order.trackingNumber })}
        >
          <MaterialCommunityIcons name="truck-fast" size={20} color="#FFFFFF" />
          <Text style={styles.trackButtonText}>Kargo Takibi</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#1E3A8A']}
          />
        }
      >
        {orders.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="package-variant-closed" size={64} color="#94A3B8" />
            <Text style={styles.emptyText}>Henüz siparişiniz bulunmuyor</Text>
          </View>
        ) : (
          orders.map(renderOrder)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  orderCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderItems: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: '#1F2937',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 12,
    color: '#64748B',
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  trackButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  trackButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 16,
  },
});