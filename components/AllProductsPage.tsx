
import React, { useState, useMemo, useEffect } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, Check, X, ChevronUp } from 'lucide-react';
import Navbar from './Navbar';
import CategoryBar from './CategoryBar';
import ProductCard from './ProductCard';
import Footer from './Footer';
import AccountSidebar from './AccountSidebar';
import { Product, PageType, User } from '../types';
import { productService } from '../services/productService';

const motion = framerMotion as any;

interface AllProductsPageProps {
  onNavigate: (page: PageType) => void;
  user: User | null;
  onLogout: () => void;
  onProductClick: (product: Product) => void;
  cartItemCount: number;
  onSelectCategory: (category: string) => void;
  onSearch?: (query: string) => void;
  searchQuery?: string;
}

type SortOption = 'Relevance' | 'Popular' | 'New';

const AllProductsPage: React.FC<AllProductsPageProps> = ({
  onNavigate,
  user,
  onLogout,
  onProductClick,
  cartItemCount,
  onSelectCategory,
  onSearch,
  searchQuery = ''
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('Relevance');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isProductAccordionOpen, setIsProductAccordionOpen] = useState(true);

  const [baseAllProducts, setBaseAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const products = await productService.getAllProductsAsync();
      setBaseAllProducts(products);
    };
    loadProducts();
  }, []);

  // Sorting and Filtering Logic
  const sortedAllProducts = useMemo(() => {
    let products = [...baseAllProducts];

    // Filter by Search Query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      products = products.filter(p =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
      );
    }

    // Sort Logic
    if (sortBy === 'New') {
      return products.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1));
    } else if (sortBy === 'Popular') {
      return products.sort((a, b) => b.price - a.price);
    }
    return products;
  }, [baseAllProducts, sortBy, searchQuery]);

  const handleAccountClick = () => {
    if (user) {
      setIsSidebarOpen(true);
    } else {
      onNavigate('login');
    }
  };

  const handleLogout = () => {
    setIsSidebarOpen(false);
    onLogout();
  };

  const handleCategorySelect = (category: string) => {
    // Close filter first
    setIsFilterOpen(false);

    if (category === "See All Product") {
      // We are already on the "All Products" view logic
      return;
    }
    // Navigate back to home with selected category to show specific category view
    onSelectCategory(category);
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-[#020205] text-white font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-black">
      <Navbar
        onAccountClick={handleAccountClick}
        onHomeClick={() => onNavigate('home')}
        onCartClick={() => onNavigate('cart')}
        cartItemCount={cartItemCount}
        onSearch={onSearch}
      />

      <CategoryBar
        selectedCategory="See All Product"
        onSelectCategory={handleCategorySelect}
      />

      <AccountSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogout={handleLogout}
        user={user}
        onNavigate={onNavigate}
      />

      {/* Filter Sidebar */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />

            {/* Sidebar Content */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-[320px] bg-white text-black z-[70] shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-6 flex items-center justify-between border-b border-gray-100">
                <div className="w-6"></div> {/* Spacer for centering */}
                <h2 className="text-2xl font-black brand-font tracking-wide">Filter</h2>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar-light">
                {/* Product Accordion */}
                <div className="mb-4">
                  <button
                    onClick={() => setIsProductAccordionOpen(!isProductAccordionOpen)}
                    className="w-full flex items-center justify-between py-2 font-bold text-lg brand-font border-b border-gray-200 mb-4"
                  >
                    <span>Product</span>
                    {isProductAccordionOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>

                  <AnimatePresence>
                    {isProductAccordionOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <ul className="space-y-1">
                          {/* All Product Option */}
                          <li>
                            <button
                              onClick={() => handleCategorySelect("See All Product")}
                              className="w-full text-left px-4 py-3 bg-[#e5e7eb] rounded-lg font-bold text-sm flex items-center justify-between hover:bg-gray-300 transition-colors"
                            >
                              <span>All Product</span>
                              <Check size={16} />
                            </button>
                          </li>

                          {/* Adult Apparel Group */}
                          <div className="pt-4 pb-2">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Adult Apparel</span>
                          </div>
                          {['T-shirt', 'Hoodies', 'Tank Tops', 'Shorts'].map((cat) => (
                            <li key={cat}>
                              <button
                                onClick={() => handleCategorySelect(cat)}
                                className="w-full text-left px-4 py-2 text-sm font-bold text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                {cat}
                              </button>
                            </li>
                          ))}

                          {/* Kids Group */}
                          <div className="pt-4 pb-2">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Adult Kids</span>
                          </div>
                          <li>
                            <button
                              onClick={() => handleCategorySelect('Kids')}
                              className="w-full text-left px-4 py-2 text-sm font-bold text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                              Kids t-shirts
                            </button>
                          </li>

                          {/* Accessories Group (Labeled as Adult Kids in reference, but functionally Accessories) */}
                          <div className="pt-4 pb-2">
                            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Accessories</span>
                          </div>
                          {['Bags', 'Hats'].map((cat) => (
                            <li key={cat}>
                              <button
                                onClick={() => handleCategorySelect(cat)}
                                className="w-full text-left px-4 py-2 text-sm font-bold text-gray-800 hover:text-purple-600 hover:bg-gray-50 rounded-lg transition-colors"
                              >
                                {cat}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Filter Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50">
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="w-full py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm"
                >
                  Apply Filter
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="py-16 bg-[#020205] relative overflow-hidden min-h-[800px]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Header & Sort Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b border-white/10 pb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white brand-font mb-2 uppercase">
                {searchQuery
                  ? `SEARCH RESULTS FOR "${searchQuery}"`
                  : (sortBy === 'Relevance' ? 'ALL PRODUCT' : `ALL ${sortBy} PRODUCT`)
                }
              </h2>
              <p className="text-gray-400 font-medium text-sm">Check out the most popular products on the Farrtz Marketplace!</p>
            </motion.div>

            <div className="flex items-center gap-3">
              {/* Filter Button */}
              <button
                onClick={() => setIsFilterOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-sm font-bold tech-font tracking-wide"
              >
                <Filter size={16} />
                Filter
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-200 transition-colors text-sm font-bold tech-font tracking-wide min-w-[140px] justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span>Sort: {sortBy}</span>
                  </div>
                  <ChevronDown size={16} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a2e] border border-purple-500/30 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      {['Relevance', 'Popular', 'New'].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSortBy(option as SortOption);
                            setIsSortOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 text-sm font-medium hover:bg-white/5 flex items-center justify-between group transition-colors"
                        >
                          <span className={`${sortBy === option ? 'text-cyan-400 font-bold' : 'text-gray-300 group-hover:text-white'}`}>
                            {option}
                          </span>
                          {sortBy === option && <Check size={16} className="text-cyan-400" />}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 lg:gap-8">
            {sortedAllProducts.length > 0 ? (
              sortedAllProducts.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard product={product} onClick={() => onProductClick(product)} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 text-gray-500">
                <p className="text-xl font-bold mb-2">No products found</p>
                <p className="text-sm">Try searching for "shirt", "hoodie", or "cyber".</p>
              </div>
            )}
          </div>

        </div>
      </motion.div>

      <Footer />
    </div>
  );
};

export default AllProductsPage;
