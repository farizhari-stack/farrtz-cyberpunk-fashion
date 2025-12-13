
import { Product } from '../types';
import { generateMixedProducts } from '../utils/products';

const PRODUCTS_KEY = 'farrtz_products_db';

export const productService = {
  // Initialize DB with mock data if empty
  initialize: () => {
    const stored = localStorage.getItem(PRODUCTS_KEY);
    if (!stored) {
        // Generate a robust set of initial products
        const initialProducts = [
            ...generateMixedProducts(20, 100), // Mix
        ];
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(initialProducts));
    }
  },

  getAllProducts: (): Product[] => {
    productService.initialize();
    const stored = localStorage.getItem(PRODUCTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveProduct: (product: Product) => {
    const products = productService.getAllProducts();
    const index = products.findIndex(p => p.id === product.id);
    
    if (index !== -1) {
        // Update
        products[index] = product;
    } else {
        // Create
        products.push(product);
    }
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  },

  deleteProduct: (id: number) => {
    const products = productService.getAllProducts();
    const filtered = products.filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
  }
};
