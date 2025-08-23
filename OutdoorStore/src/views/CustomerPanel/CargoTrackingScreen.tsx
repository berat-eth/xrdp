import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';

interface TrackingStep {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  completed: boolean;
  active: boolean;
}

export const CargoTrackingScreen: React.FC<{ navigation: any; route: any }> = ({ 
  navigation, 
  route 
}) => {
  const { trackingNumber } = route.params || {};
  const [searchNumber, setSearchNumber] = useState(trackingNumber || '');
  const [loading, setLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<{
    orderNumber: string;
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
    steps: TrackingStep[];
  } | null>(null);

  useEffect(() => {
    if (trackingNumber) {
      handleSearch();
    }
  }, [trackingNumber]);

  const handleSearch = () => {
    if (!searchNumber.trim()) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setTrackingData({
        orderNumber: '12344',
        trackingNumber: searchNumber,
        carrier: 'Yurtiçi Kargo',
        estimatedDelivery: '20 Ocak 2024',
        steps: [
          {
            id: '1',
            title: 'Sipariş Alındı',
            description: 'Siparişiniz başarıyla alındı',
            date: '10 Ocak 2024',
            time: '14:30',
            completed: true,
            active: false,
          },
          {
            id: '2',
            title: 'Hazırlanıyor',
            description: 'Siparişiniz hazırlanıyor',
            date: '11 Ocak 2024',
            time: '09:15',
            completed: true,
            active: false,
          },
          {
            id: '3',
            title: 'Kargoya Verildi',
            description: 'Siparişiniz kargo şirketine teslim edildi',
            date: '12 Ocak 2024',
            time: '16:45',
            completed: true,
            active: false,
          },
          {
            id: '4',
            title: 'Transfer Merkezinde',
            description: 'İstanbul Transfer Merkezi',
            date: '13 Ocak 2024',
            time: '03:20',
            completed: true,
            active: false,
          },
          {
            id: '5',
            title: 'Dağıtıma Çıktı',
            description: 'Siparişiniz dağıtıma çıktı',
            date: '14 Ocak 2024',
            time: '08:00',
            completed: true,
            active: true,
          },
          {
            id: '6',
            title: 'Teslim Edildi',
            description: 'Siparişiniz teslim edilecek',
            date: '',
            time: '',
            completed: false,
            active: false,
          },
        ],
      });
      setLoading(false);
    }, 1500);
  };

  const renderTrackingStep = (step: TrackingStep, index: number, isLast: boolean) => (
    <View key={step.id} style={styles.stepContainer}>
      <View style={styles.stepIndicator}>
        <View style={[
          styles.stepCircle,
          step.completed && styles.stepCircleCompleted,
          step.active && styles.stepCircleActive,
        ]}>
          {step.completed && !step.active && (
            <MaterialCommunityIcons name="check" size={16} color="#FFFFFF" />
          )}
          {step.active && (
            <View style={styles.activeIndicator} />
          )}
        </View>
        {!isLast && (
          <View style={[
            styles.stepLine,
            step.completed && styles.stepLineCompleted,
          ]} />
        )}
      </View>
      <View style={styles.stepContent}>
        <Text style={[
          styles.stepTitle,
          step.active && styles.stepTitleActive,
        ]}>
          {step.title}
        </Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
        {step.date && (
          <Text style={styles.stepDateTime}>
            {step.date} {step.time && `- ${step.time}`}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Takip numaranızı girin"
          placeholderTextColor="#94A3B8"
          value={searchNumber}
          onChangeText={setSearchNumber}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="magnify" size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {trackingData ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.trackingCard}>
            <View style={styles.trackingHeader}>
              <View>
                <Text style={styles.trackingLabel}>Takip Numarası</Text>
                <Text style={styles.trackingNumber}>{trackingData.trackingNumber}</Text>
              </View>
              <View style={styles.carrierBadge}>
                <MaterialCommunityIcons name="truck" size={16} color="#1E3A8A" />
                <Text style={styles.carrierText}>{trackingData.carrier}</Text>
              </View>
            </View>

            <View style={styles.deliveryInfo}>
              <MaterialCommunityIcons name="calendar-clock" size={20} color="#3B82F6" />
              <Text style={styles.deliveryText}>
                Tahmini Teslimat: {trackingData.estimatedDelivery}
              </Text>
            </View>
          </View>

          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>Kargo Durumu</Text>
            {trackingData.steps.map((step, index) => 
              renderTrackingStep(step, index, index === trackingData.steps.length - 1)
            )}
          </View>

          <TouchableOpacity style={styles.contactButton}>
            <MaterialCommunityIcons name="phone" size={20} color="#1E3A8A" />
            <Text style={styles.contactButtonText}>Kargo Şirketi ile İletişime Geç</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="truck-outline" size={64} color="#94A3B8" />
          <Text style={styles.emptyText}>
            Kargo takibi yapmak için takip numaranızı girin
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  searchButton: {
    backgroundColor: '#1E3A8A',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackingCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trackingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  trackingLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  trackingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  carrierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  carrierText: {
    fontSize: 12,
    color: '#1E3A8A',
    fontWeight: '600',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  stepsContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 20,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepIndicator: {
    width: 40,
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: '#059669',
  },
  stepCircleActive: {
    backgroundColor: '#3B82F6',
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
  },
  stepLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#059669',
  },
  stepContent: {
    flex: 1,
    marginLeft: 12,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  stepTitleActive: {
    color: '#3B82F6',
  },
  stepDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  stepDateTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E3A8A',
    gap: 8,
  },
  contactButtonText: {
    color: '#1E3A8A',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 16,
    textAlign: 'center',
  },
});