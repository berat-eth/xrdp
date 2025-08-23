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
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { OrderController } from '../controllers/OrderController';
import { CartController } from '../controllers/CartController';
import { UserController } from '../controllers/UserController';
import { ProductController } from '../controllers/ProductController';
import { CartItem, User } from '../utils/types';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

interface OrderScreenProps {
  navigation: any;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <View style={styles.stepIndicator}>
      {steps.map((step, index) => (
        <View key={index} style={styles.stepContainer}>
          <View style={styles.stepWrapper}>
            <View
              style={[
                styles.stepCircle,
                index <= currentStep && styles.stepCircleActive,
                index < currentStep && styles.stepCircleCompleted,
              ]}
            >
              {index < currentStep ? (
                <Ionicons name="checkmark" size={16} color={theme.colors.secondary} />
              ) : (
                <Text style={[styles.stepNumber, index <= currentStep && styles.stepNumberActive]}>
                  {index + 1}
                </Text>
              )}
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentStep && styles.stepLineActive,
                ]}
              />
            )}
          </View>
          <Text style={[styles.stepLabel, index <= currentStep && styles.stepLabelActive]}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  );
};

interface PaymentMethodCardProps {
  icon: string;
  title: string;
  subtitle: string;
  isSelected: boolean;
  onPress: () => void;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  icon,
  title,
  subtitle,
  isSelected,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.paymentCard, isSelected && styles.paymentCardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.paymentCardLeft}>
        <View style={[styles.paymentIconContainer, isSelected && styles.paymentIconSelected]}>
          <Ionicons name={icon as any} size={24} color={isSelected ? theme.colors.secondary : theme.colors.primary} />
        </View>
        <View>
          <Text style={[styles.paymentTitle, isSelected && styles.paymentTitleSelected]}>{title}</Text>
          <Text style={[styles.paymentSubtitle, isSelected && styles.paymentSubtitleSelected]}>{subtitle}</Text>
        </View>
      </View>
      <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
        {isSelected && <View style={styles.radioButtonInner} />}
      </View>
    </TouchableOpacity>
  );
};

export const OrderScreen: React.FC<OrderScreenProps> = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const [shippingAddress, setShippingAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<string>('credit_card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [orderNote, setOrderNote] = useState('');

  const steps = ['Adres', 'Ödeme', 'Onay'];

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
      setPhone(user.phone || '');
      
      const items = await CartController.getCartItems();
      if (items.length === 0) {
        Alert.alert('Uyarı', 'Sepetiniz boş');
        navigation.goBack();
        return;
      }
      
      setCartItems(items);
    } catch (error) {
      console.error('Error loading order data:', error);
      Alert.alert('Hata', 'Sipariş bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal >= 500 ? 0 : 29.90;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const validateAddress = () => {
    if (!shippingAddress.trim() || !phone.trim() || !city.trim() || !district.trim()) {
      Alert.alert('Hata', 'Lütfen tüm adres bilgilerini doldurun');
      return false;
    }
    return true;
  };

  const validatePayment = () => {
    if (paymentMethod === 'credit_card') {
      if (!cardNumber.trim() || !cardName.trim() || !cardExpiry.trim() || !cardCvv.trim()) {
        Alert.alert('Hata', 'Lütfen tüm kart bilgilerini doldurun');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 0 && !validateAddress()) return;
    if (currentStep === 1 && !validatePayment()) return;
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress() || !validatePayment()) return;

    Alert.alert(
      'Siparişi Onayla',
      'Siparişinizi onaylamak istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: async () => {
            try {
              setProcessing(true);
              
              const orderData = {
                userId: currentUser!.id,
                items: cartItems,
                totalAmount: calculateTotal(),
                shippingAddress: `${shippingAddress}, ${district}/${city}`,
                paymentMethod,
                status: 'pending' as const,
                note: orderNote,
              };

              const order = await OrderController.createOrder(orderData);
              
              if (order) {
                await CartController.clearCart();
                
                // Simulate payment processing
                setTimeout(() => {
                  Alert.alert(
                    'Başarılı',
                    'Siparişiniz başarıyla oluşturuldu!',
                    [
                      {
                        text: 'Tamam',
                        onPress: () => {
                          navigation.reset({
                            index: 0,
                            routes: [{ name: 'Home' }],
                          });
                        },
                      },
                    ]
                  );
                }, 1500);
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

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g) || [];
    return chunks.join(' ').substr(0, 19);
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/[^\d]/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Progress Steps */}
          <StepIndicator currentStep={currentStep} steps={steps} />

          {/* Step Content */}
          <Animatable.View animation="fadeIn" duration={500} style={styles.content}>
            {/* Address Step */}
            {currentStep === 0 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Teslimat Adresi</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Telefon</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="(5XX) XXX XX XX"
                      placeholderTextColor={theme.colors.textLight}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>İl</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="location-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Örn: İstanbul"
                      placeholderTextColor={theme.colors.textLight}
                      value={city}
                      onChangeText={setCity}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>İlçe</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="location-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Örn: Kadıköy"
                      placeholderTextColor={theme.colors.textLight}
                      value={district}
                      onChangeText={setDistrict}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Açık Adres</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="home-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Mahalle, sokak, bina no..."
                      placeholderTextColor={theme.colors.textLight}
                      value={shippingAddress}
                      onChangeText={setShippingAddress}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Payment Step */}
            {currentStep === 1 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Ödeme Yöntemi</Text>
                
                <PaymentMethodCard
                  icon="card-outline"
                  title="Kredi/Banka Kartı"
                  subtitle="Güvenli ödeme"
                  isSelected={paymentMethod === 'credit_card'}
                  onPress={() => setPaymentMethod('credit_card')}
                />
                
                <PaymentMethodCard
                  icon="cash-outline"
                  title="Kapıda Ödeme"
                  subtitle="Nakit veya kart ile"
                  isSelected={paymentMethod === 'cash_on_delivery'}
                  onPress={() => setPaymentMethod('cash_on_delivery')}
                />
                
                <PaymentMethodCard
                  icon="business-outline"
                  title="Havale/EFT"
                  subtitle="Banka havalesi"
                  isSelected={paymentMethod === 'bank_transfer'}
                  onPress={() => setPaymentMethod('bank_transfer')}
                />

                {paymentMethod === 'credit_card' && (
                  <Animatable.View animation="fadeInUp" duration={500} style={styles.cardForm}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Kart Numarası</Text>
                      <View style={styles.inputContainer}>
                        <Ionicons name="card-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="XXXX XXXX XXXX XXXX"
                          placeholderTextColor={theme.colors.textLight}
                          value={cardNumber}
                          onChangeText={(text) => setCardNumber(formatCardNumber(text))}
                          keyboardType="numeric"
                          maxLength={19}
                        />
                      </View>
                    </View>

                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Kart Üzerindeki İsim</Text>
                      <View style={styles.inputContainer}>
                        <Ionicons name="person-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                        <TextInput
                          style={styles.input}
                          placeholder="AD SOYAD"
                          placeholderTextColor={theme.colors.textLight}
                          value={cardName}
                          onChangeText={setCardName}
                          autoCapitalize="characters"
                        />
                      </View>
                    </View>

                    <View style={styles.row}>
                      <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                        <Text style={styles.inputLabel}>Son Kullanma</Text>
                        <View style={styles.inputContainer}>
                          <Ionicons name="calendar-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="AA/YY"
                            placeholderTextColor={theme.colors.textLight}
                            value={cardExpiry}
                            onChangeText={(text) => setCardExpiry(formatExpiry(text))}
                            keyboardType="numeric"
                            maxLength={5}
                          />
                        </View>
                      </View>

                      <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                        <Text style={styles.inputLabel}>CVV</Text>
                        <View style={styles.inputContainer}>
                          <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                          <TextInput
                            style={styles.input}
                            placeholder="XXX"
                            placeholderTextColor={theme.colors.textLight}
                            value={cardCvv}
                            onChangeText={setCardCvv}
                            keyboardType="numeric"
                            maxLength={3}
                            secureTextEntry
                          />
                        </View>
                      </View>
                    </View>
                  </Animatable.View>
                )}
              </View>
            )}

            {/* Confirmation Step */}
            {currentStep === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Sipariş Özeti</Text>
                
                {/* Order Items */}
                <View style={styles.orderSummary}>
                  <Text style={styles.sectionSubtitle}>Ürünler</Text>
                  {cartItems.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <View style={styles.orderItemLeft}>
                        <Text style={styles.orderItemName}>{item.name}</Text>
                        <Text style={styles.orderItemQuantity}>{item.quantity} adet</Text>
                      </View>
                      <Text style={styles.orderItemPrice}>
                        {ProductController.formatPrice(item.price * item.quantity)}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Delivery Address */}
                <View style={styles.confirmSection}>
                  <View style={styles.confirmHeader}>
                    <Ionicons name="location-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.confirmTitle}>Teslimat Adresi</Text>
                  </View>
                  <Text style={styles.confirmText}>{shippingAddress}</Text>
                  <Text style={styles.confirmText}>{district}, {city}</Text>
                  <Text style={styles.confirmText}>Tel: {phone}</Text>
                </View>

                {/* Payment Method */}
                <View style={styles.confirmSection}>
                  <View style={styles.confirmHeader}>
                    <Ionicons name="card-outline" size={20} color={theme.colors.primary} />
                    <Text style={styles.confirmTitle}>Ödeme Yöntemi</Text>
                  </View>
                  <Text style={styles.confirmText}>
                    {paymentMethod === 'credit_card' && 'Kredi/Banka Kartı'}
                    {paymentMethod === 'cash_on_delivery' && 'Kapıda Ödeme'}
                    {paymentMethod === 'bank_transfer' && 'Havale/EFT'}
                  </Text>
                </View>

                {/* Order Note */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Sipariş Notu (Opsiyonel)</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="create-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Teslimat ile ilgili notunuz..."
                      placeholderTextColor={theme.colors.textLight}
                      value={orderNote}
                      onChangeText={setOrderNote}
                      multiline
                      numberOfLines={2}
                    />
                  </View>
                </View>

                {/* Price Summary */}
                <View style={styles.priceSummary}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Ara Toplam</Text>
                    <Text style={styles.priceValue}>
                      {ProductController.formatPrice(calculateSubtotal())}
                    </Text>
                  </View>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Kargo</Text>
                    <Text style={[styles.priceValue, calculateShipping() === 0 && styles.freeShipping]}>
                      {calculateShipping() === 0 ? 'Ücretsiz' : ProductController.formatPrice(calculateShipping())}
                    </Text>
                  </View>
                  <View style={[styles.priceRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Toplam</Text>
                    <Text style={styles.totalValue}>
                      {ProductController.formatPrice(calculateTotal())}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </Animatable.View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handlePreviousStep}
              >
                <Ionicons name="arrow-back" size={20} color={theme.colors.primary} />
                <Text style={styles.secondaryButtonText}>Geri</Text>
              </TouchableOpacity>
            )}
            
            {currentStep < steps.length - 1 ? (
              <TouchableOpacity
                style={[styles.primaryButton, currentStep === 0 && styles.fullWidthButton]}
                onPress={handleNextStep}
              >
                <Text style={styles.primaryButtonText}>Devam Et</Text>
                <Ionicons name="arrow-forward" size={20} color={theme.colors.secondary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, styles.confirmButton]}
                onPress={handlePlaceOrder}
                disabled={processing}
              >
                {processing ? (
                  <LoadingIndicator />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.secondary} />
                    <Text style={styles.primaryButtonText}>Siparişi Onayla</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  stepCircleCompleted: {
    backgroundColor: theme.colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textLight,
  },
  stepNumberActive: {
    color: theme.colors.secondary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: theme.colors.border,
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: theme.colors.primary,
  },
  stepLabel: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 8,
  },
  stepLabelActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  stepContent: {
    paddingBottom: theme.spacing.xl,
  },
  stepTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
  },
  textArea: {
    paddingTop: theme.spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  paymentCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  paymentCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  paymentIconSelected: {
    backgroundColor: theme.colors.primary,
  },
  paymentTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
  },
  paymentTitleSelected: {
    color: theme.colors.primary,
  },
  paymentSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  paymentSubtitleSelected: {
    color: theme.colors.primary,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    borderColor: theme.colors.primary,
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  cardForm: {
    marginTop: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
  },
  orderSummary: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
    color: theme.colors.textLight,
    marginBottom: theme.spacing.sm,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  orderItem: {
    borderBottomWidth: 0,
  },
  orderItemLeft: {
    flex: 1,
  },
  orderItemName: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
  },
  orderItemQuantity: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textLight,
  },
  orderItemPrice: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  confirmSection: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  confirmTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  confirmText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  priceSummary: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  priceLabel: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textLight,
  },
  priceValue: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
    fontWeight: '500',
  },
  freeShipping: {
    color: theme.colors.success,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.md,
  },
  totalLabel: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  totalValue: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.md,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  fullWidthButton: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: theme.colors.success,
  },
  primaryButtonText: {
    color: theme.colors.secondary,
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
  },
});