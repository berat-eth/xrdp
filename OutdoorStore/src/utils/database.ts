import { supabase } from './supabase';

// This function is no longer needed for table creation as tables are created in Supabase
// But we keep it for compatibility and to show initialization messages
export const initDatabase = async () => {
  try {
    // Check if we can connect to Supabase
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Error connecting to Supabase:', error);
      console.log('Please make sure you have:');
      console.log('1. Created a Supabase project');
      console.log('2. Run the SQL schema in supabase_schema.sql');
      console.log('3. Updated SUPABASE_URL and SUPABASE_ANON_KEY in your environment');
      return;
    }

    console.log('Successfully connected to Supabase');
    
    // Check if sample products need to be inserted
    await checkAndInsertSampleProducts();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

const checkAndInsertSampleProducts = async () => {
  try {
    // Check if products table is empty
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error checking product count:', countError);
      return;
    }

    // If no products exist, insert sample products
    if (count === 0) {
      console.log('No products found, inserting sample products...');
      
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
          review_count: 234
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
          review_count: 156
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
          review_count: 412
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
          review_count: 89
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
          review_count: 67
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
          review_count: 143
        }
      ];

      const { error: insertError } = await supabase
        .from('products')
        .insert(sampleProducts);

      if (insertError) {
        console.error('Error inserting sample products:', insertError);
      } else {
        console.log('Sample products inserted successfully');
      }
    } else {
      console.log(`Found ${count} existing products`);
    }
  } catch (error) {
    console.error('Error in checkAndInsertSampleProducts:', error);
  }
};

// Export a dummy db object for backward compatibility
// This should be removed once all references to the old SQLite db are updated
const db = {
  openDatabaseSync: () => null,
  execAsync: async () => {},
  runAsync: async () => ({ lastInsertRowId: 0, changes: 0 }),
  getFirstAsync: async () => null,
  getAllAsync: async () => [],
};

export default db;