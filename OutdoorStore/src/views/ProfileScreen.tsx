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
import { UserController } from '../controllers/UserController';
import { OrderController } from '../controllers/OrderController';
import { ProductController } from '../controllers/ProductController';
import { User, Order } from '../utils/types';
import { LoadingIndicator } from '../components/LoadingIndicator';

interface ProfileScreenProps {
  navigation: any;
}

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
    const result = await UserController.login(email, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      await loadUserOrders(result.user.id);
      setEmail('');
      setPassword('');
      Alert.alert('Başarılı', result.message);
    } else {
      Alert.alert('Hata', result.message);
    }
  };

  const handleRegister = async () => {
    const result = await UserController.register({
      name,
      email,
      password,
      phone,
      address,
    });

    if (result.success) {
      Alert.alert('Başarılı', result.message);
      setIsLogin(true);
      setName('');
      setPhone('');
      setAddress('');
    } else {
      Alert.alert('Hata', result.message);
    }
  };

  const handleLogout = async () => {
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
            Alert.alert('Başarılı', 'Çıkış yapıldı');
          },
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!currentUser) return;

    const result = await UserController.updateProfile(currentUser.id, {
      name,
      phone,
      address,
    });

    if (result.success) {
      const updatedUser = await UserController.getUserInfo(currentUser.id);
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
      setIsEditing(false);
      Alert.alert('Başarılı', result.message);
    } else {
      Alert.alert('Hata', result.message);
    }
  };

  const startEditing = () => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
      setIsEditing(true);
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  // Giriş yapmamış kullanıcı ekranı
  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.authContainer}>
              <Text style={styles.authTitle}>
                {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
              </Text>

              {!isLogin && (
                <TextInput
                  style={styles.input}
                  placeholder="Ad Soyad"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#999"
                />
              )}

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />

              <TextInput
                style={styles.input}
                placeholder="Şifre"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#999"
              />

              {!isLogin && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Telefon (Opsiyonel)"
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Adres (Opsiyonel)"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={3}
                    placeholderTextColor="#999"
                  />
                </>
              )}

              <TouchableOpacity
                style={styles.authButton}
                onPress={isLogin ? handleLogin : handleRegister}
              >
                <Text style={styles.authButtonText}>
                  {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.switchButton}
                onPress={() => {
                  setIsLogin(!isLogin);
                  setEmail('');
                  setPassword('');
                  setName('');
                  setPhone('');
                  setAddress('');
                }}
              >
                <Text style={styles.switchButtonText}>
                  {isLogin
                    ? 'Hesabınız yok mu? Kayıt olun'
                    : 'Hesabınız var mı? Giriş yapın'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Giriş yapmış kullanıcı ekranı
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.profileContainer}>
          {/* Profil Bilgileri */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Profil Bilgileri</Text>
              {!isEditing && (
                <TouchableOpacity onPress={startEditing}>
                  <Text style={styles.editButton}>Düzenle</Text>
                </TouchableOpacity>
              )}
            </View>

            {isEditing ? (
              <View style={styles.editForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Ad Soyad"
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Telefon"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Adres"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#999"
                />
                <View style={styles.editButtons}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsEditing(false)}
                  >
                    <Text style={styles.cancelButtonText}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleUpdateProfile}
                  >
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.profileInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ad Soyad:</Text>
                  <Text style={styles.infoValue}>{currentUser.name || ''}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{currentUser.email || ''}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Telefon:</Text>
                  <Text style={styles.infoValue}>
                    {currentUser.phone || 'Belirtilmemiş'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Adres:</Text>
                  <Text style={styles.infoValue}>
                    {currentUser.address || 'Belirtilmemiş'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Siparişlerim */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Siparişlerim</Text>
            {orders.length === 0 ? (
              <Text style={styles.noOrders}>Henüz siparişiniz yok</Text>
            ) : (
              orders.map((order) => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
                >
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Sipariş #{order.id}</Text>
                    <Text
                      style={[
                        styles.orderStatus,
                        { color: OrderController.getStatusColor(order.status) }
                      ]}
                    >
                      {OrderController.getStatusText(order.status)}
                    </Text>
                  </View>
                  <Text style={styles.orderDate}>
                    {OrderController.formatOrderDate(order.createdAt)}
                  </Text>
                  <Text style={styles.orderTotal}>
                    Toplam: {ProductController.formatPrice(order.totalAmount)}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Çıkış Yap */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  authContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  authTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  authButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  authButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  switchButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchButtonText: {
    fontSize: 16,
    color: '#2E7D32',
  },
  profileContainer: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  editButton: {
    fontSize: 16,
    color: '#2E7D32',
    fontWeight: '600',
  },
  profileInfo: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    flex: 2,
  },
  editForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
    marginRight: 8,
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    marginLeft: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  orderStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  noOrders: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    padding: 20,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});