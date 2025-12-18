/**
 * Product Service - localStorage Version (No Backend)
 * All products stored in browser localStorage
 */

import { Product } from '../types';
import { generateMixedProducts } from '../utils/products';

const PRODUCTS_KEY = 'farrtz_products_db';

// Initialize products on first load
const initializeProducts = () => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  if (!stored) {
    const initialProducts = [...generateMixedProducts(20, 100)];
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
  }
};

export const productService = {
  // Initialize products
  initialize: () => {
    initializeProducts();
  },

  // Get all products (sync)
  getAllProducts: (): Product[] => {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (!stored) {
      const initialProducts = [...generateMixedProducts(20, 100)];
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
      return initialProducts;
    }
    return JSON.parse(stored);
  },

  // Async version for compatibility
  getAllProductsAsync: async (): Promise<Product[]> => {
    return productService.getAllProducts();
  },

  // Alias for backward compatibility
  getAllProductsSync: (): Product[] => {
    return productService.getAllProducts();
  },

  // Get product by ID
  getProductById: (id: number): Product | undefined => {
    const products = productService.getAllProducts();
    return products.find(p => p.id === id);
  },

  // Async version for compatibility
  getProductByIdAsync: async (id: number): Promise<Product | undefined> => {
    return productService.getProductById(id);
  },

  // Save product (create or update)
  saveProduct: async (product: Product): Promise<{ success: boolean; product?: Product }> => {
    const products = productService.getAllProducts();

    if (product.id && product.id > 0) {
      // Update existing product
      const index = products.findIndex(p => p.id === product.id);
      if (index >= 0) {
        products[index] = product;
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        return { success: true, product };
      }
      return { success: false };
    } else {
      // Create new product
      const newProduct = { ...product, id: Date.now() };
      products.push(newProduct);
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
      return { success: true, product: newProduct };
    }
  },

  // Delete product
  deleteProduct: async (id: number): Promise<void> => {
    const products = productService.getAllProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
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

  // Refresh (no-op in localStorage version)
  refreshFromApi: async (): Promise<void> => {
    // No API to refresh from
  }
};
