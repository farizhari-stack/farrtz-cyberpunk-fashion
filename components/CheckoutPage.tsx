
import React, { useState, useRef } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, ArrowLeft, Tag, Plus, CheckCircle, CreditCard, Banknote, Upload, Copy, Edit2, AlertTriangle, Loader } from 'lucide-react';
import { PageType, CartItem, User, Order, Coupon } from '../types';
import { authService } from '../services/auth';
import { calculateDiscount } from '../utils/couponUtils';

const motion = framerMotion as any;

interface CheckoutPageProps {
    onNavigate: (page: PageType) => void;
    cartItems: CartItem[];
    user: User | null;
    onClearCart: () => void;
    appliedCoupon?: Coupon | null;
    onIncrementCouponUsage?: (couponId: string, userId: string) => void;  // ADD THIS
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate, cartItems, user, onClearCart, appliedCoupon, onIncrementCouponUsage }) => {
    console.log('🔍 CheckoutPage rendered:', { cartItems, user, appliedCoupon });

    // Checkout State
    const [step, setStep] = useState(1); // 1 = Shipping Info, 2 = Payment
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Form Data State
    const [formData, setFormData] = useState({
        email: user?.email || '',
        phone: '',
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        address: '',
        city: '',
        district: '', // Kabupaten
        subdistrict: '', // Kecamatan
        zipCode: ''
    });

    // Payment State
    const [shippingMethod, setShippingMethod] = useState('standard');
    const [saveInfo, setSaveInfo] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'bank' | 'cod'>('bank');
    const [selectedBank, setSelectedBank] = useState('bca');
    const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
    const [paymentProofUrl, setPaymentProofUrl] = useState<string>(''); // For preview and saving
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculations
    const selectedItems = cartItems.filter(item => item.selected);

    // Calculate Gross Subtotal (Using Original Price if available, otherwise regular price)
    const grossSubtotal = selectedItems.reduce((acc, item) => {
        const itemPrice = (item.isSale && item.originalPrice) ? item.originalPrice : item.price;
        return acc + (itemPrice * item.quantity);
    }, 0);

    // Calculate Savings (Discount)
    const totalSavings = selectedItems.reduce((acc, item) => {
        if (item.isSale && item.originalPrice && item.originalPrice > item.price) {
            return acc + ((item.originalPrice - item.price) * item.quantity);
        }
        return acc;
    }, 0);

    let shippingCost = 25000;
    if (shippingMethod === 'regular') shippingCost = 35000;
    if (shippingMethod === 'express') shippingCost = 50000;

    const tax = 2000;

    // Coupon discount calculation with safe checks
    let couponDiscount = 0;
    try {
        if (appliedCoupon && appliedCoupon.discountPercent) {
            couponDiscount = calculateDiscount(grossSubtotal - totalSavings, appliedCoupon);
        }
    } catch (error) {
        console.error('Error calculating coupon discount:', error);
        couponDiscount = 0;
    }

    // Net Total to Pay
    const total = grossSubtotal - totalSavings - couponDiscount + shippingCost + tax;

    // Handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError(''); // Clear error on type
    };

    const validateShippingForm = () => {
        const requiredFields = ['email', 'phone', 'firstName', 'lastName', 'address', 'city', 'district', 'subdistrict', 'zipCode'];
        for (const field of requiredFields) {
            if (!formData[field as keyof typeof formData]) {
                return false;
            }
        }
        return true;
    };

    const handleContinueToPayment = () => {
        if (!validateShippingForm()) {
            setError('Please fill in all shipping details before continuing.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setStep(2);
    };

    const handleEditShipping = () => {
        setStep(1);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPaymentProofFile(file);

            // Create Base64 string immediately
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentProofUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePlaceOrder = async () => {
        // Validation
        if (paymentMethod === 'bank' && !paymentProofFile) {
            alert("Please upload payment proof first.");
            return;
        }

        setIsProcessing(true);

        // Create Order Object
        const newOrder: Order = {
            id: `ORD-${Date.now()}`,
            userId: user?.id || 'guest',
            items: selectedItems,
            shippingDetails: {
                ...formData,
                method: shippingMethod,
            },
            totalAmount: Math.max(0, total),
            status: 'pending', // Default starting status
            date: new Date().toISOString(),
            paymentMethod: paymentMethod,
            paymentProofUrl: paymentMethod === 'bank' ? paymentProofUrl : undefined
        };

        // Save to Simulated Database
        const result = await authService.createOrder(newOrder);

        setIsProcessing(false);
        if (result.success) {
            // Increment coupon usage if coupon was applied
            if (appliedCoupon && user && onIncrementCouponUsage) {
                onIncrementCouponUsage(appliedCoupon.id, user.id);
                console.log('✅ Coupon usage incremented:', appliedCoupon.code);
            }

            setShowSuccessModal(true);
        } else {
            alert("Failed to place order. Please try again.");
        }
    };

    const handleFinish = () => {
        setShowSuccessModal(false);
        onClearCart();
        onNavigate('home');
    };

    const handleViewHistory = () => {
        setShowSuccessModal(false);
        onClearCart();
        onNavigate('order-history');
    };

    // Bank Data
    const banks = [
        { id: 'bca', name: 'BCA', number: '8830-1234-5678', holder: 'PT FARRTZ INDO', color: 'bg-blue-600' },
        { id: 'mandiri', name: 'Mandiri', number: '123-00-9876543-2', holder: 'PT FARRTZ INDO', color: 'bg-yellow-600' },
        { id: 'bri', name: 'BRI', number: '0341-01-001234-50-1', holder: 'PT FARRTZ INDO', color: 'bg-blue-700' },
        { id: 'bni', name: 'BNI', number: '098-765-4321', holder: 'PT FARRTZ INDO', color: 'bg-orange-600' },
    ];

    const currentBank = banks.find(b => b.id === selectedBank);
    const firstItem = selectedItems.length > 0 ? selectedItems[0] : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#2e1065] to-[#0f0c29] text-white font-sans selection:bg-purple-500 selection:text-white flex flex-col relative">

            {/* Success Modal */}
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[32px] p-10 max-w-[500px] w-full text-center text-black relative shadow-2xl"
                        >
                            <h2 className="text-4xl font-extrabold mb-2 tracking-tight">Succesful</h2>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-8">
                                Congrats your Order succes.<br />Check History order
                            </p>

                            {/* Product Preview Card in Modal */}
                            {firstItem && (
                                <div className="flex items-start gap-4 mb-8 bg-gray-50 p-4 rounded-xl text-left border border-gray-100 shadow-inner">
                                    <div className="w-20 h-20 bg-black rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                                        <img src={firstItem.imageUrl} alt={firstItem.title} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm mb-1 leading-tight">{firstItem.title}</h3>
                                        <div className="text-[10px] text-gray-500 space-y-0.5 font-medium">
                                            <p>• Fit: Male Fit</p>
                                            <p>• Style: Classic T-Shirt</p>
                                            <p>• Size: {firstItem.details.size || 'M'}</p>
                                            <p>• Color: {firstItem.details.color || 'Black'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="w-full h-px bg-gray-200 mb-6"></div>

                            <div className="flex justify-between items-center mb-8 px-2">
                                <span className="font-bold text-xl">Total Order</span>
                                <span className="font-bold text-xl font-mono">Rp. {Math.max(0, total).toLocaleString()}</span>
                            </div>

                            <button
                                onClick={handleFinish}
                                className="w-full py-4 bg-[#4f1bf7] hover:bg-[#3f15c5] text-white font-bold text-lg rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                            >
                                Confirm
                            </button>

                            <div className="mt-6">
                                <span className="text-sm font-bold text-gray-800">Cek order </span>
                                <button onClick={handleViewHistory} className="text-sm font-bold text-[#4f1bf7] hover:underline">history</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="py-6 px-8 border-b border-white/10 flex items-center gap-4 bg-[#1a0b2e]/50 backdrop-blur-md sticky top-0 z-40">
                <button onClick={() => onNavigate('home')} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <Menu className="text-white" />
                </button>
                <div className="flex items-center gap-2">
                    <span className="font-bold text-xl brand-font">Checkout</span>
                    <span className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-black font-bold text-xs">🦊</span>
                    <span className="font-black brand-font italic">FARRTZ</span>
                </div>

                {/* Steps Indicator */}
                <div className="ml-auto hidden sm:flex items-center gap-4 text-sm font-bold tech-font">
                    <div className={`flex items-center gap-2 ${step === 1 ? 'text-cyan-400' : 'text-gray-500'}`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${step === 1 ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-gray-600'}`}>1</div>
                        <span>Shipping</span>
                    </div>
                    <div className="w-8 h-[2px] bg-gray-700"></div>
                    <div className={`flex items-center gap-2 ${step === 2 ? 'text-cyan-400' : 'text-gray-500'}`}>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${step === 2 ? 'border-cyan-400 bg-cyan-400 text-black' : 'border-gray-600'}`}>2</div>
                        <span>Payment</span>
                    </div>
                </div>
            </header>

            <div className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-12 flex flex-col lg:flex-row gap-12">

                {/* Left Column: Form / Payment */}
                <div className="w-full lg:w-3/5 space-y-8">

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-xl flex items-center gap-3">
                            <AlertTriangle size={20} />
                            <span className="font-bold text-sm">{error}</span>
                        </div>
                    )}

                    {/* STEP 1: SHIPPING INFORMATION */}
                    {step === 1 && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            {/* Contact Info */}
                            <section>
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-cyan-400 brand-font">
                                    Contact Info
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Email Address *</label>
                                        <input
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            type="email"
                                            className="w-full bg-white text-black rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500 shadow-lg placeholder:text-gray-400"
                                            placeholder="example@email.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Phone Number *</label>
                                        <input
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            type="tel"
                                            className="w-full bg-white text-black rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500 shadow-lg placeholder:text-gray-400"
                                            placeholder="+62 ..."
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full"></div>

                            {/* Shipping Address */}
                            <section>
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-cyan-400 brand-font">
                                    Shipping Address
                                </h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">First Name *</label>
                                        <input
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full bg-white text-black rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Last Name *</label>
                                        <input
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full bg-white text-black rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
                                        />
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="block text-xs font-medium text-gray-300 mb-1">Address Line 1 *</label>
                                    <input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        type="text"
                                        className="w-full bg-white text-black rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
                                        placeholder="Street address, P.O. box"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Kota *</label>
                                        <input
                                            name="city"
                                            value={formData.city}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full bg-white text-black rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Kabupaten *</label>
                                        <input
                                            name="district"
                                            value={formData.district}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full bg-white text-black rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Kecamatan *</label>
                                        <input
                                            name="subdistrict"
                                            value={formData.subdistrict}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full bg-white text-black rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Kode Pos *</label>
                                        <input
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleInputChange}
                                            type="text"
                                            className="w-full bg-white text-black rounded-xl px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500 shadow-lg"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-2">
                                    <button
                                        onClick={() => setSaveInfo(!saveInfo)}
                                        className={`w-5 h-5 rounded bg-white flex items-center justify-center transition-colors ${saveInfo ? 'bg-purple-500' : ''}`}
                                    >
                                        {saveInfo && <div className="w-3 h-3 bg-purple-600 rounded-sm"></div>}
                                    </button>
                                    <span className="text-sm text-gray-300">Save my shipping address for next time.</span>
                                </div>
                            </section>

                            <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent w-full"></div>

                            {/* Shipping Method */}
                            <section>
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-cyan-400 brand-font">
                                    Shipping Method
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { id: 'standard', label: 'Standard', sub: '6-8 Hari', price: 'Rp. 25.000' },
                                        { id: 'regular', label: 'Reguler', sub: '4-5 Hari', price: 'Rp. 35.000' },
                                        { id: 'express', label: 'Express', sub: '2-3 Hari', price: 'Rp. 50.000' },
                                    ].map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={() => setShippingMethod(method.id)}
                                            className={`bg-white rounded-xl p-4 flex items-center justify-between cursor-pointer transition-transform hover:scale-[1.01] shadow-lg ${shippingMethod === method.id ? 'ring-2 ring-purple-500 scale-[1.01]' : 'opacity-90 hover:opacity-100'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center`}>
                                                    {shippingMethod === method.id && <div className="w-3 h-3 bg-purple-600 rounded-full"></div>}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{method.label}</p>
                                                    <p className="text-[10px] text-gray-500">{method.sub}</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-gray-900 text-sm">{method.price}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <button
                                onClick={handleContinueToPayment}
                                className="w-full py-4 bg-[#2b35bc] hover:bg-[#1e258a] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(43,53,188,0.4)] transition-all mt-6 uppercase tracking-wider flex items-center justify-center gap-2 group"
                            >
                                Continue Payment <ArrowLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={20} />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: PAYMENT */}
                    {step === 2 && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-8"
                        >
                            {/* Information Summary */}
                            <div className="bg-[#1a0b2e] border border-white/10 rounded-2xl p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-gray-400 text-xs font-bold uppercase tracking-widest">Ship To</h3>
                                    <button
                                        onClick={handleEditShipping}
                                        className="text-cyan-400 text-xs flex items-center gap-1 hover:text-white transition-colors"
                                    >
                                        <Edit2 size={12} /> Edit
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-white font-bold text-lg">{formData.firstName} {formData.lastName}</p>
                                    <p className="text-gray-300 text-sm">{formData.address}</p>
                                    <p className="text-gray-300 text-sm">{formData.city}, {formData.district}, {formData.zipCode}</p>
                                    <div className="pt-2 mt-2 border-t border-white/5 flex gap-4 text-xs text-gray-500">
                                        <span>{formData.email}</span>
                                        <span>•</span>
                                        <span>{formData.phone}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method Selection */}
                            <section>
                                <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-cyan-400 brand-font">
                                    Metode Pembayaran
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setPaymentMethod('bank')}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'bank'
                                            ? 'bg-purple-900/50 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                            : 'bg-[#1a1a2e] border-white/10 hover:bg-[#252540]'
                                            }`}
                                    >
                                        <CreditCard size={32} className={paymentMethod === 'bank' ? 'text-purple-400' : 'text-gray-400'} />
                                        <span className={`font-bold ${paymentMethod === 'bank' ? 'text-white' : 'text-gray-400'}`}>Bank Transfer</span>
                                    </button>

                                    <button
                                        onClick={() => setPaymentMethod('cod')}
                                        className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${paymentMethod === 'cod'
                                            ? 'bg-purple-900/50 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                                            : 'bg-[#1a1a2e] border-white/10 hover:bg-[#252540]'
                                            }`}
                                    >
                                        <Banknote size={32} className={paymentMethod === 'cod' ? 'text-purple-400' : 'text-gray-400'} />
                                        <span className={`font-bold ${paymentMethod === 'cod' ? 'text-white' : 'text-gray-400'}`}>COD</span>
                                    </button>
                                </div>
                            </section>

                            {/* Bank Selection & Details */}
                            <AnimatePresence mode="wait">
                                {paymentMethod === 'bank' && (
                                    <motion.div
                                        key="bank-details"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-6 overflow-hidden"
                                    >
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-3 uppercase tracking-wider">Choose Bank</label>
                                            <div className="space-y-2">
                                                {banks.map((bank) => (
                                                    <div
                                                        key={bank.id}
                                                        onClick={() => setSelectedBank(bank.id)}
                                                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border transition-all ${selectedBank === bank.id
                                                            ? 'bg-white border-white'
                                                            : 'bg-[#1a1a2e] border-white/10 hover:border-gray-500'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center`}>
                                                                {selectedBank === bank.id && <div className="w-2.5 h-2.5 bg-black rounded-full"></div>}
                                                            </div>
                                                            <span className={`font-bold ${selectedBank === bank.id ? 'text-black' : 'text-white'}`}>{bank.name}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bank Account Display */}
                                        {currentBank && (
                                            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-white/10 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                    <CreditCard size={100} />
                                                </div>
                                                <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Transfer Destination</p>
                                                <h4 className="text-white font-bold text-lg mb-4">{currentBank.name} Virtual Account</h4>

                                                <div className="bg-black/50 rounded-lg p-4 flex items-center justify-between border border-white/10">
                                                    <div>
                                                        <p className="text-2xl font-mono text-cyan-400 tracking-wider font-bold">{currentBank.number}</p>
                                                        <p className="text-xs text-gray-400 mt-1">a.n {currentBank.holder}</p>
                                                    </div>
                                                    <button className="text-gray-400 hover:text-white transition-colors" title="Copy">
                                                        <Copy size={20} />
                                                    </button>
                                                </div>

                                                <div className="mt-4 flex gap-2 text-xs text-orange-400 items-center bg-orange-900/20 p-2 rounded">
                                                    <Tag size={12} />
                                                    <span>Important: Transfer exact amount to verify automatically.</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Payment Proof Upload */}
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-3 uppercase tracking-wider">Bukti Pembayaran</label>
                                            <div
                                                onClick={() => fileInputRef.current?.click()}
                                                className="border-2 border-dashed border-gray-600 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-cyan-400 hover:bg-cyan-900/10 transition-all group"
                                            >
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileUpload}
                                                    className="hidden"
                                                    accept="image/*"
                                                />
                                                {paymentProofFile ? (
                                                    <div className="flex items-center gap-3 text-cyan-400">
                                                        <CheckCircle size={24} />
                                                        <span className="font-bold">{paymentProofFile.name}</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload size={32} className="text-gray-400 group-hover:text-cyan-400 mb-2 transition-colors" />
                                                        <p className="text-gray-400 text-sm font-medium">Click to upload image</p>
                                                        <p className="text-gray-600 text-xs mt-1">JPG, PNG, PDF (Max 5MB)</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {paymentMethod === 'cod' && (
                                    <motion.div
                                        key="cod-info"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-gray-800/50 p-4 rounded-xl border border-white/10"
                                    >
                                        <p className="text-sm text-gray-300">
                                            Pay securely with Cash on Delivery. Prepare the exact amount for the courier upon arrival.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={isProcessing}
                                className={`w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all mt-6 uppercase tracking-wider text-lg flex items-center justify-center gap-2 ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader className="animate-spin" size={24} /> Processing...
                                    </>
                                ) : (
                                    'Place Order'
                                )}
                            </button>

                            <button
                                onClick={() => setStep(1)}
                                className="w-full py-2 text-gray-400 text-sm hover:text-white underline"
                            >
                                Back to Information
                            </button>
                        </motion.div>
                    )}

                </div>

                {/* Right Column: Order Summary (Sticky) */}
                <div className="w-full lg:w-2/5">
                    <div className="bg-[#1a1a2e]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 lg:p-8 sticky top-32">
                        <h3 className="text-xl font-bold mb-6">Ringkasan Pesanan</h3>

                        <div className="flex items-center gap-2 mb-6">
                            <Plus size={16} className="text-blue-500" />
                            <span className="text-xs text-blue-300 underline cursor-pointer">Apply Coupon or Discount Code</span>
                        </div>

                        <div className="space-y-3 mb-6 border-b border-white/10 pb-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Subtotal ({selectedItems.length} Item)</span>
                                <span className="font-mono">Rp. {grossSubtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Shipping ({shippingMethod})</span>
                                <span className="font-mono">Rp. {shippingCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-300">Estimated Tax</span>
                                <span className="font-mono">Rp. {tax.toLocaleString()}</span>
                            </div>

                            {/* Only show discount row if there are actual savings */}
                            {totalSavings > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-300">Diskon</span>
                                    <span className="font-mono text-green-400">- Rp. {totalSavings.toLocaleString()}</span>
                                </div>
                            )}

                            {/* Coupon Discount */}
                            {appliedCoupon && (
                                <div className="flex justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <Tag size={14} className="text-green-400" />
                                        <span className="text-green-400 font-bold">Coupon ({appliedCoupon.code})</span>
                                    </div>
                                    <span className="font-mono text-green-400">- Rp. {couponDiscount.toLocaleString()}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between text-lg font-bold mb-8">
                            <span>Total</span>
                            <span className="text-cyan-400">Rp. {Math.max(0, total).toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <ShoppingCart size={16} className="text-gray-400" />
                            <span className="text-xs text-gray-400">Cart ({selectedItems.length} Item)</span>
                        </div>

                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {selectedItems.map((item) => (
                                <div key={item.id} className="flex gap-4 bg-white rounded-xl p-3">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <img src={item.imageUrl} alt={item.title} className="w-12 h-12 object-contain" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-900 font-bold text-xs line-clamp-2 leading-tight mb-1">{item.title}</p>
                                        <div className="text-[10px] text-gray-500 space-y-0.5">
                                            <p>• Size: {item.details.size || 'N/A'}</p>
                                            <p>• Color: {item.details.color || 'N/A'}</p>
                                            <p className="font-bold text-gray-900 mt-1">{item.quantity} x Rp. {item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default CheckoutPage;
