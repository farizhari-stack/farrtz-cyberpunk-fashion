
import React, { useState, useEffect } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { Heart, X, ShoppingCart, ArrowRight } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import AccountSidebar from './AccountSidebar';
import { PageType, User, Product } from '../types';
import { authService } from '../services/supabaseAuth';
import { getProductById } from '../utils/products';

const motion = framerMotion as any;

interface FavoritesPageProps {
  onNavigate: (page: PageType) => void;
  user: User | null;
  setUser: (user: User) => void;
  onLogout: () => void;
  cartItemCount: number;
  onProductClick: (product: Product) => void;
  onSearch?: (query: string) => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigate, user, setUser, onLogout, cartItemCount, onProductClick, onSearch }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (user && user.wishlist) {
        const products = user.wishlist.map(id => getProductById(id)).filter(p => p !== undefined) as Product[];
        setWishlistProducts(products);
    }
  }, [user]);

  const removeFavorite = async (productId: number) => {
      if (!user) return;
      const newWishlist = user.wishlist?.filter(id => id !== productId) || [];
      const updatedUser = { ...user, wishlist: newWishlist };
      
      const result = await authService.updateUser(updatedUser);
      if (result.success && result.user) {
          setUser(result.user);
      }
  };

  if (!user) {
      onNavigate('login');
      return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2e1065] to-[#0f0c29] text-white font-sans selection:bg-purple-500 selection:text-white">
      <Navbar 
        onAccountClick={() => setIsSidebarOpen(true)} 
        onHomeClick={() => onNavigate('home')} 
        onCartClick={() => onNavigate('cart')}
        cartItemCount={cartItemCount}
        onSearch={onSearch}
      />
      
      <AccountSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        onLogout={onLogout}
        user={user}
        onNavigate={onNavigate}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[80vh]">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
        >
            <h1 className="text-3xl md:text-4xl font-black brand-font mb-2">My Account</h1>
            <div className="w-full h-[1px] bg-gradient-to-r from-purple-500 to-transparent mb-6"></div>
        </motion.div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-8 border border-white/10 shadow-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-8 text-white">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-pink-500">
                    <Heart size={18} fill="currentColor" />
                </div>
                Favorite
            </h2>

            {wishlistProducts.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-600">
                        <Heart size={40} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Your wishlist is empty</h3>
                    <p className="text-gray-400 mb-6">Save items you love to your wishlist to buy them later.</p>
                    <button 
                        onClick={() => onNavigate('home')}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full font-bold shadow-lg hover:shadow-cyan-500/50 transition-all"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlistProducts.map((product) => (
                        <motion.div 
                            key={product.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            layout
                            className="bg-white rounded-xl overflow-hidden relative group shadow-lg"
                        >
                            {/* Remove Button */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFavorite(product.id);
                                }}
                                className="absolute top-2 right-2 z-20 w-6 h-6 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 shadow-md transition-colors"
                            >
                                <X size={14} />
                            </button>

                            {/* Image Area */}
                            <div 
                                onClick={() => onProductClick(product)}
                                className="aspect-[4/5] bg-gray-100 flex items-center justify-center relative overflow-hidden cursor-pointer"
                            >
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <span className="text-xs text-gray-400 font-bold uppercase">No Image</span>
                                )}
                                
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                            </div>

                            {/* Details */}
                            <div className="p-3">
                                <h3 
                                    onClick={() => onProductClick(product)}
                                    className="text-gray-900 font-bold text-xs md:text-sm line-clamp-2 leading-tight mb-2 cursor-pointer hover:text-purple-600"
                                >
                                    {product.title}
                                </h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-900 font-bold text-sm font-mono">
                                        Rp. {product.price.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FavoritesPage;
