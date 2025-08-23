import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { ProductController } from '../controllers/ProductController';
import { CartController } from '../controllers/CartController';
import { UserController } from '../controllers/UserController';
import { Product } from '../utils/types';
import { LoadingIndicator } from '../components/LoadingIndicator';

interface ProductDetailScreenProps {
  navigation: any;
  route: any;
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const { productId } = route.params;

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const prod = await ProductController.getProductById(productId);
      setProduct(prod);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    const currentUser = await UserController.getCurrentUser();
    
    if (!currentUser) {
      Alert.alert(
        'Giriş Yapın',
        'Sepete ürün eklemek için giriş yapmanız gerekiyor.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'Giriş Yap', onPress: () => navigation.navigate('Profile') }
        ]
      );
      return;
    }

    if (!product) return;

    setAddingToCart(true);
    try {
      const result = await CartController.addToCart(
        currentUser.id,
        product.id,
        quantity
      );

      if (result.success) {
        Alert.alert('Başarılı', result.message, [
          { text: 'Tamam' },
          { 
            text: 'Sepete Git', 
            onPress: () => navigation.navigate('Cart') 
          }
        ]);
        setQuantity(1);
      } else {
        Alert.alert('Hata', result.message);
      }
    } catch (error) {
      Alert.alert('Hata', 'Ürün sepete eklenirken bir hata oluştu');
    } finally {
      setAddingToCart(false);
    }
  };

  const increaseQuantity = () => {
    if (product && quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return <LoadingIndicator />;
  }

  if (!product) {
    return (
      <View style={styles.container}>
        <Text>Ürün bulunamadı</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.name}>{product.name}</Text>

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={styles.rating}>{product.rating}</Text>
            <Text style={styles.reviewCount}>
              ({product.reviewCount} değerlendirme)
            </Text>
          </View>

          <Text style={styles.price}>
            {ProductController.formatPrice(product.price)}
          </Text>

          <View style={styles.stockContainer}>
            {product.stock > 0 ? (
              <>
                <Text style={styles.stockText}>Stok: {product.stock} adet</Text>
                {product.stock < 5 && (
                  <Text style={styles.lowStock}>Son {product.stock} adet!</Text>
                )}
              </>
            ) : (
              <Text style={styles.outOfStock}>Tükendi</Text>
            )}
          </View>

          <View style={styles.descriptionContainer}>
            <Text style={styles.sectionTitle}>Ürün Açıklaması</Text>
            <Text style={styles.description}>{product.description}</Text>
          </View>

          {product.stock > 0 && (
            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Adet:</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={decreaseQuantity}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantity}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={increaseQuantity}
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {product.stock > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.addToCartButton, addingToCart && styles.disabledButton]}
            onPress={handleAddToCart}
            disabled={addingToCart}
          >
            <Text style={styles.addToCartText}>
              {addingToCart ? 'Ekleniyor...' : 'Sepete Ekle'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 400,
  },
  content: {
    padding: 20,
  },
  brand: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingStar: {
    fontSize: 16,
    marginRight: 4,
  },
  rating: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 16,
  },
  stockContainer: {
    marginBottom: 24,
  },
  stockText: {
    fontSize: 16,
    color: '#333',
  },
  lowStock: {
    fontSize: 14,
    color: '#FF9800',
    marginTop: 4,
    fontWeight: '600',
  },
  outOfStock: {
    fontSize: 16,
    color: '#F44336',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  quantityLabel: {
    fontSize: 16,
    color: '#333',
    marginRight: 16,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: '#2E7D32',
  },
  quantity: {
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  addToCartButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  addToCartText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});