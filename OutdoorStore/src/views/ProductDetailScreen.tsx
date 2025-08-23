import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { theme } from '../utils/theme';
import { Product } from '../data/mockData';

const { width, height } = Dimensions.get('window');

interface ProductDetailScreenProps {
  navigation: any;
  route: any;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { product }: { product: Product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Örnek resimler (gerçek uygulamada API'den gelecek)
  const productImages = [
    product.image,
    product.image,
    product.image,
  ];

  const handleAddToCart = () => {
    // Sepete ekleme işlemi
    Alert.alert(
      'Başarılı',
      `${quantity} adet ${product.name} sepete eklendi!`,
      [
        { text: 'Alışverişe Devam Et', style: 'cancel' },
        { 
          text: 'Sepete Git', 
          onPress: () => navigation.navigate('Cart')
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${product.name} - ₺${product.price}\n\nBu harika ürünü keşfet!`,
        title: product.name,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const renderFeature = (feature: string, index: number) => (
    <Animatable.View
      key={index}
      animation="fadeInUp"
      delay={index * 100}
      style={styles.featureItem}
    >
      <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
      <Text style={styles.featureText}>{feature}</Text>
    </Animatable.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event) => {
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {productImages.map((image, index) => (
              <Image
                key={index}
                source={{ uri: image }}
                style={styles.productImage}
              />
            ))}
          </ScrollView>
          
          {/* Image Indicators */}
          <View style={styles.imageIndicators}>
            {productImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.indicator,
                  index === selectedImageIndex && styles.indicatorActive
                ]}
              />
            ))}
          </View>

          {/* Badges */}
          {product.isSale && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>
                %{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)} İNDİRİM
              </Text>
            </View>
          )}
          {product.isNew && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>YENİ</Text>
            </View>
          )}

          {/* Header Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.headerRightActions}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleShare}
              >
                <Ionicons name="share-social" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => setIsFavorite(!isFavorite)}
              >
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFavorite ? theme.colors.error : "white"} 
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Product Info */}
        <Animatable.View animation="fadeInUp" style={styles.productInfo}>
          {/* Brand and Category */}
          <View style={styles.productMeta}>
            <Text style={styles.brand}>{product.brand}</Text>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{product.category}</Text>
            </View>
          </View>

          {/* Name */}
          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name={star <= Math.floor(product.rating) ? "star" : "star-outline"}
                  size={18}
                  color="#FFC107"
                />
              ))}
            </View>
            <Text style={styles.ratingText}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({product.reviews} değerlendirme)</Text>
          </View>

          {/* Price */}
          <View style={styles.priceContainer}>
            {product.originalPrice && (
              <Text style={styles.originalPrice}>₺{product.originalPrice}</Text>
            )}
            <Text style={styles.price}>₺{product.price}</Text>
          </View>

          {/* Stock Status */}
          <View style={styles.stockContainer}>
            <Ionicons 
              name={product.inStock ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color={product.inStock ? theme.colors.success : theme.colors.error} 
            />
            <Text style={[
              styles.stockText,
              { color: product.inStock ? theme.colors.success : theme.colors.error }
            ]}>
              {product.inStock ? 'Stokta var' : 'Stokta yok'}
            </Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ürün Açıklaması</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Özellikler</Text>
            <View style={styles.featuresList}>
              {product.features.map((feature, index) => renderFeature(feature, index))}
            </View>
          </View>

          {/* Shipping Info */}
          <View style={styles.shippingInfo}>
            <View style={styles.shippingItem}>
              <MaterialCommunityIcons name="truck-delivery" size={24} color={theme.colors.primary} />
              <View style={styles.shippingTextContainer}>
                <Text style={styles.shippingTitle}>Ücretsiz Kargo</Text>
                <Text style={styles.shippingSubtitle}>₺500 ve üzeri alışverişlerde</Text>
              </View>
            </View>
            <View style={styles.shippingItem}>
              <MaterialCommunityIcons name="shield-check" size={24} color={theme.colors.primary} />
              <View style={styles.shippingTextContainer}>
                <Text style={styles.shippingTitle}>Güvenli Alışveriş</Text>
                <Text style={styles.shippingSubtitle}>256-bit SSL sertifikası</Text>
              </View>
            </View>
            <View style={styles.shippingItem}>
              <MaterialCommunityIcons name="refresh" size={24} color={theme.colors.primary} />
              <View style={styles.shippingTextContainer}>
                <Text style={styles.shippingTitle}>14 Gün İade</Text>
                <Text style={styles.shippingSubtitle}>Koşulsuz iade garantisi</Text>
              </View>
            </View>
          </View>
        </Animatable.View>
      </ScrollView>

      {/* Bottom Action Bar */}
      {product.inStock && (
        <Animatable.View animation="slideInUp" style={styles.bottomBar}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={decrementQuantity}
            >
              <Ionicons name="remove" size={20} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton}
              onPress={incrementQuantity}
            >
              <Ionicons name="add" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.headerBackground]}
              style={styles.gradientButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="cart" size={20} color="white" />
              <Text style={styles.addToCartText}>Sepete Ekle</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  imageContainer: {
    height: height * 0.5,
    backgroundColor: 'white',
  },
  productImage: {
    width: width,
    height: '100%',
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: theme.spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: 'white',
    width: 24,
  },
  saleBadge: {
    position: 'absolute',
    top: theme.spacing.xl,
    left: theme.spacing.md,
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
  },
  saleBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: theme.spacing.xl,
    right: theme.spacing.md,
    backgroundColor: theme.colors.success,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
  },
  newBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  headerActions: {
    position: 'absolute',
    top: theme.spacing.xl,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRightActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  productInfo: {
    backgroundColor: 'white',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    marginTop: -theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 100,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  brand: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  categoryChip: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.round,
  },
  categoryText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  stars: {
    flexDirection: 'row',
    marginRight: theme.spacing.sm,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  reviewCount: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  originalPrice: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    textDecorationLine: 'line-through',
    marginRight: theme.spacing.md,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  stockText: {
    marginLeft: theme.spacing.xs,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: theme.colors.textSecondary,
  },
  featuresList: {
    gap: theme.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.text,
  },
  shippingInfo: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  shippingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  shippingTextContainer: {
    marginLeft: theme.spacing.md,
  },
  shippingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  shippingSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.lg,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.xs,
  },
  quantityButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginHorizontal: theme.spacing.md,
  },
  addToCartButton: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  gradientButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: theme.spacing.sm,
  },
});