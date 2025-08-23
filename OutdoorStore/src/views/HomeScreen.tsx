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
            <View>
              <Text style={styles.welcomeText}>Hoş Geldiniz!</Text>
              <Text style={styles.headerTitle}>Outdoor Maceranız Başlasın</Text>
            </View>
            <TouchableOpacity style={styles.cartButton}>
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

        {/* Banner */}
        <Animatable.View animation="fadeIn" delay={300} style={styles.bannerContainer}>
          <LinearGradient
            colors={[theme.colors.secondary, theme.colors.accent]}
            style={styles.banner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>Kış Sezonu Başladı!</Text>
              <Text style={styles.bannerSubtitle}>Kış sporları ekipmanlarında %25 indirim</Text>
              <TouchableOpacity 
                style={styles.bannerButton}
                onPress={() => handleCategoryPress('6')}
              >
                <Text style={styles.bannerButtonText}>Alışverişe Başla</Text>
              </TouchableOpacity>
            </View>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400' }}
              style={styles.bannerImage}
            />
          </LinearGradient>
        </Animatable.View>
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
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
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
  bannerContainer: {
    margin: theme.spacing.md,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.xxl,
  },
  banner: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.lg,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: theme.spacing.md,
  },
  bannerButton: {
    backgroundColor: 'white',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: theme.colors.secondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  bannerImage: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.md,
    marginLeft: theme.spacing.md,
  },
});