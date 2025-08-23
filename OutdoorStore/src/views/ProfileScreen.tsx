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
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { UserController } from '../controllers/UserController';
import { OrderController } from '../controllers/OrderController';
import { ProductController } from '../controllers/ProductController';
import { User, Order } from '../utils/types';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { theme } from '../utils/theme';

const { width } = Dimensions.get('window');

interface ProfileScreenProps {
  navigation: any;
}

interface DashboardCardProps {
  icon: string;
  title: string;
  value: string | number;
  color?: string;
  onPress?: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ icon, title, value, color = theme.colors.primary, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animatable.View animation="fadeInUp" duration={800} style={[styles.dashboardCard, { borderColor: color }]}>
        <View style={[styles.cardIconContainer, { backgroundColor: color + '15' }]}>
          <Ionicons name={icon as any} size={28} color={color} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={[styles.cardValue, { color }]}>{value}</Text>
      </Animatable.View>
    </TouchableOpacity>
  );
};

interface MenuItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, title, subtitle, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon as any} size={22} color={theme.colors.primary} />
        </View>
        <View>
          <Text style={styles.menuItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
    </TouchableOpacity>
  );
};

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);
      const user = await UserController.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        await loadUserOrders(user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserOrders = async (userId: number) => {
    try {
      const userOrders = await OrderController.getUserOrders(userId);
      setOrders(userOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    try {
      const user = await UserController.login(email, password);
      if (user) {
        setCurrentUser(user);
        await loadUserOrders(user.id);
        // Reset form
        setEmail('');
        setPassword('');
      } else {
        Alert.alert('Hata', 'Geçersiz email veya şifre');
      }
    } catch (error) {
      Alert.alert('Hata', 'Giriş yapılırken bir hata oluştu');
    }
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun');
      return;
    }

    try {
      const user = await UserController.register({
        email,
        password,
        name,
        phone,
        address,
      });
      
      if (user) {
        setCurrentUser(user);
        // Reset form
        setEmail('');
        setPassword('');
        setName('');
        setPhone('');
        setAddress('');
        Alert.alert('Başarılı', 'Kayıt başarıyla tamamlandı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Kayıt olurken bir hata oluştu');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await UserController.logout();
            setCurrentUser(null);
            setOrders([]);
          },
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) return;

    try {
      const updated = await UserController.updateProfile(currentUser.id, {
        name,
        phone,
        address,
      });
      
      if (updated) {
        setCurrentUser(updated);
        setIsEditing(false);
        Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi');
      }
    } catch (error) {
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu');
    }
  };

  const startEditing = () => {
    if (currentUser) {
      setName(currentUser.name);
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
      setIsEditing(true);
    }
  };

  const getOrderStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      pending: 'Beklemede',
      completed: 'Tamamlandı',
      cancelled: 'İptal Edildi',
    };
    return statusMap[status] || status;
  };

  const getOrderStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      pending: theme.colors.warning,
      completed: theme.colors.success,
      cancelled: theme.colors.error,
    };
    return colorMap[status] || theme.colors.text;
  };

  const getTotalSpent = () => {
    return orders
      .filter(order => order.status === 'completed')
      .reduce((total, order) => total + order.totalAmount, 0);
  };

  const getActiveOrders = () => {
    return orders.filter(order => order.status === 'pending').length;
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.authContainer}>
            <Animatable.View animation="fadeIn" duration={1000} style={styles.authHeader}>
              <View style={styles.logoContainer}>
                <Ionicons name="person-circle-outline" size={80} color={theme.colors.primary} />
              </View>
              <Text style={styles.authTitle}>Huğlu Outdoor</Text>
              <Text style={styles.authSubtitle}>
                {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
              </Text>
            </Animatable.View>

            <Animatable.View animation="fadeInUp" duration={1000} delay={200} style={styles.authForm}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="E-posta"
                  placeholderTextColor={theme.colors.textLight}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifre"
                  placeholderTextColor={theme.colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              {!isLogin && (
                <>
                  <View style={styles.inputContainer}>
                    <Ionicons name="person-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Ad Soyad *"
                      placeholderTextColor={theme.colors.textLight}
                      value={name}
                      onChangeText={setName}
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="call-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Telefon"
                      placeholderTextColor={theme.colors.textLight}
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.inputContainer}>
                    <Ionicons name="location-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      placeholder="Adres"
                      placeholderTextColor={theme.colors.textLight}
                      value={address}
                      onChangeText={setAddress}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                </>
              )}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={isLogin ? handleLogin : handleRegister}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryButtonText}>
                  {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => setIsLogin(!isLogin)}
              >
                <Text style={styles.switchButtonText}>
                  {isLogin ? 'Hesabınız yok mu? Kayıt olun' : 'Zaten hesabınız var mı? Giriş yapın'}
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Customer Dashboard
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.profileHeader}
        >
          <Animatable.View animation="fadeIn" duration={1000} style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            </View>
            <Text style={styles.profileName}>{currentUser.name}</Text>
            <Text style={styles.profileEmail}>{currentUser.email}</Text>
          </Animatable.View>
        </LinearGradient>

        {/* Dashboard Cards */}
        <View style={styles.dashboardSection}>
          <Text style={styles.sectionTitle}>Hesap Özeti</Text>
          <View style={styles.dashboardGrid}>
            <DashboardCard
              icon="cart-outline"
              title="Toplam Sipariş"
              value={orders.length}
              color={theme.colors.primary}
            />
            <DashboardCard
              icon="hourglass-outline"
              title="Aktif Sipariş"
              value={getActiveOrders()}
              color={theme.colors.warning}
            />
            <DashboardCard
              icon="checkmark-circle-outline"
              title="Tamamlanan"
              value={orders.filter(o => o.status === 'completed').length}
              color={theme.colors.success}
            />
            <DashboardCard
              icon="cash-outline"
              title="Toplam Harcama"
              value={`₺${getTotalSpent().toFixed(2)}`}
              color={theme.colors.accent}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <MenuItem
            icon="receipt-outline"
            title="Siparişlerim"
            subtitle={`${orders.length} sipariş`}
            onPress={() => {/* Navigate to orders */}}
          />
          <MenuItem
            icon="heart-outline"
            title="Favorilerim"
            subtitle="Beğendiğiniz ürünler"
            onPress={() => {/* Navigate to favorites */}}
          />
          <MenuItem
            icon="location-outline"
            title="Adreslerim"
            subtitle="Teslimat adresleri"
            onPress={() => {/* Navigate to addresses */}}
          />
          <MenuItem
            icon="card-outline"
            title="Ödeme Yöntemlerim"
            subtitle="Kayıtlı kartlarınız"
            onPress={() => {/* Navigate to payment methods */}}
          />
        </View>

        {/* Account Settings */}
        <View style={styles.accountSettings}>
          <Text style={styles.sectionTitle}>Hesap Ayarları</Text>
          <MenuItem
            icon="person-outline"
            title="Profil Bilgileri"
            onPress={startEditing}
          />
          <MenuItem
            icon="notifications-outline"
            title="Bildirim Ayarları"
            onPress={() => {/* Navigate to notifications */}}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            title="Güvenlik"
            onPress={() => {/* Navigate to security */}}
          />
          <MenuItem
            icon="help-circle-outline"
            title="Yardım & Destek"
            onPress={() => {/* Navigate to help */}}
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      {isEditing && (
        <View style={styles.modalOverlay}>
          <Animatable.View animation="slideInUp" duration={400} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profil Bilgilerini Düzenle</Text>
              <TouchableOpacity onPress={() => setIsEditing(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ad Soyad"
                  placeholderTextColor={theme.colors.textLight}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Telefon"
                  placeholderTextColor={theme.colors.textLight}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="location-outline" size={20} color={theme.colors.textLight} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Adres"
                  placeholderTextColor={theme.colors.textLight}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <TouchableOpacity style={styles.primaryButton} onPress={handleUpdateProfile}>
                <Text style={styles.primaryButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animatable.View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  authContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  authHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoContainer: {
    marginBottom: theme.spacing.md,
  },
  authTitle: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  authSubtitle: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textLight,
  },
  authForm: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
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
  primaryButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    ...theme.shadows.md,
  },
  primaryButtonText: {
    color: theme.colors.secondary,
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
  },
  switchButton: {
    alignItems: 'center',
    marginTop: theme.spacing.lg,
  },
  switchButtonText: {
    color: theme.colors.primary,
    fontSize: theme.fonts.sizes.sm,
  },
  profileHeader: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: theme.colors.secondary,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  profileName: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.secondary,
    opacity: 0.8,
  },
  dashboardSection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dashboardCard: {
    width: (width - theme.spacing.lg * 3) / 2,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    ...theme.shadows.sm,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textLight,
    marginBottom: theme.spacing.xs,
  },
  cardValue: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
  },
  quickActions: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuItemTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  menuItemSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  accountSettings: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.error,
    borderRadius: theme.borderRadius.lg,
  },
  logoutText: {
    color: theme.colors.error,
    fontSize: theme.fonts.sizes.md,
    fontWeight: '500',
    marginLeft: theme.spacing.sm,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingTop: theme.spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
});