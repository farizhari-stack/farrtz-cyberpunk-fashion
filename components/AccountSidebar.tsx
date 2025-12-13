
import React from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Settings, Heart, LogOut } from 'lucide-react';
import { User, PageType } from '../types';

const motion = framerMotion as any;

interface AccountSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: User | null;
  onNavigate: (page: PageType) => void;
}

const AccountSidebar: React.FC<AccountSidebarProps> = ({ isOpen, onClose, onLogout, user, onNavigate }) => {
  
  const handleNavigation = (page: PageType) => {
    onNavigate(page);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          />
          
          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-[300px] bg-[#2e1065] z-[70] shadow-[-10px_0_30px_rgba(76,29,149,0.5)] border-l border-purple-500/30 flex flex-col"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            {/* User Profile Header */}
            <div className="p-6 pt-12 pb-8 border-b border-white/10 bg-[#1e0b4b]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5">
                    <img 
                      src={user?.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=Guest"} 
                      alt="Avatar" 
                      className="w-full h-full rounded-[7px] bg-black object-cover"
                    />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="text-white font-bold brand-font text-sm truncate">{user ? `${user.firstName}` : 'Guest User'}</h3>
                    <p className="text-gray-400 text-xs tech-font truncate w-32">{user?.email || ''}</p>
                  </div>
                </div>
              </div>
              
              <button 
                onClick={onLogout}
                className="mt-4 text-xs font-bold text-gray-300 hover:text-red-400 flex items-center gap-1 transition-colors ml-auto"
              >
                Log Out <LogOut size={12} />
              </button>
            </div>

            {/* Menu Items */}
            <div className="flex-1 py-4">
              <ul className="space-y-1">
                <li>
                  <button 
                    onClick={() => handleNavigation('order-history')}
                    className="w-full flex items-center gap-4 px-6 py-4 text-white hover:bg-white/5 transition-colors group text-left"
                  >
                    <ShoppingBag size={20} className="text-purple-400 group-hover:text-cyan-400 transition-colors" />
                    <span className="font-bold text-sm tracking-wide">Order History</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('account-settings')}
                    className="w-full flex items-center gap-4 px-6 py-4 text-white hover:bg-white/5 transition-colors group text-left"
                  >
                    <Settings size={20} className="text-purple-400 group-hover:text-cyan-400 transition-colors" />
                    <span className="font-bold text-sm tracking-wide">Account Setting</span>
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('favorites')}
                    className="w-full flex items-center gap-4 px-6 py-4 text-white hover:bg-white/5 transition-colors group text-left"
                  >
                    <Heart size={20} className="text-purple-400 group-hover:text-cyan-400 transition-colors" />
                    <span className="font-bold text-sm tracking-wide">Favorites</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Bottom Decoration */}
            <div className="p-6">
                <div className="w-full h-32 rounded-xl bg-gradient-to-br from-purple-900/50 to-blue-900/50 border border-white/10 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                    <div className="text-center z-10">
                        <p className="text-cyan-400 font-bold brand-font text-xl">PRO MEMBER</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Upgrade Now</p>
                    </div>
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AccountSidebar;
