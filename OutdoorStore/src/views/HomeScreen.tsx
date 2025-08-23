import React, { useEffect, useState } from 'react';
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

interface CTAButtonProps {
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  onPress: () => void;
}

const CTAButton: React.FC<CTAButtonProps> = ({ icon, title, subtitle, color, onPress }) => {
  return (
    <TouchableOpacity style={styles.ctaButton} onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={[color, color + 'DD']}
        style={styles.ctaGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Ionicons name={icon as any} size={32} color={theme.colors.secondary} />
        <View style={styles.ctaTextContainer}>
          <Text style={styles.ctaTitle}>{title}</Text>
          <Text style={styles.ctaSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="arrow-forward" size={20} color={theme.colors.secondary} />
      </LinearGradient>
    </TouchableOpacity>
  );
};

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const popularProducts = products.filter(p => p.rating >= 4.5).slice(0, 6);
  const newProducts = products.filter(p => p.isNew).slice(0, 6);
  const saleProducts = products.filter(p => p.isSale).slice(0, 6);

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
      navigation.navigate('ProductList', { searchQuery });
    }
  };

  const renderCategory = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.categoryIconContainer}>
        <MaterialCommunityIcons 
          name={item.icon as any} 
          size={32} 
          color={theme.colors.primary} 
        />
      </View>
      <Text style={styles.categoryName}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(item)}
      activeOpacity={0.8}
    >
      <Animatable.View animation="fadeIn" duration={600}>
        {item.isSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>İndirim</Text>
          </View>
        )}
        {item.isNew && (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>Yeni</Text>
          </View>
        )}
        <Image source={{ uri: item.image }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFA500" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <View style={styles.priceContainer}>
            {item.oldPrice && (
              <Text style={styles.oldPrice}>₺{item.oldPrice}</Text>
            )}
            <Text style={styles.price}>₺{item.price}</Text>
          </View>
        </View>
      </Animatable.View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={[theme.colors.primary, theme.colors.primaryDark]}
          style={styles.heroSection}
        >
          <Animatable.View animation="fadeIn" duration={1000} style={styles.heroContent}>
            <Text style={styles.heroTitle}>Hoş Geldiniz</Text>
            <Text style={styles.heroSubtitle}>Huğlu Outdoor'da doğa tutkunları için en iyi ürünler</Text>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={theme.colors.textLight} />
              <TextInput
                style={styles.searchInput}
                placeholder="Ürün ara..."
                placeholderTextColor={theme.colors.textLight}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity onPress={handleSearch}>
                <View style={styles.searchButton}>
                  <Ionicons name="arrow-forward" size={20} color={theme.colors.secondary} />
                </View>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </LinearGradient>

        {/* CTA Buttons */}
        <View style={styles.ctaSection}>
          <CTAButton
            icon="flash-outline"
            title="Flaş İndirimler"
            subtitle="50%'ye varan indirimler"
            color={theme.colors.error}
            onPress={() => navigation.navigate('ProductList', { filter: 'sale' })}
          />
          <CTAButton
            icon="gift-outline"
            title="Hediye Fırsatları"
            subtitle="Özel kampanyalar"
            color={theme.colors.success}
            onPress={() => navigation.navigate('ProductList', { filter: 'gift' })}
          />
          <CTAButton
            icon="medal-outline"
            title="En Çok Satanlar"
            subtitle="Popüler ürünler"
            color={theme.colors.warning}
            onPress={() => navigation.navigate('ProductList', { filter: 'popular' })}
          />
          <CTAButton
            icon="shield-checkmark-outline"
            title="Güvenli Alışveriş"
            subtitle="100% güvence"
            color={theme.colors.accent}
            onPress={() => {/* Navigate to security info */}}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('Cart')}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="cart-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Sepetim</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem} onPress={() => navigation.navigate('Profile')}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="person-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Hesabım</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem} onPress={() => {/* Navigate to favorites */}}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="heart-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Favoriler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionItem} onPress={() => {/* Navigate to support */}}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="chatbubbles-outline" size={24} color={theme.colors.primary} />
            </View>
            <Text style={styles.quickActionText}>Destek</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Kategoriler</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Products')}>
              <Text style={styles.seeAllButton}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Banner */}
        <TouchableOpacity style={styles.banner} activeOpacity={0.9}>
          <LinearGradient
            colors={[theme.colors.primaryLight, theme.colors.primary]}
            style={styles.bannerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Kış Koleksiyonu</Text>
              <Text style={styles.bannerSubtitle}>Yeni sezon ürünlerini keşfedin</Text>
              <View style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>Alışverişe Başla</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.colors.secondary} />
              </View>
            </View>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1551632811-561732d1e306' }} 
              style={styles.bannerImage}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Popular Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popüler Ürünler</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductList', { filter: 'popular' })}>
              <Text style={styles.seeAllButton}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={popularProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

        {/* New Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Yeni Ürünler</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductList', { filter: 'new' })}>
              <Text style={styles.seeAllButton}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={newProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

        {/* Sale Products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>İndirimli Ürünler</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ProductList', { filter: 'sale' })}>
              <Text style={styles.seeAllButton}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={saleProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.productList}
          />
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="cube-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.featureTitle}>Ücretsiz Kargo</Text>
            <Text style={styles.featureText}>500₺ üzeri alışverişlerde</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="shield-checkmark-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.featureTitle}>Güvenli Ödeme</Text>
            <Text style={styles.featureText}>256-bit SSL güvenlik</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="refresh-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.featureTitle}>Kolay İade</Text>
            <Text style={styles.featureText}>14 gün içinde iade</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="headset-outline" size={32} color={theme.colors.primary} />
            <Text style={styles.featureTitle}>7/24 Destek</Text>
            <Text style={styles.featureText}>Her zaman yanınızdayız</Text>
          </View>
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
  heroSection: {
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    paddingHorizontal: theme.spacing.lg,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  heroSubtitle: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.secondary,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing.md,
    width: '100%',
    ...theme.shadows.md,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.text,
  },
  searchButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaSection: {
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  ctaButton: {
    marginBottom: theme.spacing.sm,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.md,
  },
  ctaTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  ctaTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: '600',
    color: theme.colors.secondary,
  },
  ctaSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.secondary,
    opacity: 0.8,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  quickActionItem: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  quickActionText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  seeAllButton: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  categoryList: {
    paddingHorizontal: theme.spacing.lg,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  categoryIconContainer: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  categoryName: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.text,
    textAlign: 'center',
  },
  banner: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  bannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  bannerSubtitle: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.secondary,
    opacity: 0.9,
    marginBottom: theme.spacing.md,
  },
  bannerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
    color: theme.colors.primary,
    marginRight: theme.spacing.xs,
  },
  bannerImage: {
    width: 120,
    height: 120,
    borderRadius: theme.borderRadius.md,
  },
  productList: {
    paddingHorizontal: theme.spacing.lg,
  },
  productCard: {
    width: 160,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  productImage: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: theme.spacing.sm,
  },
  productName: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  ratingText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  oldPrice: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textLight,
    textDecorationLine: 'line-through',
    marginRight: theme.spacing.xs,
  },
  price: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  saleBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    zIndex: 1,
  },
  saleBadgeText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  newBadge: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    zIndex: 1,
  },
  newBadgeText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.secondary,
    fontWeight: '600',
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginTop: theme.spacing.xl,
  },
  featureItem: {
    width: '48%',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  featureTitle: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  featureText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});