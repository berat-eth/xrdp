import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Share,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CartController } from '../controllers/CartController';
import { UserController } from '../controllers/UserController';
import { ProductController } from '../controllers/ProductController';
import { CartItem } from '../utils/types';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { EmptyState } from '../components/EmptyState';

interface CartScreenProps {
  navigation: any;
}

export const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    checkUserAndLoadCart();
  }, []);

  const checkUserAndLoadCart = async () => {
    const user = await UserController.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      await loadCartItems(user.id);
    } else {
      setLoading(false);
    }
  };

  const loadCartItems = async (userId: number) => {
    try {
      setLoading(true);
      const items = await CartController.getCartItems(userId);
      setCartItems(items);
    } catch (error) {
      console.error('Error loading cart items:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (currentUser) {
      setRefreshing(true);
      await loadCartItems(currentUser.id);
    }
  };

  const handleQuantityChange = async (
    cartItemId: number,
    currentQuantity: number,
    action: 'increase' | 'decrease'
  ) => {
    try {
      let result;
      if (action === 'increase') {
        result = await CartController.increaseQuantity(cartItemId, currentQuantity);
      } else {
        result = await CartController.decreaseQuantity(cartItemId, currentQuantity);
      }

      if (result.success) {
        await loadCartItems(currentUser.id);
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      Alert.alert('Hata', 'İşlem gerçekleştirilemedi');
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    Alert.alert(
      'Ürünü Kaldır',
      'Bu ürünü sepetten kaldırmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            const result = await CartController.removeFromCart(cartItemId);
            if (result.success) {
              await loadCartItems(currentUser.id);
            } else {
              Alert.alert('Hata', result.message);
            }
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert('Hata', 'Sepetiniz boş');
      return;
    }
    navigation.navigate('Order');
  };

  const handleShareCart = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Hata', 'Sepetiniz boş');
      return;
    }

    const cartSummary = cartItems.map((item) => 
      `• ${item.product?.name || 'Ürün'} (${item.quantity} adet) - ${ProductController.formatPrice(item.product?.price || 0)}`
    ).join('\n');

    const totalPrice = cartItems.reduce((sum, item) => 
      sum + (item.product?.price || 0) * item.quantity, 0
    );

    const message = `🛒 Sepetim:\n\n${cartSummary}\n\nToplam: ${ProductController.formatPrice(totalPrice)}\n\nHemen sen de bu ürünleri incele!`;

    try {
      await Share.share({
        message,
        title: 'Sepetimi Paylaş',
      });
    } catch (error) {
      console.error('Error sharing cart:', error);
    }
  };

  const renderCartItem = ({ item }: { item: CartItem }) => {
    if (!item.product) return null;

    return (
      <View style={styles.cartItem}>
        <Image
          source={{ uri: item.product.image }}
          style={styles.productImage}
        />
        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>{item.product.brand}</Text>
          <Text style={styles.productName} numberOfLines={2}>
            {item.product.name}
          </Text>
          <Text style={styles.productPrice}>
            {ProductController.formatPrice(item.product.price)}
          </Text>
          
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, item.quantity, 'decrease')}
            >
              <Text style={styles.quantityButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => handleQuantityChange(item.id, item.quantity, 'increase')}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveItem(item.id)}
            >
              <Text style={styles.removeButtonText}>🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState
          message="Sepetinizi görüntülemek için giriş yapın"
          icon="🛒"
        />
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const subtotal = CartController.calculateSubtotal(cartItems);
  const shipping = CartController.calculateShipping(subtotal);
  const total = CartController.calculateTotal(subtotal, shipping);

  return (
    <SafeAreaView style={styles.container}>
      {cartItems.length === 0 ? (
        <EmptyState
          message="Sepetiniz boş"
          icon="🛒"
        />
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />

          <View style={styles.footer}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Ara Toplam:</Text>
              <Text style={styles.priceValue}>
                {ProductController.formatPrice(subtotal)}
              </Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Kargo:</Text>
              <Text style={styles.priceValue}>
                {shipping === 0 ? 'Ücretsiz' : ProductController.formatPrice(shipping)}
              </Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Toplam:</Text>
              <Text style={styles.totalValue}>
                {ProductController.formatPrice(total)}
              </Text>
            </View>

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={handleShareCart}
              >
                <MaterialCommunityIcons name="share-variant" size={20} color="#1E3A8A" />
                <Text style={styles.shareButtonText}>Paylaş</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
              >
                <Text style={styles.checkoutButtonText}>Siparişi Tamamla</Text>
              </TouchableOpacity>
            </View>

            {shipping > 0 && (
              <Text style={styles.freeShippingInfo}>
                {ProductController.formatPrice(500 - subtotal)} daha alışveriş yapın, kargo ücretsiz!
              </Text>
            )}
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  quantityButtonText: {
    fontSize: 18,
    color: '#2E7D32',
  },
  quantity: {
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  removeButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  removeButtonText: {
    fontSize: 20,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1E3A8A',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E3A8A',
  },
  checkoutButton: {
    flex: 2,
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  freeShippingInfo: {
    fontSize: 14,
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 12,
  },
  loginButton: {
    backgroundColor: '#1E3A8A',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignSelf: 'center',
    marginTop: 20,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});