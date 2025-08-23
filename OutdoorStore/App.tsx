import React, { useEffect } from 'react';
import { AppNavigator } from './src/navigation/AppNavigator';
import { initDatabase } from './src/utils/database';

export default function App() {
  useEffect(() => {
    // Veritabanını başlat
    initDatabase();
  }, []);

  return <AppNavigator />;
}
