import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { OrderController } from '../controllers/OrderController';
import { CartController } from '../controllers/CartController';
import { UserController } from '../controllers/UserController';
import { ProductController } from '../controllers/ProductController';
import { CartItem, User } from '../utils/types';
import { LoadingIndicator } from '../components/LoadingIndicator';

interface OrderScreenProps {
  navigation: any;
}

export const OrderScreen: React.FC<OrderScreenProps> = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');

  useEffect(() => {
    loadOrderData();
  }, []);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const user = await UserController.getCurrentUser();
      
      if (!user) {
        Alert.alert('Hata', 'Lütfen giriş yapın');
        navigation.navigate('Profile');
        return;
      }

      setCurrentUser(user);
      setShippingAddress(user.address || '');
      
      const items = await CartController.getCartItems(user.id);
      setCartItems(items);
      
      if (items.length === 0) {
        Alert.alert('Hata', 'Sepetiniz boş');
        navigation.navigate('Cart');
      }
    } catch (error) {
      console.error('Error loading order data:', error);
      Alert.alert('Hata', 'Veri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteOrder = async () => {
    if (!shippingAddress.trim()) {
      Alert.alert('Hata', 'Lütfen teslimat adresi girin');
      return;
    }

    if (shippingAddress.trim().length < 20) {
      Alert.alert('Hata', 'Lütfen geçerli bir teslimat adresi girin');
      return;
    }

    Alert.alert(
      'Siparişi Onayla',
      'Siparişinizi onaylamak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: async () => {
            setProcessing(true);
            try {
              const result = await OrderController.createOrder(
                currentUser!.id,
                shippingAddress,
                paymentMethod
              );

              if (result.success && result.orderId) {
                Alert.alert(
                  'Başarılı',
                  'Siparişiniz başarıyla oluşturuldu!',
                  [
                    {
                      text: 'Tamam',
                      onPress: () => {
                        navigation.reset({
                          index: 1,
                          routes: [
                            { name: 'Home' },
                            { name: 'Orders' }
                          ],
                        });
                      }
                    }
                  ]
                );
              } else {
                Alert.alert('Hata', result.message);
              }
            } catch (error) {
              Alert.alert('Hata', 'Sipariş oluşturulurken bir hata oluştu');
            } finally {
              setProcessing(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  const subtotal = CartController.calculateSubtotal(cartItems);
  const shipping = CartController.calculateShipping(subtotal);
  const total = CartController.calculateTotal(subtotal, shipping);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Sipariş Özeti */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sipariş Özeti</Text>
              <View style={styles.summaryCard}>
                <Text style={styles.itemCount}>
                  {cartItems.length} ürün
                </Text>
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
              </View>
            </View>

            {/* Teslimat Adresi */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Teslimat Adresi</Text>
              <TextInput
                style={styles.addressInput}
                value={shippingAddress}
                onChangeText={setShippingAddress}
                placeholder="Teslimat adresinizi girin..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Ödeme Yöntemi */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ödeme Yöntemi</Text>
              
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'credit_card' && styles.selectedPayment
                ]}
                onPress={() => setPaymentMethod('credit_card')}
              >
                <Text style={styles.paymentIcon}>💳</Text>
                <Text style={styles.paymentText}>Kredi Kartı</Text>
                {paymentMethod === 'credit_card' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'debit_card' && styles.selectedPayment
                ]}
                onPress={() => setPaymentMethod('debit_card')}
              >
                <Text style={styles.paymentIcon}>💳</Text>
                <Text style={styles.paymentText}>Banka Kartı</Text>
                {paymentMethod === 'debit_card' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'cash_on_delivery' && styles.selectedPayment
                ]}
                onPress={() => setPaymentMethod('cash_on_delivery')}
              >
                <Text style={styles.paymentIcon}>💵</Text>
                <Text style={styles.paymentText}>Kapıda Ödeme</Text>
                {paymentMethod === 'cash_on_delivery' && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.completeButton, processing && styles.disabledButton]}
            onPress={handleCompleteOrder}
            disabled={processing}
          >
            <Text style={styles.completeButtonText}>
              {processing ? 'İşleniyor...' : 'Siparişi Tamamla'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
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
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  addressInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
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
  selectedPayment: {
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  completeButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});