import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

interface EmptyStateProps {
  message: string;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, icon = 'alert-circle-outline' }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon as any} size={64} color={theme.colors.textLight} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
  },
  message: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 24,
  },
});