import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../utils/theme';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  icon: string;
}

export const WalletScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [balance, setBalance] = useState(2458.50);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'income',
      amount: 500,
      description: 'Para Yükleme',
      date: '15 Ocak 2024',
      icon: 'wallet',
    },
    {
      id: '2',
      type: 'expense',
      amount: 189.90,
      description: 'Sipariş Ödemesi #12345',
      date: '14 Ocak 2024',
      icon: 'cart',
    },
    {
      id: '3',
      type: 'income',
      amount: 50,
      description: 'İade - Sipariş #12340',
      date: '12 Ocak 2024',
      icon: 'refresh',
    },
    {
      id: '4',
      type: 'expense',
      amount: 329.99,
      description: 'Sipariş Ödemesi #12339',
      date: '10 Ocak 2024',
      icon: 'cart',
    },
  ]);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const renderTransaction = (transaction: Transaction) => {
    const isIncome = transaction.type === 'income';
    return (
      <View key={transaction.id} style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={[styles.iconContainer, isIncome ? styles.incomeIcon : styles.expenseIcon]}>
            <MaterialCommunityIcons 
              name={transaction.icon as any} 
              size={24} 
              color="#FFFFFF" 
            />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionDescription}>{transaction.description}</Text>
            <Text style={styles.transactionDate}>{transaction.date}</Text>
          </View>
        </View>
        <Text style={[
          styles.transactionAmount,
          isIncome ? styles.incomeAmount : styles.expenseAmount
        ]}>
          {isIncome ? '+' : '-'} ₺{transaction.amount.toFixed(2)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1E3A8A', '#2563EB']}
        style={styles.balanceCard}
      >
        <Text style={styles.balanceLabel}>Mevcut Bakiye</Text>
        <Text style={styles.balanceAmount}>₺{balance.toFixed(2)}</Text>
        
        <View style={styles.balanceActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Para Yükle</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="send-outline" size={24} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Transfer Et</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Bu Ay Gelir</Text>
          <Text style={[styles.statAmount, styles.incomeAmount]}>+₺550.00</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Bu Ay Gider</Text>
          <Text style={[styles.statAmount, styles.expenseAmount]}>-₺519.89</Text>
        </View>
      </View>

      <View style={styles.transactionsHeader}>
        <Text style={styles.transactionsTitle}>İşlem Geçmişi</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>Tümünü Gör</Text>
        </TouchableOpacity>
      </View>

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
        {transactions.map(renderTransaction)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  balanceCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  incomeAmount: {
    color: '#059669',
  },
  expenseAmount: {
    color: '#DC2626',
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  transactionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E3A8A',
  },
  viewAllText: {
    color: '#3B82F6',
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  incomeIcon: {
    backgroundColor: '#059669',
  },
  expenseIcon: {
    backgroundColor: '#DC2626',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});