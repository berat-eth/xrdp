import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { theme } from '../utils/theme';
import { products, Product } from '../data/mockData';

const { width } = Dimensions.get('window');

interface ProductListScreenProps {
  navigation: any;
  route: any;
}

type SortOption = 'price-asc' | 'price-desc' | 'rating' | 'name';

export const ProductListScreen: React.FC<ProductListScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { category, categoryId, searchQuery, featured, sale, new: isNew } = route.params || {};
  
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery || '');

  // Ürünleri filtrele
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Kategori filtresi
    if (categoryId) {
      result = result.filter(p => p.categoryId === categoryId);
    }

    // Özel filtreler
    if (featured) {
      result = result.filter(p => p.rating >= 4.5);
    }
    if (sale) {
      result = result.filter(p => p.isSale);
    }
    if (isNew) {
      result = result.filter(p => p.isNew);
    }

    // Arama filtresi
    if (localSearchQuery) {
      const query = localSearchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }

    // Fiyat aralığı filtresi
    result = result.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

    // Marka filtresi
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Stok filtresi
    if (showInStockOnly) {
      result = result.filter(p => p.inStock);
    }

    // Sıralama
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [categoryId, featured, sale, isNew, localSearchQuery, priceRange, selectedBrands, showInStockOnly, sortBy]);

  // Benzersiz markalar
  const allBrands = useMemo(() => {
    const brands = new Set(products.map(p => p.brand));
    return Array.from(brands).sort();
  }, []);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const resetFilters = () => {
    setPriceRange({ min: 0, max: 50000 });
    setSelectedBrands([]);
    setShowInStockOnly(false);
  };

  const renderProduct = ({ item, index }: { item: Product; index: number }) => (
    <Animatable.View 
      animation="fadeInUp" 
      duration={600} 
      delay={index * 100}
      style={styles.productContainer}
    >
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.isSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>
              %{Math.round(((item.originalPrice! - item.price) / item.originalPrice!) * 100)} İNDİRİM
            </Text>
          </View>
        )}
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>YENİ</Text>
          </View>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productBrand}>{item.brand}</Text>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFC107" />
            <Text style={styles.rating}>{item.rating}</Text>
            <Text style={styles.reviews}>({item.reviews} yorum)</Text>
          </View>
          <View style={styles.priceContainer}>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>₺{item.originalPrice}</Text>
            )}
            <Text style={styles.price}>₺{item.price}</Text>
          </View>
          {!item.inStock && (
            <View style={styles.outOfStock}>
              <Text style={styles.outOfStockText}>Stokta Yok</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  const FilterModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={filterModalVisible}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrele</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Fiyat Aralığı */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Fiyat Aralığı</Text>
              <View style={styles.priceInputContainer}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  keyboardType="numeric"
                  value={priceRange.min.toString()}
                  onChangeText={(text) => setPriceRange(prev => ({ ...prev, min: parseInt(text) || 0 }))}
                />
                <Text style={styles.priceSeparator}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  keyboardType="numeric"
                  value={priceRange.max.toString()}
                  onChangeText={(text) => setPriceRange(prev => ({ ...prev, max: parseInt(text) || 50000 }))}
                />
              </View>
            </View>

            {/* Markalar */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Markalar</Text>
              <View style={styles.brandContainer}>
                {allBrands.map(brand => (
                  <TouchableOpacity
                    key={brand}
                    style={[
                      styles.brandChip,
                      selectedBrands.includes(brand) && styles.brandChipSelected
                    ]}
                    onPress={() => toggleBrand(brand)}
                  >
                    <Text style={[
                      styles.brandChipText,
                      selectedBrands.includes(brand) && styles.brandChipTextSelected
                    ]}>
                      {brand}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Stok Durumu */}
            <View style={styles.filterSection}>
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => setShowInStockOnly(!showInStockOnly)}
              >
                <View style={[styles.checkbox, showInStockOnly && styles.checkboxChecked]}>
                  {showInStockOnly && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
                <Text style={styles.checkboxLabel}>Sadece stokta olanları göster</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
              <Text style={styles.resetButtonText}>Sıfırla</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.applyButton} 
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.applyButtonText}>Uygula</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const getTitle = () => {
    if (category) return category;
    if (featured) return 'Öne Çıkan Ürünler';
    if (sale) return 'İndirimli Ürünler';
    if (isNew) return 'Yeni Ürünler';
    if (localSearchQuery) return `"${localSearchQuery}" için sonuçlar`;
    return 'Tüm Ürünler';
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.headerBackground]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{getTitle()}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cart')}>
            <Ionicons name="cart-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Ürün ara..."
            placeholderTextColor={theme.colors.textSecondary}
            value={localSearchQuery}
            onChangeText={setLocalSearchQuery}
          />
        </View>
      </LinearGradient>

      {/* Filtre ve Sıralama */}
      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setFilterModalVisible(true)}
        >
          <Ionicons name="filter" size={20} color={theme.colors.primary} />
          <Text style={styles.filterButtonText}>Filtrele</Text>
        </TouchableOpacity>

        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sırala:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'rating' && styles.sortChipActive]}
              onPress={() => setSortBy('rating')}
            >
              <Text style={[styles.sortChipText, sortBy === 'rating' && styles.sortChipTextActive]}>
                Popüler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'price-asc' && styles.sortChipActive]}
              onPress={() => setSortBy('price-asc')}
            >
              <Text style={[styles.sortChipText, sortBy === 'price-asc' && styles.sortChipTextActive]}>
                Fiyat ↑
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'price-desc' && styles.sortChipActive]}
              onPress={() => setSortBy('price-desc')}
            >
              <Text style={[styles.sortChipText, sortBy === 'price-desc' && styles.sortChipTextActive]}>
                Fiyat ↓
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sortChip, sortBy === 'name' && styles.sortChipActive]}
              onPress={() => setSortBy('name')}
            >
              <Text style={[styles.sortChipText, sortBy === 'name' && styles.sortChipTextActive]}>
                İsim
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Sonuç Sayısı */}
      <Text style={styles.resultCount}>
        {filteredProducts.length} ürün bulundu
      </Text>

      {/* Ürün Listesi */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="emoticon-sad-outline" size={64} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>Üzgünüz, aradığınız kriterlere uygun ürün bulunamadı.</Text>
          </View>
        }
      />

      <FilterModal />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary + '10',
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.md,
  },
  filterButtonText: {
    marginLeft: theme.spacing.xs,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  sortContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.sm,
  },
  sortChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.round,
    backgroundColor: '#F0F0F0',
    marginRight: theme.spacing.sm,
  },
  sortChipActive: {
    backgroundColor: theme.colors.primary,
  },
  sortChipText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  sortChipTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  resultCount: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  productList: {
    paddingHorizontal: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
  },
  productContainer: {
    width: '50%',
    padding: theme.spacing.sm,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  productImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  saleBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  saleBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: theme.spacing.md,
  },
  productBrand: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    minHeight: 40,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  rating: {
    fontSize: 12,
    color: theme.colors.text,
    marginLeft: 4,
  },
  reviews: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginLeft: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: theme.spacing.xs,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  outOfStock: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  filterSection: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontSize: 16,
  },
  priceSeparator: {
    marginHorizontal: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  brandContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  brandChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  brandChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  brandChipText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  brandChipTextSelected: {
    color: 'white',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: theme.colors.text,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  resetButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  resetButtonText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    marginLeft: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});