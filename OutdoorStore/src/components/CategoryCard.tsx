import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { theme } from '../utils/theme';
import { Category } from '../data/mockData';

const { width } = Dimensions.get('window');

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  index: number;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ 
  category, 
  onPress, 
  index 
}) => {
  return (
    <Animatable.View
      animation="fadeInUp"
      duration={600}
      delay={index * 100}
    >
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[category.color, category.color + 'CC']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={category.icon as any} 
              size={32} 
              color="white" 
            />
          </View>
          <Text style={styles.name}>{category.name}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {category.description}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: (width - theme.spacing.md * 3) / 2,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  gradient: {
    padding: theme.spacing.md,
    height: 120,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.round,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginTop: theme.spacing.sm,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
  },
});