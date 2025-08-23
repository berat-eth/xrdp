import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface EmptyStateProps {
  message: string;
  icon?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, icon }) => {
  return (
    <View style={styles.container}>
      {icon && (
        <Text style={styles.icon}>{icon}</Text>
      )}
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});