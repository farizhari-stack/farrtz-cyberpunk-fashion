
import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, Zap } from 'lucide-react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';

const motion = framerMotion as any;

interface NavbarProps {
  onAccountClick?: () => void;
  onHomeClick?: () => void;
  onCartClick?: () => void;
  cartItemCount?: number;
  onSearch?: (query: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAccountClick, onHomeClick, onCartClick, cartItemCount = 0, onSearch }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(inputValue);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-black/80 backdrop-blur-lg border-b border-purple-500/30 shadow-neon-purple">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Left: Logo, Mobile Menu & Shop Link */}
          <div className="flex items-center gap-6">
            <button
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-purple-900/50 lg:hidden transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={onHomeClick}
            >
              {/* Logo Icon - Custom FARRTZ Logo */}
              <img
                src="/logo-farrtz.png"
                alt="FARRTZ Logo"
                className="w-14 h-14 object-contain drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]"
              />
              <span className="text-2xl font-black tracking-widest brand-font text-white italic bg-clip-text bg-gradient-to-r from-white to-gray-400">
                FARRTZ
              </span>
            </motion.div>

            {/* Shop Link - Moved here as requested */}
            <div className="hidden lg:flex items-center">
              <motion.a
                href="#"
                whileHover={{ x: 2, color: '#22d3ee' }}
                className="flex items-center gap-1 px-4 py-2 text-sm font-bold tracking-wider uppercase tech-font text-gray-300 hover:text-cyan-400 transition-colors border-l border-white/10"
              >
                <Zap size={16} className="text-purple-500" />
                Shop
              </motion.a>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearchSubmit} className="relative w-full group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-50 group-hover:opacity-100 transition duration-500 blur"></div>
              <input
                type="text"
                placeholder="Search the mainframe..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="relative w-full bg-black text-white border border-gray-800 rounded-full pl-6 pr-12 py-2.5 focus:outline-none focus:border-purple-500 placeholder-gray-500 tech-font tracking-wide"
              />
              <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full p-2 transition-colors z-10">
                <Search size={16} />
              </button>
            </form>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-6">
            <motion.button
              whileHover={{ scale: 1.1, color: '#22d3ee' }}
              onClick={onAccountClick}
              className="flex items-center gap-2 text-gray-300 hover:text-cyan-400 transition-colors"
            >
              <User size={20} />
              <span className="hidden sm:inline font-bold tech-font tracking-wide text-sm">ACCOUNT</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, color: '#e879f9' }}
              onClick={onCartClick}
              className="flex items-center gap-2 text-gray-300 hover:text-fuchsia-400 transition-colors relative"
            >
              <ShoppingCart size={20} />
              <span className="hidden sm:inline font-bold tech-font tracking-wide text-sm">CART</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-cyan-500 rounded-full text-[10px] flex items-center justify-center text-black font-bold">
                  {cartItemCount}
                </span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-black/95 border-b border-purple-500/30 backdrop-blur-xl"
          >
            <div className="px-4 pt-4 pb-6 space-y-2">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full mb-4 bg-gray-900 border border-gray-700 text-white rounded-md px-4 py-2 tech-font focus:border-purple-500 outline-none"
                />
              </form>
              <a href="#" className="block px-3 py-2 rounded-md text-lg font-bold brand-font text-white hover:bg-purple-900/30 hover:text-cyan-400">Shop</a>
              <a href="#" className="block px-3 py-2 rounded-md text-lg font-bold brand-font text-white hover:bg-purple-900/30 hover:text-cyan-400">Categories</a>
              <a href="#" className="block px-3 py-2 rounded-md text-lg font-bold brand-font text-white hover:bg-purple-900/30 hover:text-cyan-400">Sale</a>
              <button onClick={onAccountClick} className="w-full text-left px-3 py-2 rounded-md text-lg font-bold brand-font text-white hover:bg-purple-900/30 hover:text-cyan-400">Account</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
