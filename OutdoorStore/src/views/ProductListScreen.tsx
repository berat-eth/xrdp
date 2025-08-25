import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { ProductController } from '../controllers/ProductController';
import { Product } from '../utils/types';
import { ProductCard } from '../components/ProductCard';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';

interface ProductListScreenProps {
  navigation: any;
  route: any;
}

export const ProductListScreen: React.FC<ProductListScreenProps> = ({
  navigation,
  route,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [title, setTitle] = useState('Tüm Ürünler');

  const { category, searchQuery: initialSearchQuery } = route.params || {};

  useEffect(() => {
    loadProducts();
  }, [category, initialSearchQuery]);

  useEffect(() => {
    navigation.setOptions({ title });
  }, [title, navigation]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let results: Product[] = [];

      if (category) {
        results = await ProductController.getProductsByCategory(category);
        setTitle(category);
      } else if (initialSearchQuery) {
        results = await ProductController.searchProducts(initialSearchQuery);
        setTitle(`"${initialSearchQuery}" için sonuçlar`);
        setSearchQuery(initialSearchQuery);
      } else {
        results = await ProductController.getAllProducts();
        setTitle('Tüm Ürünler');
      }

      setProducts(results);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      setLoading(true);
      try {
        const results = await ProductController.searchProducts(searchQuery);
        setProducts(results);
        setTitle(`"${searchQuery}" için sonuçlar`);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setLoading(false);
      }
    } else {
      loadProducts();
    }
  };

  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <View style={styles.productContainer}>
      <ProductCard product={item} onPress={handleProductPress} />
    </View>
  );

  if (loading) {
    return <LoadingIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.productCount}>{products.length} ürün</Text>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSubmit={handleSearch}
      />

      {products.length === 0 ? (
        <EmptyState
          message="Aradığınız kriterlere uygun ürün bulunamadı"
          icon="🔍"
        />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productCount: {
    fontSize: 14,
    color: '#666',
  },
  listContent: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  productContainer: {
    flex: 0.5,
    marginHorizontal: 4,
  },
});