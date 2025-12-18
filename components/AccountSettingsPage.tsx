
import React, { useState, useRef } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { Camera, Save, CheckCircle, ArrowLeft } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import AccountSidebar from './AccountSidebar';
import { PageType, User } from '../types';
import { authService } from '../services/auth';

const motion = framerMotion as any;

interface AccountSettingsPageProps {
  onNavigate: (page: PageType) => void;
  user: User | null;
  setUser: (user: User) => void;
  onLogout: () => void;
  cartItemCount: number;
  onSearch?: (query: string) => void;
}

const AccountSettingsPage: React.FC<AccountSettingsPageProps> = ({ onNavigate, user, setUser, onLogout, cartItemCount, onSearch }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    address: user?.address || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsLoading(true);
    
    const updatedUser: User = {
        ...user,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        email: formData.email,
        avatar: formData.avatar
    };

    const result = await authService.updateUser(updatedUser);
    
    setIsLoading(false);
    if (result.success && result.user) {
        setUser(result.user);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
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
            
            {/* Breadcrumb-like Header */}
            <div className="w-full h-[1px] bg-gradient-to-r from-purple-500 to-transparent mb-6"></div>
        </motion.div>

        <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-8">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-purple-400">
                    <span role="img" aria-label="settings">⚙️</span>
                </div>
                Account Setting
            </h2>

            <form onSubmit={handleSave} className="relative z-10">
                
                {/* Avatar Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500/30 shadow-[0_0_20px_rgba(124,58,237,0.3)] bg-black">
                            <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={32} />
                        </div>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleFileChange}
                        />
                    </div>
                    <p className="mt-3 text-sm text-gray-400">Click to change profile picture</p>
                </div>

                {/* Fields */}
                <div className="space-y-6 max-w-3xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">First Name *</label>
                            <input 
                                type="text"
                                name="firstName" 
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Last Name *</label>
                            <input 
                                type="text"
                                name="lastName" 
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Kota/Alamat</label>
                        <input 
                            type="text"
                            name="address" 
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Medan, Jl. Gatot Subroto No. 123"
                            className="w-full bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Email</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-white text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-inner"
                        />
                    </div>

                    <div className="pt-6">
                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3 bg-[#3b35b6] hover:bg-[#2e2996] text-white font-bold rounded-xl shadow-lg shadow-purple-900/50 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Saving...' : (
                                <>
                                    <Save size={18} /> Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
            
            {/* Decorative Background */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        {/* Success Modal Popup */}
        <AnimatePresence>
            {showSuccess && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-white rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl max-w-sm mx-4"
                    >
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircle size={40} className="text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
                        <p className="text-gray-500">Your profile has been updated successfully.</p>
                        <button 
                            onClick={() => setShowSuccess(false)}
                            className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-lg font-bold hover:bg-black transition-colors"
                        >
                            Close
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

      </div>
      <Footer />
    </div>
  );
};

export default AccountSettingsPage;
