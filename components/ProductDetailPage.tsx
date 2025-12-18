
import React, { useState } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Heart, Minus, Plus, CheckCircle } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import SizeChartModal from './SizeChartModal';
import { Product, PageType, User } from '../types';
import { authService } from '../services/supabaseAuth';

const motion = framerMotion as any;

interface ProductDetailPageProps {
  product: Product;
  user: User | null;
  setUser: (user: User) => void;
  onNavigate: (page: PageType) => void;
  onBack: () => void;
  onAccountClick: () => void;
  onAddToCart: (product: Product, quantity: number, details: { [key: string]: string }) => void;
  cartItemCount: number;
  onSearch?: (query: string) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  user,
  setUser,
  onNavigate,
  onBack,
  onAccountClick,
  onAddToCart,
  cartItemCount,
  onSearch
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('black');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Check wishlist status from props directly
  const isFavorite = user?.wishlist?.includes(product.id) || false;

  const handleWishlistClick = async () => {
    if (!user) {
      onNavigate('login');
      return;
    }

    let newWishlist: number[];

    if (isFavorite) {
      // Remove if already in wishlist
      newWishlist = (user.wishlist || []).filter(id => id !== product.id);
    } else {
      // Add if not in wishlist
      newWishlist = [...(user.wishlist || []), product.id];
    }

    const updatedUser = { ...user, wishlist: newWishlist };

    await authService.updateUser(updatedUser);
    setUser(updatedUser); // Update App state
  };

  const sizes = ['S', 'M', 'L', 'XL', '2XL'];
  const colors = [
    { name: 'white', class: 'bg-white' },
    { name: 'black', class: 'bg-black' },
    { name: 'red', class: 'bg-red-600' },
  ];

  // Logic to determine if size selector should be shown
  const showSizeSelector = !['Bags', 'Hats'].includes(product.category);

  const handleAddToCart = () => {
    const details: { [key: string]: string } = {
      color: selectedColor
    };
    if (showSizeSelector) {
      details.size = selectedSize;
    }

    onAddToCart(product, quantity, details);

    // Show toast instead of navigating
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-purple-500 selection:text-white">
      <Navbar
        onAccountClick={onAccountClick}
        onHomeClick={onBack}
        onCartClick={() => onNavigate('cart')}
        cartItemCount={cartItemCount}
        onSearch={onSearch}
      />

      <SizeChartModal
        isOpen={showSizeChart}
        onClose={() => setShowSizeChart(false)}
        category={product.category}
      />

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg shadow-green-500/30 flex items-center gap-3"
          >
            <CheckCircle size={20} />
            <span className="font-bold tech-font tracking-wide">Added to Cart Successfully</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative w-full min-h-screen flex flex-col pt-10 pb-20">
        {/* Background Cyberpunk Overlay */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          {/* Gradient Base */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-[#1e1b4b] to-[#2e1065] opacity-80"></div>

          {/* Character Graphic Overlay - positioned to match reference */}
          <div className="absolute top-20 right-0 w-full md:w-2/3 h-full opacity-40 mix-blend-screen">
            <img
              src="https://images.unsplash.com/photo-1615813967515-e1838c1c5116?q=80&w=1887&auto=format&fit=crop"
              alt="Cyberpunk Character"
              className="w-full h-full object-cover object-top mask-image-gradient"
              style={{ maskImage: 'linear-gradient(to left, black, transparent)' }}
            />
          </div>

          {/* Cyber Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-1">

          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest tech-font">Back to Shop</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* Left Column - Product Image Card */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-6 shadow-[0_0_30px_rgba(255,255,255,0.1)] relative overflow-hidden group">
                <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.title}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="text-gray-400 font-bold tech-font text-sm uppercase tracking-widest">
                      No Product Image
                    </div>
                  )}
                </div>

                {/* Wishlist Button - Updates logic to navigate */}
                <button
                  onClick={handleWishlistClick}
                  className={`absolute top-8 right-8 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center transition-colors z-20 ${isFavorite ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                  title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                >
                  <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                </button>
              </div>
            </motion.div>

            {/* Right Column - Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8 pt-4"
            >
              <div>
                <h1 className="text-3xl md:text-5xl font-bold brand-font text-white mb-2 leading-tight">
                  {product.title}
                </h1>
                <div className="flex items-baseline gap-4">
                  {product.isSale && product.originalPrice && (
                    <span className="text-xl text-gray-400 line-through tech-font">Rp. {product.originalPrice.toLocaleString()}</span>
                  )}
                  <span className="text-3xl font-bold text-white tech-font">Rp. {product.price.toLocaleString()}</span>
                </div>
                <p className="text-gray-400 text-sm mt-2">
                  <span className="text-cyan-400 font-bold">{product.category}</span> designed and sold by <span className="text-white font-bold">Fariz</span>
                </p>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 tech-font">Color: <span className="text-gray-400 capitalize">{selectedColor}</span></h3>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={`w-8 h-8 rounded-full ${color.class} border-2 flex items-center justify-center transition-all ${selectedColor === color.name
                          ? 'border-cyan-400 scale-110 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                          : 'border-gray-600 hover:border-gray-400'
                        }`}
                    >
                      {selectedColor === color.name && <div className={`w-2 h-2 rounded-full ${color.name === 'white' ? 'bg-black' : 'bg-white'}`} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection - Conditionally Rendered */}
              {showSizeSelector && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider tech-font">Size</h3>
                    <button
                      onClick={() => setShowSizeChart(true)}
                      className="text-xs text-gray-400 underline hover:text-white transition-colors"
                    >
                      View size chart
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-10 rounded-lg text-sm font-bold transition-all border ${selectedSize === size
                            ? 'bg-white text-black border-white shadow-[0_0_10px_rgba(255,255,255,0.3)]'
                            : 'bg-transparent text-gray-400 border-gray-700 hover:border-gray-500 hover:text-white'
                          }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex items-center bg-[#1a1a2e] rounded-full border border-gray-700 w-max">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center font-bold text-white tech-font">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 px-8 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(124,58,237,0.5)] hover:shadow-[0_0_30px_rgba(124,58,237,0.7)] transition-all flex items-center justify-center gap-2 transform active:scale-95"
                >
                  ADD TO CART
                </button>
              </div>

              {/* Description */}
              <div className="pt-6 border-t border-white/10">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 tech-font">Description</h3>
                <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">
                  {product.description || 'No description available for this product.'}
                </p>
              </div>

            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetailPage;
