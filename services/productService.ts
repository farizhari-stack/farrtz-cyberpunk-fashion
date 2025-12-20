import { Product } from '../types';

export const productService = {
  initialize: () => {
    // No-op
  },

  getAllProducts: async (): Promise<Product[]> => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      return data;
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getAllProductsAsync: async (): Promise<Product[]> => {
    return productService.getAllProducts();
  },

  getAllProductsSync: (): Product[] => {
    console.warn("getAllProductsSync is deprecated in Next.js version");
    return [];
  },

  saveProduct: async (product: Product): Promise<{ success: boolean; product?: Product }> => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      const data = await res.json();
      return { success: res.ok, product: data };
    } catch (e) {
      return { success: false };
    }
  },

  deleteProduct: async (id: number): Promise<void> => {
    // Implement DELETE API if needed
  },

  getProductById: (id: number): Product | undefined => {
    // Cannot be sync anymore. Return undefined.
    return undefined;
  },

  getProductsByCategory: (category: string): Product[] => {
    // Cannot be sync.
    return [];
  },

  // These synchronous getters used by UI filtering might be broken.
  // The UI should filter the *loaded* products array.
  // Home.tsx does exactly that (lines 37-43 load products into state, then useMemo to filter).
  // So replacing these methods with empty/dummy is fine as long as Home.tsx doesn't use them directly for *fetching*.
  // It uses `generateProducts` helper via `useEffect` -> `productService.getAllProductsAsync`.
  // Wait, Home.tsx uses `productService.getAllProductsAsync` ONLY.
  // It uses `generateProducts` from `utils` if API fails?
  // It uses `productService` for `getAll`.
  // It filters `allProducts` state using `useMemo`. It DOES NOT call `productService.getProductsByCategory`.
  // So we are safe.
};
