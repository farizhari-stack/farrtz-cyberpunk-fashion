
import React, { useState } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { Minus, Plus, Check, Tag, AlertCircle } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import { PageType, CartItem, User, Coupon } from '../types';
import { calculateDiscount } from '../utils/couponUtils';

const motion = framerMotion as any;

interface CartPageProps {
    onNavigate: (page: PageType) => void;
    onAccountClick: () => void;
    cartItems: CartItem[];
    setCartItems: (items: CartItem[]) => void;
    user: User | null;
    onSearch?: (query: string) => void;
    appliedCoupon?: Coupon | null;
    onApplyCoupon?: (code: string, userId?: string) => { success: boolean; message: string; coupon?: Coupon };
    onRemoveCoupon?: () => void;
}

const CartPage: React.FC<CartPageProps> = ({ onNavigate, onAccountClick, cartItems, setCartItems, user, onSearch, appliedCoupon, onApplyCoupon, onRemoveCoupon }) => {
    const [showLoginAlert, setShowLoginAlert] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [couponError, setCouponError] = useState('');
    const [couponSuccess, setCouponSuccess] = useState('');

    const toggleSelection = (id: number) => {
        setCartItems(cartItems.map(item =>
            item.id === id ? { ...item, selected: !item.selected } : item
        ));
    };

    const updateQuantity = (id: number, delta: number) => {
        setCartItems(cartItems.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeItem = (id: number) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const handleCheckout = () => {
        if (!user) {
            setShowLoginAlert(true);
            setTimeout(() => setShowLoginAlert(false), 3000);
            // Optional: immediately redirect or just show alert
            // onNavigate('login'); 
        } else {
            onNavigate('checkout');
        }
    };

    const selectedItems = cartItems.filter(item => item.selected);
    const subtotal = selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const discount = appliedCoupon ? calculateDiscount(subtotal, appliedCoupon) : 0;
    const estimatedTotal = subtotal - discount;
    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    const handleApplyCoupon = () => {
        if (!onApplyCoupon) return;

        setCouponError('');
        setCouponSuccess('');

        const result = onApplyCoupon(couponCode, user?.id);

        if (result.success) {
            setCouponSuccess(result.message);
            setTimeout(() => setCouponSuccess(''), 3000);
            setCouponCode('');
        } else {
            setCouponError(result.message);
            setTimeout(() => setCouponError(''), 3000);
        }
    };

    const handleRemoveCoupon = () => {
        if (onRemoveCoupon) {
            onRemoveCoupon();
            setCouponSuccess('');
            setCouponError('');
            setCouponCode('');
        }
    };

    return (
        <div className="min-h-screen bg-[#2e1065] text-white font-sans selection:bg-purple-500 selection:text-white flex flex-col">
            <Navbar
                onAccountClick={onAccountClick}
                onHomeClick={() => onNavigate('home')}
                onCartClick={() => { }}
                cartItemCount={totalItems}
                onSearch={onSearch}
            />

            {/* Login Alert Toast */}
            {showLoginAlert && (
                <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-bounce">
                    <AlertCircle size={20} />
                    <span className="font-bold">Please login to checkout!</span>
                    <button onClick={() => onNavigate('login')} className="bg-white text-red-600 px-3 py-1 rounded-full text-xs font-bold ml-2">Login Now</button>
                </div>
            )}

            <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">

                {/* Header */}
                <div className="flex items-baseline gap-2 mb-8">
                    <h1 className="text-4xl font-bold brand-font">Cart</h1>
                    <span className="text-gray-400 tech-font">({cartItems.length} item)</span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Left Column: Cart Items */}
                    <div className="w-full lg:w-2/3 space-y-6">
                        {cartItems.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-3xl p-6 text-black relative flex gap-6 shadow-xl"
                            >
                                {/* Checkbox */}
                                <div className="flex items-center">
                                    <button
                                        onClick={() => toggleSelection(item.id)}
                                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${item.selected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                                            }`}
                                    >
                                        {item.selected && <Check size={14} className="text-white" />}
                                    </button>
                                </div>

                                {/* Image */}
                                <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                                    {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.title} className="w-4/5 h-4/5 object-contain" />
                                    ) : (
                                        <div className="text-xs text-gray-400 text-center">No Image</div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="font-bold text-lg leading-tight text-gray-900">{item.title}</h3>
                                            <div className="text-right">
                                                <div className="text-right font-bold text-lg whitespace-nowrap">Rp. {item.price.toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div className="mt-2 space-y-1">
                                            {Object.entries(item.details).map(([key, value]) => (
                                                <p key={key} className="text-xs text-gray-500 capitalize">
                                                    <span className="text-gray-400">• </span>{key}: <span className="text-gray-700 font-medium">{value}</span>
                                                </p>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end mt-4">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-xs text-purple-600 hover:text-purple-800 font-bold underline"
                                        >
                                            Remove
                                        </button>

                                        {/* Quantity Update Pill */}
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Update</span>
                                            <div className="flex items-center bg-[#2e1065] rounded-full px-2 py-1 text-white gap-3">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-cyan-400 transition-colors">
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-cyan-400 transition-colors">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {cartItems.length === 0 && (
                            <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                                <p className="text-gray-400 tech-font">Your cart is empty.</p>
                                <button onClick={() => onNavigate('home')} className="mt-4 text-cyan-400 font-bold hover:underline">Start Shopping</button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-3xl p-6 text-black shadow-xl sticky top-24">
                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-gray-600">Subtotal ({selectedItems.reduce((acc, i) => acc + i.quantity, 0)} item)</span>
                                    <span>Rp. {subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Estimated Total</span>
                                    <span>Rp. {estimatedTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0}
                                className={`w-full py-4 bg-gradient-to-r from-blue-700 to-purple-700 text-white font-bold rounded-xl shadow-lg transition-all mb-4 ${cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-600 hover:to-purple-600 active:scale-95'
                                    }`}
                            >
                                {user ? 'Checkout' : 'Login to Checkout'}
                            </button>

                            {/* Coupon Section */}
                            <div className="border-t border-gray-200 pt-4 mb-4">
                                {!appliedCoupon ? (
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700">
                                            <Tag className="inline mr-2" size={14} />
                                            Have a coupon?
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                placeholder="Enter coupon code"
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
                                            />
                                            <button
                                                onClick={handleApplyCoupon}
                                                disabled={!couponCode.trim()}
                                                className="px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                Apply
                                            </button>
                                        </div>
                                        {couponError && (
                                            <p className="text-xs text-red-600 flex items-center gap-1">
                                                <AlertCircle size={12} />
                                                {couponError}
                                            </p>
                                        )}
                                        {couponSuccess && (
                                            <p className="text-xs text-green-600 flex items-center gap-1">
                                                <Check size={12} />
                                                {couponSuccess}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <Tag size={16} className="text-green-600" />
                                            <div>
                                                <p className="text-sm font-bold text-green-800">{appliedCoupon.code}</p>
                                                <p className="text-xs text-green-600">-{appliedCoupon.discountPercent}% discount applied</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleRemoveCoupon}
                                            className="text-xs text-red-600 hover:text-red-800 font-bold underline"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Price Summary */}
                            <div className="space-y-2 mb-6">
                                {appliedCoupon && (
                                    <>
                                        <div className="flex justify-between items-center text-sm font-medium">
                                            <span className="text-gray-600">Subtotal ({selectedItems.reduce((acc, i) => acc + i.quantity, 0)} item)</span>
                                            <span>Rp. {subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm font-medium text-green-600">
                                            <span>Discount ({appliedCoupon.discountPercent}%)</span>
                                            <span>-Rp. {discount.toLocaleString()}</span>
                                        </div>
                                        <div className="border-t border-gray-200 pt-2"></div>
                                    </>
                                )}
                                {!appliedCoupon && (
                                    <div className="flex justify-between items-center text-sm font-medium">
                                        <span className="text-gray-600">Subtotal ({selectedItems.reduce((acc, i) => acc + i.quantity, 0)} item)</span>
                                        <span>Rp. {subtotal.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Estimated Total</span>
                                    <span className="text-purple-700">Rp. {estimatedTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

            </main>

            <Footer />
        </div>
    );
};

export default CartPage;
