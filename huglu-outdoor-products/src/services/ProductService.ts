import axios from 'axios';
import { parseString } from 'xml2js';
import { Product, ProductsData } from '../types/Product';

export class ProductService {
  private static XML_URL = 'https://www.hugluoutdoor.com/TicimaxXml/0A284D6AA29B46369ED03DEDF1EDA0D9/';

  static async fetchProducts(): Promise<Product[]> {
    try {
      // Fetch XML data
      const response = await axios.get(this.XML_URL, {
        responseType: 'text',
        headers: {
          'Accept': 'application/xml, text/xml',
        }
      });

      // Parse XML to JSON
      return new Promise((resolve, reject) => {
        parseString(response.data, { 
          explicitArray: false,
          mergeAttrs: true,
          normalizeTags: false,
          trim: true
        }, (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          try {
            const productsData = result as ProductsData;
            const products = productsData.Root?.Urunler?.Urun;
            
            // Ensure products is always an array
            if (Array.isArray(products)) {
              resolve(products);
            } else if (products) {
              resolve([products]);
            } else {
              resolve([]);
            }
          } catch (error) {
            reject(error);
          }
        });
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  static getCategories(products: Product[]): string[] {
    const categories = new Set<string>();
    products.forEach(product => {
      if (product.Kategori) {
        categories.add(product.Kategori);
      }
    });
    return Array.from(categories);
  }

  static filterByCategory(products: Product[], category: string): Product[] {
    if (!category || category === 'all') {
      return products;
    }
    return products.filter(product => product.Kategori === category);
  }

  static cleanHtml(html: string): string {
    // Remove CDATA tags and clean HTML
    return html
      .replace(/<!\[CDATA\[/g, '')
      .replace(/\]\]>/g, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  static formatPrice(price: string): string {
    const numPrice = parseFloat(price.replace(',', '.'));
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(numPrice);
  }
}