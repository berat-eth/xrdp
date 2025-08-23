import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('outdoor_store.db');

export const initDatabase = async () => {
  try {
    // Users tablosu
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Products tablosu
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT NOT NULL,
        image TEXT,
        stock INTEGER DEFAULT 0,
        brand TEXT,
        rating REAL DEFAULT 0,
        reviewCount INTEGER DEFAULT 0
      );
    `);

    // Cart tablosu
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      );
    `);

    // Orders tablosu
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        shippingAddress TEXT NOT NULL,
        paymentMethod TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      );
    `);

    // Order Items tablosu
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (orderId) REFERENCES orders(id),
        FOREIGN KEY (productId) REFERENCES products(id)
      );
    `);

    // Örnek ürünleri ekle
    await insertSampleProducts();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

const insertSampleProducts = async () => {
  try {
    const count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM products');
    
    if (count && count.count === 0) {
      const sampleProducts = [
        {
          name: 'Gore-Tex Pro Ceket',
          description: 'Profesyonel dağcılar için tasarlanmış, tamamen su geçirmez ve nefes alabilen ceket',
          price: 3499.90,
          category: 'Ceketler',
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35',
          stock: 15,
          brand: 'The North Face',
          rating: 4.8,
          reviewCount: 234
        },
        {
          name: 'Trekking Pantolonu',
          description: 'Dayanıklı ve esnek kumaştan üretilmiş, çok cepli outdoor pantolon',
          price: 899.90,
          category: 'Pantolonlar',
          image: 'https://images.unsplash.com/photo-1594938291221-94f18cbb5660',
          stock: 25,
          brand: 'Columbia',
          rating: 4.5,
          reviewCount: 156
        },
        {
          name: 'Vibram Trekking Botu',
          description: 'Vibram taban, Gore-Tex membran, ayak bileği destekli profesyonel trekking botu',
          price: 2299.90,
          category: 'Ayakkabılar',
          image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
          stock: 20,
          brand: 'Salomon',
          rating: 4.9,
          reviewCount: 412
        },
        {
          name: '65L Sırt Çantası',
          description: 'Uzun parkurlar için ideal, ergonomik sırt sistemi ile donatılmış büyük boy sırt çantası',
          price: 1899.90,
          category: 'Sırt Çantaları',
          image: 'https://images.unsplash.com/photo-1622260614153-03223fb72052',
          stock: 12,
          brand: 'Deuter',
          rating: 4.7,
          reviewCount: 89
        },
        {
          name: '4 Mevsim Çadır',
          description: 'Extreme hava koşullarına dayanıklı, 3 kişilik profesyonel dağ çadırı',
          price: 4999.90,
          category: 'Çadırlar',
          image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4',
          stock: 8,
          brand: 'MSR',
          rating: 4.6,
          reviewCount: 67
        },
        {
          name: '-15°C Uyku Tulumu',
          description: 'Kaz tüyü dolgulu, -15 dereceye kadar konfor sağlayan premium uyku tulumu',
          price: 1599.90,
          category: 'Uyku Tulumları',
          image: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7',
          stock: 18,
          brand: 'Marmot',
          rating: 4.4,
          reviewCount: 143
        }
      ];

      for (const product of sampleProducts) {
        await db.runAsync(
          `INSERT INTO products (name, description, price, category, image, stock, brand, rating, reviewCount) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [product.name, product.description, product.price, product.category, 
           product.image, product.stock, product.brand, product.rating, product.reviewCount]
        );
      }
      
      console.log('Sample products inserted successfully');
    }
  } catch (error) {
    console.error('Error inserting sample products:', error);
  }
};

export default db;