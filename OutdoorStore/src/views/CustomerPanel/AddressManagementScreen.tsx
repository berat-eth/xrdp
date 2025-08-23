import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';

interface Address {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  isDefault: boolean;
}

export const AddressManagementScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      title: 'Ev',
      fullName: 'Ahmet Yılmaz',
      phone: '0555 123 4567',
      address: 'Atatürk Mah. Cumhuriyet Cad. No: 123/4',
      city: 'İstanbul',
      district: 'Kadıköy',
      isDefault: true,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    phone: '',
    address: '',
    city: '',
    district: '',
  });

  const handleSaveAddress = () => {
    if (!formData.title || !formData.fullName || !formData.address) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
      return;
    }

    if (editingAddress) {
      setAddresses(addresses.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...formData }
          : addr
      ));
    } else {
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0,
      };
      setAddresses([...addresses, newAddress]);
    }

    setShowAddModal(false);
    setEditingAddress(null);
    setFormData({
      title: '',
      fullName: '',
      phone: '',
      address: '',
      city: '',
      district: '',
    });
  };

  const handleDeleteAddress = (id: string) => {
    Alert.alert(
      'Adresi Sil',
      'Bu adresi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive',
          onPress: () => setAddresses(addresses.filter(addr => addr.id !== id))
        }
      ]
    );
  };

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id,
    })));
  };

  const openEditModal = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      title: address.title,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      district: address.district,
    });
    setShowAddModal(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setEditingAddress(null);
            setFormData({
              title: '',
              fullName: '',
              phone: '',
              address: '',
              city: '',
              district: '',
            });
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Yeni Adres Ekle</Text>
        </TouchableOpacity>

        {addresses.map((address) => (
          <View key={address.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressTitle}>{address.title}</Text>
              {address.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Varsayılan</Text>
                </View>
              )}
            </View>
            <Text style={styles.addressText}>{address.fullName}</Text>
            <Text style={styles.addressText}>{address.phone}</Text>
            <Text style={styles.addressText}>
              {address.address}, {address.district}/{address.city}
            </Text>
            <View style={styles.addressActions}>
              {!address.isDefault && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleSetDefault(address.id)}
                >
                  <Text style={styles.actionButtonText}>Varsayılan Yap</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditModal(address)}
              >
                <Text style={styles.actionButtonText}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteAddress(address.id)}
              >
                <Text style={[styles.actionButtonText, styles.deleteText]}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
              </Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#1E3A8A" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Adres Başlığı (Ev, İş, vb.)"
                placeholderTextColor="#94A3B8"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Ad Soyad"
                placeholderTextColor="#94A3B8"
                value={formData.fullName}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="Telefon"
                placeholderTextColor="#94A3B8"
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                keyboardType="phone-pad"
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Adres"
                placeholderTextColor="#94A3B8"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
                numberOfLines={3}
              />
              <TextInput
                style={styles.input}
                placeholder="İl"
                placeholderTextColor="#94A3B8"
                value={formData.city}
                onChangeText={(text) => setFormData({ ...formData, city: text })}
              />
              <TextInput
                style={styles.input}
                placeholder="İlçe"
                placeholderTextColor="#94A3B8"
                value={formData.district}
                onChangeText={(text) => setFormData({ ...formData, district: text })}
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveAddress}>
                <Text style={styles.saveButtonText}>Kaydet</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  addButton: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  addressCard: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  defaultBadge: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  addressActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E3A8A',
  },
  actionButtonText: {
    color: '#1E3A8A',
    fontSize: 14,
    fontWeight: '500',
  },
  deleteButton: {
    borderColor: '#DC2626',
  },
  deleteText: {
    color: '#DC2626',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#374151',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});