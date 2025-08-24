import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../utils/theme';

// Screens
import { HomeScreen } from '../views/HomeScreen';
import { ProductListScreen } from '../views/ProductListScreen';
import { ProductDetailScreen } from '../views/ProductDetailScreen';
import { CartScreen } from '../views/CartScreen';
import { ProfileScreen } from '../views/ProfileScreen';
import { OrderScreen } from '../views/OrderScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// Custom Drawer Content
const CustomDrawerContent = (props: any) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={drawerStyles.header}>
        <View style={drawerStyles.logoContainer}>
          <MaterialCommunityIcons name="hiking" size={40} color={theme.colors.primary} />
          <Text style={drawerStyles.logoText}>Huğlu Outdoor</Text>
        </View>
      </View>
      <DrawerContentScrollView {...props}>
        <DrawerItem
          label="Ana Sayfa"
          onPress={() => props.navigation.navigate('Home')}
          icon={({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          )}
          activeTintColor={theme.colors.primary}
          inactiveTintColor={theme.colors.text}
        />
        <DrawerItem
          label="Kategoriler"
          onPress={() => props.navigation.navigate('Products')}
          icon={({ color, size }) => (
            <MaterialCommunityIcons name="shape-outline" size={size} color={color} />
          )}
          activeTintColor={theme.colors.primary}
          inactiveTintColor={theme.colors.text}
        />
        <DrawerItem
          label="Yeni Ürünler"
          onPress={() => props.navigation.navigate('Products', { isNew: true })}
          icon={({ color, size }) => (
            <Ionicons name="sparkles-outline" size={size} color={color} />
          )}
          activeTintColor={theme.colors.primary}
          inactiveTintColor={theme.colors.text}
        />
        <DrawerItem
          label="İndirimli Ürünler"
          onPress={() => props.navigation.navigate('Products', { isSale: true })}
          icon={({ color, size }) => (
            <Ionicons name="pricetag-outline" size={size} color={color} />
          )}
          activeTintColor={theme.colors.primary}
          inactiveTintColor={theme.colors.text}
        />
        <DrawerItem
          label="Kampanya"
          onPress={() => props.navigation.navigate('Products', { featured: true })}
          icon={({ color, size }) => (
            <MaterialCommunityIcons name="fire" size={size} color={color} />
          )}
          activeTintColor={theme.colors.primary}
          inactiveTintColor={theme.colors.text}
        />
        <DrawerItem
          label="Favorilerim"
          onPress={() => {}}
          icon={({ color, size }) => (
            <Ionicons name="heart-outline" size={size} color={color} />
          )}
          activeTintColor={theme.colors.primary}
          inactiveTintColor={theme.colors.text}
        />
        <DrawerItem
          label="Siparişlerim"
          onPress={() => props.navigation.navigate('Cart')}
          icon={({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          )}
          activeTintColor={theme.colors.primary}
          inactiveTintColor={theme.colors.text}
        />
        <DrawerItem
          label="Yardım ve Destek"
          onPress={() => {}}
          icon={({ color, size }) => (
            <Ionicons name="help-circle-outline" size={size} color={color} />
          )}
          activeTintColor={theme.colors.primary}
          inactiveTintColor={theme.colors.text}
        />
        <DrawerItem
          label="İletişim"
          onPress={() => {}}
          icon={({ color, size }) => (
            <Ionicons name="call-outline" size={size} color={color} />
          )}
          activeTintColor={theme.colors.primary}
          inactiveTintColor={theme.colors.text}
        />
      </DrawerContentScrollView>
      <View style={drawerStyles.footer}>
        <Text style={drawerStyles.footerText}>v1.0.0</Text>
      </View>
    </SafeAreaView>
  );
};

// Stack Navigator for Home
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.colors.secondary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="menu" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen 
        name="HomeMain" 
        component={HomeScreen} 
        options={{ title: 'Huğlu Outdoor' }}
      />
      <Stack.Screen 
        name="ProductList" 
        component={ProductListScreen}
        options={{ title: 'Ürünler' }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{ title: 'Ürün Detayı' }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator for Cart
const CartStack = () => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.colors.secondary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="menu" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen 
        name="CartMain" 
        component={CartScreen} 
        options={{ title: 'Sepetim' }}
      />
      <Stack.Screen 
        name="Order" 
        component={OrderScreen}
        options={{ title: 'Sipariş' }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator for Profile
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.colors.secondary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="menu" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen} 
        options={{ title: 'Profilim' }}
      />
    </Stack.Navigator>
  );
};

// Stack Navigator for Products
const ProductsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: theme.colors.primary,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTintColor: theme.colors.secondary,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="menu" size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen 
        name="ProductsMain" 
        component={ProductListScreen} 
        options={{ title: 'Tüm Ürünler' }}
      />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{ title: 'Ürün Detayı' }}
      />
    </Stack.Navigator>
  );
};

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textLight,
        tabBarStyle: {
          backgroundColor: theme.colors.secondary,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          elevation: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 0,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Products"
        component={ProductsStack}
        options={{
          tabBarLabel: 'Ürünler',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartStack}
        options={{
          tabBarLabel: 'Sepet',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main Drawer Navigator
const MainDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.background,
          width: 280,
        },
        drawerLabelStyle: {
          marginLeft: -10,
          fontWeight: '500',
        },
        drawerItemStyle: {
          marginVertical: 2,
          borderRadius: 8,
        },
      }}
    >
      <Drawer.Screen name="MainTabs" component={TabNavigator} />
    </Drawer.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <MainDrawer />
    </NavigationContainer>
  );
};

// Drawer Styles
const drawerStyles = StyleSheet.create({
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
});