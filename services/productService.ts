/**
 * Product Service - Updated to use Backend API
 * Maintains FULL backward compatibility with existing components (sync calls)
 */

import { Product } from '../types';
import { productsApi } from './api';
import { generateMixedProducts } from '../utils/products';

const PRODUCTS_KEY = 'farrtz_products_db';

// Initialize on module load - sync from API to localStorage
const initializeProducts = async () => {
  try {
    const response = await productsApi.getAll();
    if (response.success && response.products && response.products.length > 0) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(response.products));
      return;
    }
  } catch (error) {
    console.log('API not available, using localStorage fallback');
  }

  // Fallback to localStorage if API is not available
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

  // ASYNC version - fetches from API and updates cache
  getAllProductsAsync: async (): Promise<Product[]> => {
    try {
      const response = await productsApi.getAll();
      if (response.success && response.products) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(response.products));
        return response.products;
      }
    } catch (error) {
      console.log('API error, using localStorage fallback');
    }
    return productService.getAllProducts();
  },

  // Alias for backward compatibility
  getAllProductsSync: (): Product[] => {
    return productService.getAllProducts();
  },

  // Initialize - can be called manually to refresh from API
  initialize: async () => {
    await initializeProducts();
  },

  getProductById: (id: number): Product | undefined => {
    const products = productService.getAllProducts();
    return products.find(p => p.id === id);
  },

  // Async version that tries API first
  getProductByIdAsync: async (id: number): Promise<Product | undefined> => {
    try {
      const response = await productsApi.getById(id);
      if (response.success && response.product) {
        return response.product;
      }
    } catch (error) {
      console.log('API error, using localStorage fallback');
    }
    return productService.getProductById(id);
  },

  saveProduct: (product: Product) => {
    const products = productService.getAllProducts();
    const index = products.findIndex(p => p.id === product.id);

    if (index !== -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));

    // Also save to API in background (fire and forget)
    if (product.id) {
      productsApi.update(product.id, product).catch(console.error);
    } else {
      productsApi.create(product).catch(console.error);
    }
  },

  deleteProduct: (id: number) => {
    const products = productService.getAllProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));

    // Also delete from API in background
    productsApi.delete(id).catch(console.error);
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

  // Refresh products from API (call this periodically or on user action)
  refreshFromApi: async (): Promise<void> => {
    try {
      const response = await productsApi.getAll();
      if (response.success && response.products) {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(response.products));
      }
    } catch (error) {
      console.log('Failed to refresh from API');
    }
  }
};
