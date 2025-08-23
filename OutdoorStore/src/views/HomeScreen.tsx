import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Image,
  Dimensions,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { theme } from '../utils/theme';
import { categories, products, Category, Product } from '../data/mockData';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

// Slider data
const sliderData = [
  {
    id: '1',
    title: 'Kış Sezonu İndirimleri',
    subtitle: 'Tüm kış sporları ekipmanlarında %30 indirim',
    image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800',
    color: ['#4A90E2', '#357ABD'],
  },
  {
    id: '2',
    title: 'Yeni Sezon Ürünleri',
    subtitle: 'En yeni outdoor ekipmanları mağazamızda',
    image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
    color: ['#E74C3C', '#C0392B'],
  },
  {
    id: '3',
    title: 'Ücretsiz Kargo',
    subtitle: '500 TL ve üzeri alışverişlerde kargo bedava',
    image: 'https://images.unsplash.com/photo-1476611338391-6f395a0ebc7b?w=800',
    color: ['#27AE60', '#229954'],
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const popularProducts = products.filter(p => p.rating >= 4.5).slice(0, 6);
  const newProducts = products.filter(p => p.isNew).slice(0, 6);
  const saleProducts = products.filter(p => p.isSale).slice(0, 6);

  // Auto scroll for slider
  useEffect(() => {
    const timer = setInterval(() => {
      if (currentSlide < sliderData.length - 1) {
        scrollRef.current?.scrollTo({
          x: (currentSlide + 1) * width,
          animated: true,
        });
        setCurrentSlide(currentSlide + 1);
      } else {
        scrollRef.current?.scrollTo({ x: 0, animated: true });
        setCurrentSlide(0);
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [currentSlide]);

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { product });
  };

  const handleCategoryPress = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      navigation.navigate('ProductList', { 
        category: category.name,
        categoryId: categoryId 
      });
    }
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('ProductList', { 
        searchQuery: searchQuery.trim() 
      });
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[styles.categoryCard, { backgroundColor: item.color + '20' }]}
      onPress={() => handleCategoryPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={[styles.categoryIcon, { backgroundColor: item.color }]}>
        <MaterialCommunityIcons name={item.icon as any} size={24} color="white" />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <Animatable.View animation="fadeInUp" duration={600}>
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => handleProductPress(item)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: item.image }} style={styles.productImage} />
        {item.isSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>İNDİRİM</Text>
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
            <Text style={styles.reviews}>({item.reviews})</Text>
          </View>
          <View style={styles.priceContainer}>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>₺{item.originalPrice}</Text>
            )}
            <Text style={styles.price}>₺{item.price}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );

  const SectionHeader = ({ title, onPress }: { title: string; onPress?: () => void }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onPress && (
        <TouchableOpacity onPress={onPress}>
          <Text style={styles.seeAll}>Tümünü Gör</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.headerBackground]}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3369/3369030.png' }} 
                style={styles.logo}
              />
              <Text style={styles.logoText}>Outdoor Store</Text>
            </View>
            <TouchableOpacity 
              style={styles.cartButton}
              onPress={() => navigation.navigate('Cart')}
            >
              <Ionicons name="cart-outline" size={28} color="white" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Ürün, marka veya kategori ara..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
          </View>
        </LinearGradient>

        {/* Image Slider */}
        <View style={styles.sliderContainer}>
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentSlide(slideIndex);
            }}
          >
            {sliderData.map((slide) => (
              <LinearGradient
                key={slide.id}
                colors={slide.color}
                style={styles.slide}
              >
                <Image source={{ uri: slide.image }} style={styles.slideImage} />
                <View style={styles.slideContent}>
                  <Text style={styles.slideTitle}>{slide.title}</Text>
                  <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
                </View>
              </LinearGradient>
            ))}
          </ScrollView>
          <View style={styles.pagination}>
            {sliderData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  currentSlide === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Quick Action Buttons */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsContainer}
        >
          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: '#FF5722' }]}>
            <MaterialCommunityIcons name="flash" size={24} color="white" />
            <Text style={styles.quickActionText}>Flaş İndirimler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: '#E91E63' }]}>
            <MaterialCommunityIcons name="gift" size={24} color="white" />
            <Text style={styles.quickActionText}>Hediye Fırsatları</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: '#9C27B0' }]}>
            <MaterialCommunityIcons name="trending-up" size={24} color="white" />
            <Text style={styles.quickActionText}>Çok Satanlar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: '#4CAF50' }]}>
            <MaterialCommunityIcons name="shield-check" size={24} color="white" />
            <Text style={styles.quickActionText}>Güvenli Alışveriş</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Kategoriler */}
        <View style={styles.section}>
          <SectionHeader title="Kategoriler" />
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Öne Çıkan Ürünler */}
        <View style={styles.section}>
          <SectionHeader 
            title="Öne Çıkan Ürünler" 
            onPress={() => navigation.navigate('ProductList', { featured: true })}
          />
          <FlatList
            data={popularProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

        {/* İndirimli Ürünler */}
        <View style={styles.section}>
          <SectionHeader 
            title="İndirimli Ürünler" 
            onPress={() => navigation.navigate('ProductList', { sale: true })}
          />
          <FlatList
            data={saleProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

        {/* Yeni Ürünler */}
        <View style={styles.section}>
          <SectionHeader 
            title="Yeni Ürünler" 
            onPress={() => navigation.navigate('ProductList', { new: true })}
          />
          <FlatList
            data={newProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: theme.spacing.sm,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
  },
  sliderContainer: {
    height: 200,
    marginTop: theme.spacing.md,
  },
  slide: {
    width: width,
    height: 200,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    position: 'absolute',
    opacity: 0.6,
  },
  slideContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  slideSubtitle: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: 'white',
    width: 20,
  },
  quickActionsContainer: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    marginRight: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  quickActionText: {
    color: 'white',
    marginLeft: theme.spacing.xs,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    marginTop: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  categoryList: {
    paddingHorizontal: theme.spacing.md,
  },
  categoryCard: {
    width: 80,
    alignItems: 'center',
    marginRight: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
  productList: {
    paddingHorizontal: theme.spacing.md,
  },
  productCard: {
    width: width * 0.45,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
    ...theme.shadows.md,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 180,
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
});