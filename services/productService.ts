/**
 * Product Service - Updated to use Supabase
 * Maintains FULL backward compatibility with existing components (sync calls)
 */

import { Product } from '../types';
import { productsService } from './supabaseServices';
import { generateMixedProducts } from '../utils/products';

const PRODUCTS_KEY = 'farrtz_products_db';

// Initialize on module load - sync from Supabase to localStorage
const initializeProducts = async () => {
  try {
    const products = await productsService.getAllProducts();
    if (products && products.length > 0) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      return;
    }
  } catch (error) {
    console.log('Supabase not available, using localStorage fallback');
  }

  // Fallback to localStorage if Supabase is not available
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (!stored) {
    const initialProducts = [...generateMixedProducts(20, 100)];
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
  }
};

// Auto-initialize on load
initializeProducts();

export const productService = {
  // SYNC version - returns from localStorage (backward compatible!)
  getAllProducts: (): Product[] => {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (!stored) {
      // Generate initial products if none exist
      const initialProducts = [...generateMixedProducts(20, 100)];
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
      return initialProducts;
    }
    return JSON.parse(stored);
  },

  // ASYNC version - fetches from Supabase and updates cache
  getAllProductsAsync: async (): Promise<Product[]> => {
    try {
      const products = await productsService.getAllProducts();
      if (products) {
        return products;
      }
    } catch (error) {
      console.error('Supabase error:', error);
    }
    return [];
  },

  // Alias for backward compatibility
  getAllProductsSync: (): Product[] => {
    return productService.getAllProducts();
  },

  // Initialize - can be called manually to refresh from Supabase
  initialize: async () => {
    await initializeProducts();
  },

  getProductById: (id: number): Product | undefined => {
    const products = productService.getAllProducts();
    return products.find(p => p.id === id);
  },

  // Async version that tries Supabase first
  getProductByIdAsync: async (id: number): Promise<Product | undefined> => {
    try {
      const product = await productsService.getProductById(id);
      if (product) {
        return product;
      }
    } catch (error) {
      console.log('Supabase error, using localStorage fallback');
    }
    return productService.getProductById(id);
  },

  saveProduct: async (product: Product): Promise<{ success: boolean; product?: Product }> => {
    try {
      let savedProduct;
      if (product.id && product.id > 0) {
        // Update existing product
        savedProduct = await productsService.updateProduct(product.id, product);
      } else {
        // Create new product
        savedProduct = await productsService.createProduct(product);
      }

      if (savedProduct) {
        console.log('✅ Product saved to database:', savedProduct);
        return { success: true, product: savedProduct };
      } else {
        console.error('❌ Failed to save product');
        return { success: false };
      }
    } catch (error) {
      console.error('❌ Error saving product:', error);
      return { success: false };
    }
  },

  deleteProduct: async (id: number) => {
    const products = productService.getAllProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));

    // Also delete from Supabase in background
    try {
      await productsService.deleteProduct(id);
    } catch (error) {
      console.error('Failed to delete from Supabase:', error);
    }
  },

  // Filter products by category
  getProductsByCategory: (category: string): Product[] => {
    const products = productService.getAllProducts();
    return products.filter(p => p.category === category);
  },

  // Search products
  searchProducts: (query: string): Product[] => {
    const products = productService.getAllProducts();
    return products.filter(p =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get sale products
  getSaleProducts: (): Product[] => {
    const products = productService.getAllProducts();
    return products.filter(p => p.isSale);
  },

  // Get new products
  getNewProducts: (): Product[] => {
    const products = productService.getAllProducts();
    return products.filter(p => p.isNew);
  },

  // Refresh products from Supabase (call this periodically or on user action)
  refreshFromApi: async (): Promise<void> => {
    try {
      const products = await productsService.getAllProducts();
      if (products) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      }
    } catch (error) {
      console.log('Failed to refresh from Supabase');
    }
  }
};
