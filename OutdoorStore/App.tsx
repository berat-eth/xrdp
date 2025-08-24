import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/utils/database';

// TurboModule uyarılarını gizle
LogBox.ignoreLogs([
  'Module TurboModuleRegistry',
  'TurboModuleRegistry.getEnforcing(...)',
  '[runtime not ready]',
]);

export default function App() {
  useEffect(() => {
    // Veritabanını başlat
    initDatabase();
  }, []);

  return <AppNavigator />;
}
