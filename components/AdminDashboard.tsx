
import React, { useState, useEffect, useRef } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ShoppingBag, Package, Users, Settings, LogOut,
    TrendingUp, DollarSign, Clock, CheckCircle, Search, Plus, Edit3, Trash2, X, Upload,
    Calendar, CreditCard, ChevronDown, Filter, Truck, Box, Eye, Zap, Image as ImageIcon, MessageSquare, Ticket, Link
} from 'lucide-react';
import { User, Order, Product, PageType, Feedback, ChatConversation, Coupon } from '../types';
import { authService } from '../services/auth';
import { productService } from '../services/productService';
import AdminFeedbackChat from './AdminFeedbackChat';
import AdminCouponManager from './AdminCouponManager';

const motion = framerMotion as any;

interface AdminDashboardProps {
    user: User;
    onLogout: () => void;
    onNavigate: (page: PageType) => void;
    feedbacks?: Feedback[];
    conversations?: ChatConversation[];
    coupons?: Coupon[];
    onUpdateFeedbackStatus?: (feedbackId: string, status: Feedback['status']) => void;
    onSendMessage?: (userId: string, message: string) => void;
    onCreateCoupon?: (coupon: Omit<Coupon, 'id' | 'createdDate' | 'usageCount'>) => void;
    onToggleCouponStatus?: (couponId: string) => void;
    onDeleteCoupon?: (couponId: string) => void;
}

type Tab = 'overview' | 'orders' | 'products' | 'finance' | 'flash-sale' | 'feedback-chat' | 'coupons';
type TimeFilter = 'today' | 'week' | 'month' | 'all';

const AdminDashboard: React.FC<AdminDashboardProps> = ({
    user,
    onLogout,
    onNavigate,
    feedbacks = [],
    conversations = [],
    coupons = [],
    onUpdateFeedbackStatus = () => { },
    onSendMessage = () => { },
    onCreateCoupon = () => { },
    onToggleCouponStatus = () => { },
    onDeleteCoupon = () => { },
}) => {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);


    // Stats
    const [stats, setStats] = useState({ revenue: 0, totalOrders: 0, pending: 0, totalProducts: 0 });

    // Product Modal State
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    // Payment Proof Modal
    const [showProofModal, setShowProofModal] = useState(false);
    const [selectedProofUrl, setSelectedProofUrl] = useState<string>('');

    // Form States for Product Logic
    const [productImageFile, setProductImageFile] = useState<string>('');
    const [isDiscounted, setIsDiscounted] = useState(false);
    const [basePrice, setBasePrice] = useState<number>(0);
    const [discountPercent, setDiscountPercent] = useState<number>(0);
    const [imageInputMode, setImageInputMode] = useState<'upload' | 'url'>('upload');
    const [imageUrl, setImageUrl] = useState<string>('');

    // Load Data
    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setLoading(true);
        const allOrders = authService.getAllOrders();
        const allProducts = productService.getAllProducts();

        setOrders(allOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setProducts(allProducts);

        // Calc Stats
        const revenue = allOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const pending = allOrders.filter(o => o.status === 'pending' || o.status === 'confirmed' || o.status === 'packing').length;

        setStats({
            revenue,
            totalOrders: allOrders.length,
            pending,
            totalProducts: allProducts.length
        });
        setLoading(false);
    };

    // --- ORDER WORKFLOW LOGIC ---
    const handleStatusUpdate = async (orderId: string, currentStatus: Order['status']) => {
        let nextStatus: Order['status'] | null = null;

        // Defined Workflow
        switch (currentStatus) {
            case 'pending':
                nextStatus = 'confirmed'; // Admin accepts order
                break;
            case 'confirmed':
                nextStatus = 'packing'; // Admin starts packing
                break;
            case 'packing':
                nextStatus = 'shipped'; // Admin hands to courier
                break;
            case 'shipped':
                nextStatus = 'delivered'; // Delivered to user
                break;
            default:
                nextStatus = null;
        }

        if (nextStatus) {
            await authService.updateOrderStatus(orderId, nextStatus);
            loadData(); // Realtime refresh for Admin View
        }
    };

    const handleDeleteProduct = (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            productService.deleteProduct(id);
            loadData();
        }
    };

    const handleOpenProof = (url: string) => {
        setSelectedProofUrl(url);
        setShowProofModal(true);
    };

    // --- PRODUCT IMAGE HANDLING ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductImageFile(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleOpenProductModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setProductImageFile(product.imageUrl);
            setBasePrice(product.originalPrice || product.price);
            setIsDiscounted(!!product.isSale);
            setDiscountPercent(product.discountPercentage || 0);
            // Detect if existing image is a URL or base64
            if (product.imageUrl && !product.imageUrl.startsWith('data:')) {
                setImageInputMode('url');
                setImageUrl(product.imageUrl);
            } else {
                setImageInputMode('upload');
                setImageUrl('');
            }
        } else {
            setEditingProduct(null);
            setProductImageFile('');
            setBasePrice(0);
            setIsDiscounted(false);
            setDiscountPercent(0);
            setImageInputMode('upload');
            setImageUrl('');
        }
        setShowProductModal(true);
    };

    const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Calculate Final Price Logic
        const originalPrice = Number(formData.get('originalPrice'));
        let finalPrice = originalPrice;
        let discount = 0;

        if (isDiscounted) {
            discount = Number(formData.get('discountPercentage'));
            finalPrice = originalPrice - (originalPrice * (discount / 100));
        }

        // Determine which image source to use
        const finalImageUrl = imageInputMode === 'url' ? imageUrl : productImageFile;

        const newProduct: Product = {
            id: editingProduct ? editingProduct.id : Date.now(),
            title: formData.get('title') as string,
            price: finalPrice,
            originalPrice: originalPrice,
            discountPercentage: isDiscounted ? discount : 0,
            category: formData.get('category') as string,
            imageUrl: finalImageUrl, // Use URL or Base64 string depending on mode
            description: formData.get('description') as string || '', // Add description
            isSale: isDiscounted,
            isNew: formData.get('isNew') === 'on',
            // Preserve discountEndTime if it exists and we're just editing
            discountEndTime: editingProduct?.discountEndTime
        };

        productService.saveProduct(newProduct);
        setShowProductModal(false);
        setEditingProduct(null);
        loadData();
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans flex overflow-hidden">

            {/* Sidebar */}
            <motion.aside
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                className="w-64 bg-[#0a0a0a] border-r border-white/5 flex flex-col z-20"
            >
                {/* Brand */}
                <div className="h-20 flex items-center gap-3 px-6 border-b border-white/5">
                    <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center text-black font-bold">
                        A
                    </div>
                    <span className="text-xl font-bold brand-font tracking-wider">ADMIN</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {[
                        { id: 'overview', icon: LayoutDashboard, label: 'Overview' },
                        { id: 'finance', icon: DollarSign, label: 'Keuangan' },
                        { id: 'orders', icon: ShoppingBag, label: 'Orders' },
                        { id: 'products', icon: Package, label: 'Products' },
                        { id: 'flash-sale', icon: Zap, label: 'Flash Sale' },
                        { id: 'coupons', icon: Ticket, label: 'Coupons' },
                        { id: 'feedback-chat', icon: MessageSquare, label: 'Feedback & Chat' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as Tab)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === item.id
                                ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(147,51,234,0.15)]'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* User Footer */}
                <div className="p-4 border-t border-white/5">
                    <div className="flex items-center gap-3 mb-4">
                        <img src={user.avatar} alt="Admin" className="w-10 h-10 rounded-full bg-gray-800" />
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-white truncate">System Admin</p>
                            <p className="text-xs text-gray-500 truncate">admin@farrtz.com</p>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="w-full py-2 flex items-center justify-center gap-2 text-red-400 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors text-xs font-bold uppercase tracking-wider"
                    >
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Background Elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none"></div>

                {/* Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-[#050505]/80 backdrop-blur-md sticky top-0 z-10">
                    <h2 className="text-2xl font-bold brand-font capitalize">{activeTab.replace('-', ' ')}</h2>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5 text-xs text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            System Online
                        </div>
                        <button onClick={() => onNavigate('home')} className="text-sm text-gray-400 hover:text-white transition-colors">
                            View Storefront
                        </button>
                    </div>
                </header>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <OverviewTab stats={stats} orders={orders} />
                        )}
                        {activeTab === 'finance' && (
                            <FinanceTab orders={orders} />
                        )}
                        {activeTab === 'orders' && (
                            <OrdersTab orders={orders} onStatusUpdate={handleStatusUpdate} onViewProof={handleOpenProof} />
                        )}
                        {activeTab === 'products' && (
                            <ProductsTab
                                products={products}
                                onDelete={handleDeleteProduct}
                                onEdit={handleOpenProductModal}
                                onAdd={() => handleOpenProductModal()}
                            />
                        )}
                        {activeTab === 'flash-sale' && (
                            <FlashSaleTab
                                products={products}
                                refreshData={loadData}
                            />
                        )}
                        {activeTab === 'coupons' && (
                            <AdminCouponManager
                                coupons={coupons}
                                onCreateCoupon={onCreateCoupon}
                                onToggleStatus={onToggleCouponStatus}
                                onDeleteCoupon={onDeleteCoupon}
                                adminId={user.id}
                            />
                        )}
                        {activeTab === 'feedback-chat' && (
                            <AdminFeedbackChat
                                feedbacks={feedbacks}
                                conversations={conversations}
                                onUpdateFeedbackStatus={onUpdateFeedbackStatus}
                                onSendMessage={onSendMessage}
                            />
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* Payment Proof Modal */}
            <AnimatePresence>
                {showProofModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-2xl w-full"
                        >
                            <button
                                onClick={() => setShowProofModal(false)}
                                className="absolute -top-12 right-0 text-white hover:text-gray-300"
                            >
                                <X size={32} />
                            </button>
                            <img src={selectedProofUrl} alt="Payment Proof" className="w-full h-auto rounded-lg shadow-2xl border border-white/20" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Product Modal */}
            <AnimatePresence>
                {showProductModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#121212] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl my-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                                <button onClick={() => setShowProductModal(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSaveProduct} className="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
                                {/* Image Input Section */}
                                <div className="mb-4">
                                    {/* Toggle Buttons */}
                                    <div className="flex justify-center gap-2 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setImageInputMode('upload')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${imageInputMode === 'upload'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            <Upload size={16} />
                                            Upload File
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setImageInputMode('url')}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${imageInputMode === 'url'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                                }`}
                                        >
                                            <Link size={16} />
                                            Image URL
                                        </button>
                                    </div>

                                    {/* Upload Mode */}
                                    {imageInputMode === 'upload' && (
                                        <div className="flex justify-center">
                                            <label className="cursor-pointer group relative">
                                                <div className="w-32 h-32 rounded-xl bg-gray-800 border-2 border-dashed border-gray-600 flex items-center justify-center overflow-hidden">
                                                    {productImageFile ? (
                                                        <img src={productImageFile} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="text-center">
                                                            <Upload className="mx-auto text-gray-400 mb-1" size={24} />
                                                            <span className="text-[10px] text-gray-400">Upload Image</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                                    <span className="text-xs font-bold">Change</span>
                                                </div>
                                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                            </label>
                                        </div>
                                    )}

                                    {/* URL Mode */}
                                    {imageInputMode === 'url' && (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Image URL</label>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 relative">
                                                        <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                        <input
                                                            type="url"
                                                            value={imageUrl}
                                                            onChange={(e) => setImageUrl(e.target.value)}
                                                            placeholder="https://example.com/image.jpg"
                                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-purple-500 outline-none text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            {/* URL Preview */}
                                            {imageUrl && (
                                                <div className="flex justify-center">
                                                    <div className="w-32 h-32 rounded-xl bg-gray-800 border-2 border-gray-600 flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src={imageUrl}
                                                            alt="URL Preview"
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).style.display = 'none';
                                                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                                            }}
                                                        />
                                                        <div className="hidden text-center p-2">
                                                            <ImageIcon className="mx-auto text-red-400 mb-1" size={24} />
                                                            <span className="text-[10px] text-red-400">Invalid URL</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Product Title</label>
                                    <input name="title" defaultValue={editingProduct?.title} required className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none" />
                                </div>

                                <div>
                                    <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Product Description</label>
                                    <textarea
                                        name="description"
                                        defaultValue={editingProduct?.description || ''}
                                        rows={4}
                                        placeholder="Enter product description, features, specifications..."
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none resize-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Category</label>
                                        <select name="category" defaultValue={editingProduct?.category || 'T-shirt'} className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none">
                                            <option value="T-shirt">T-shirt</option>
                                            <option value="Hoodies">Hoodies</option>
                                            <option value="Hats">Hats</option>
                                            <option value="Bags">Bags</option>
                                            <option value="Tank Tops">Tank Tops</option>
                                            <option value="Shorts">Shorts</option>
                                            <option value="Kids">Kids</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Base Price (Rp)</label>
                                        <input
                                            name="originalPrice"
                                            type="number"
                                            value={basePrice}
                                            onChange={(e) => setBasePrice(Number(e.target.value))}
                                            required
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Basic Discount Checkbox (For quick edits, Flash Sale tab handles advanced) */}
                                {!editingProduct?.discountEndTime && (
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <label className="flex items-center gap-2 cursor-pointer mb-3">
                                            <input
                                                name="isSale"
                                                type="checkbox"
                                                checked={isDiscounted}
                                                onChange={(e) => setIsDiscounted(e.target.checked)}
                                                className="w-4 h-4 accent-purple-500"
                                            />
                                            <span className="text-sm font-bold text-white">Activate Discount</span>
                                        </label>

                                        {isDiscounted && (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Discount Percentage (%)</label>
                                                    <input
                                                        name="discountPercentage"
                                                        type="number"
                                                        min="1" max="99"
                                                        value={discountPercent}
                                                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                                                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-purple-500 outline-none"
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-sm p-2 bg-green-500/10 rounded border border-green-500/20">
                                                    <span className="text-gray-300">Final Price:</span>
                                                    <span className="font-bold text-green-400 font-mono">
                                                        Rp. {(basePrice - (basePrice * (discountPercent / 100))).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input name="isNew" type="checkbox" defaultChecked={editingProduct?.isNew} className="w-4 h-4 accent-purple-500" />
                                        <span className="text-sm">Mark as New Arrival</span>
                                    </label>
                                </div>

                                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors">
                                    {editingProduct ? 'Update Product' : 'Create Product'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )
                }
            </AnimatePresence >
        </div >
    );
};

// --- Sub Components ---

const FlashSaleTab = ({ products, refreshData }: { products: Product[], refreshData: () => void }) => {
    const [selectedProductId, setSelectedProductId] = useState<number | ''>('');
    const [discount, setDiscount] = useState(20);
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('23:59');

    // Filter out products currently on flash sale
    const availableProducts = products.filter(p => !p.discountEndTime);
    const activeFlashSales = products.filter(p => p.isSale && p.discountEndTime);

    const handleAddFlashSale = () => {
        if (!selectedProductId || !endDate || !endTime) {
            alert("Please fill all fields");
            return;
        }

        const product = products.find(p => p.id === Number(selectedProductId));
        if (!product) return;

        const discountTime = new Date(`${endDate}T${endTime}`).toISOString();
        const basePrice = product.originalPrice || product.price;
        const finalPrice = basePrice - (basePrice * (discount / 100));

        const updatedProduct: Product = {
            ...product,
            price: finalPrice,
            originalPrice: basePrice,
            discountPercentage: discount,
            discountEndTime: discountTime,
            isSale: true
        };

        productService.saveProduct(updatedProduct);
        refreshData();
        setSelectedProductId('');
        setEndDate('');
    };

    const handleStopSale = (product: Product) => {
        const updatedProduct: Product = {
            ...product,
            price: product.originalPrice || product.price,
            originalPrice: product.originalPrice, // Keep original price reference or unset it? usually keep
            discountPercentage: 0,
            discountEndTime: undefined,
            isSale: false
        };
        productService.saveProduct(updatedProduct);
        refreshData();
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Add New Flash Sale */}
                <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Zap className="text-yellow-400" /> Create Flash Sale</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Select Product</label>
                            <select
                                value={selectedProductId}
                                onChange={(e) => setSelectedProductId(Number(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none"
                            >
                                <option value="">-- Choose Product --</option>
                                {availableProducts.map(p => (
                                    <option key={p.id} value={p.id}>{p.title}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-400 uppercase font-bold mb-1">Discount (%)</label>
                                <input
                                    type="number"
                                    min="1" max="99"
                                    value={discount}
                                    onChange={(e) => setDiscount(Number(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase font-bold mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 uppercase font-bold mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white outline-none"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAddFlashSale}
                            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-3 rounded-lg mt-2"
                        >
                            Launch Sale
                        </button>
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/5 rounded-2xl p-6 flex flex-col justify-center text-center">
                    <Clock size={48} className="mx-auto text-cyan-400 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Automated Timer</h3>
                    <p className="text-gray-400 text-sm">Products added here will automatically appear in the "Flash Sale" section on the homepage with a countdown timer. When the timer expires, the discount is automatically removed.</p>
                </div>
            </div>

            {/* Active Flash Sales List */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="text-lg font-bold">Active Flash Sales</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs uppercase text-gray-400">
                            <tr>
                                <th className="p-4">Product</th>
                                <th className="p-4">Discount</th>
                                <th className="p-4">Price Info</th>
                                <th className="p-4">Ends In</th>
                                <th className="p-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {activeFlashSales.length > 0 ? activeFlashSales.map(p => {
                                const expiry = new Date(p.discountEndTime!);
                                const now = new Date();
                                const isExpired = now > expiry;

                                return (
                                    <tr key={p.id} className="hover:bg-white/5">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <img src={p.imageUrl} alt="" className="w-10 h-10 rounded-md bg-gray-800 object-cover" />
                                                <span className="font-bold text-sm">{p.title}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-bold">-{p.discountPercentage}%</span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col text-xs">
                                                <span className="line-through text-gray-500">Rp {p.originalPrice?.toLocaleString()}</span>
                                                <span className="text-green-400 font-bold">Rp {p.price.toLocaleString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">
                                            {isExpired ? (
                                                <span className="text-red-500 font-bold">Expired</span>
                                            ) : (
                                                <span>{expiry.toLocaleString()}</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleStopSale(p)}
                                                className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs font-bold"
                                            >
                                                Stop Sale
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No active flash sales.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

const FinanceTab = ({ orders }: { orders: Order[] }) => {
    const [filter, setFilter] = useState<TimeFilter>('today');

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        const now = new Date();

        // Reset times to start of day for accurate comparison
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const oDate = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate()).getTime();

        if (filter === 'today') {
            return oDate === today;
        } else if (filter === 'week') {
            const sevenDaysAgo = today - (7 * 24 * 60 * 60 * 1000);
            return oDate >= sevenDaysAgo;
        } else if (filter === 'month') {
            const thirtyDaysAgo = today - (30 * 24 * 60 * 60 * 1000);
            return oDate >= thirtyDaysAgo;
        }
        return true; // 'all'
    });

    const totalIncome = filteredOrders.reduce((acc, o) => acc + o.totalAmount, 0);
    const avgOrder = filteredOrders.length > 0 ? totalIncome / filteredOrders.length : 0;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Laporan Keuangan</h3>
                <div className="bg-[#121212] border border-white/10 rounded-lg p-1 flex gap-1">
                    {[
                        { id: 'today', label: 'Hari Ini' },
                        { id: 'week', label: '7 Hari' },
                        { id: 'month', label: '30 Hari' },
                        { id: 'all', label: 'Semua' },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFilter(f.id as TimeFilter)}
                            className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${filter === f.id ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign size={80} />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Total Pendapatan</p>
                    <h3 className="text-3xl font-black text-green-400 font-mono">Rp {totalIncome.toLocaleString()}</h3>
                    <p className="text-xs text-gray-500 mt-2">{filter === 'today' ? 'Pendapatan hari ini' : filter === 'all' ? 'Total seluruh waktu' : `${filter} terakhir`}</p>
                </div>

                <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl relative overflow-hidden">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Total Transaksi</p>
                    <h3 className="text-3xl font-black text-white">{filteredOrders.length}</h3>
                    <p className="text-xs text-gray-500 mt-2">Pesanan berhasil</p>
                </div>

                <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl relative overflow-hidden">
                    <p className="text-gray-400 text-xs font-bold uppercase mb-2">Rata-rata Order</p>
                    <h3 className="text-3xl font-black text-cyan-400 font-mono">Rp {avgOrder.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                    <p className="text-xs text-gray-500 mt-2">Per transaksi</p>
                </div>
            </div>

            {/* Detailed Transaction List */}
            <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden mt-8">
                <div className="p-6 border-b border-white/5">
                    <h4 className="font-bold text-lg">Riwayat Transaksi</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs uppercase text-gray-400">
                            <tr>
                                <th className="p-4">Waktu</th>
                                <th className="p-4">Order ID</th>
                                <th className="p-4">Pelanggan</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredOrders.length > 0 ? (
                                filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-xs text-gray-400">
                                            {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className="p-4 text-sm font-mono text-gray-300">{order.id}</td>
                                        <td className="p-4 text-sm font-bold">{order.shippingDetails.firstName}</td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-md bg-green-900/30 text-green-400 text-[10px] font-bold uppercase border border-green-500/20">
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right font-mono text-green-400 font-bold">
                                            + Rp {order.totalAmount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">Tidak ada data transaksi pada periode ini.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
};

const OverviewTab = ({ stats, orders }: { stats: any, orders: Order[] }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Revenue" value={`Rp ${stats.revenue.toLocaleString()}`} icon={DollarSign} color="text-green-400" />
            <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} color="text-blue-400" />
            <StatCard title="Pending Process" value={stats.pending} icon={Clock} color="text-yellow-400" />
            <StatCard title="Total Products" value={stats.totalProducts} icon={Package} color="text-purple-400" />
        </div>

        {/* Charts/Graph Placeholder (Visual) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#121212] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-6">Sales Analytics (Yearly)</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                    {[40, 65, 30, 80, 55, 90, 45, 70, 60, 85, 50, 95].map((h, i) => (
                        <div key={i} className="w-full bg-white/5 rounded-t-lg hover:bg-purple-600/50 transition-colors relative group" style={{ height: `${h}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {h}%
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-gray-500 font-mono">
                    <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
                    <span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span><span>DEC</span>
                </div>
            </div>

            <div className="bg-[#121212] border border-white/5 rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                    {orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center font-bold text-xs">
                                {order.shippingDetails.firstName.charAt(0)}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-bold truncate">New Order #{order.id}</p>
                                <p className="text-xs text-gray-500 truncate">{new Date(order.date).toLocaleDateString()}</p>
                            </div>
                            <span className="text-xs font-bold text-green-400">+Rp {(order.totalAmount / 1000).toFixed(0)}k</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </motion.div>
);

const OrdersTab = ({ orders, onStatusUpdate, onViewProof }: { orders: Order[], onStatusUpdate: (id: string, status: Order['status']) => void, onViewProof: (url: string) => void }) => {
    // Helper to get action label
    const getActionLabel = (status: Order['status']) => {
        switch (status) {
            case 'pending': return 'Terima Pesanan';
            case 'confirmed': return 'Mulai Kemas';
            case 'packing': return 'Kirim Pesanan';
            case 'shipped': return 'Pesanan Selesai';
            default: return null;
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-[#121212] border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-xs uppercase text-gray-400">
                            <tr>
                                <th className="p-4 font-bold">Order ID</th>
                                <th className="p-4 font-bold">Customer</th>
                                <th className="p-4 font-bold">Items</th>
                                <th className="p-4 font-bold">Total</th>
                                <th className="p-4 font-bold">Payment</th>
                                <th className="p-4 font-bold">Status</th>
                                <th className="p-4 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {orders.map((order) => {
                                const actionLabel = getActionLabel(order.status);
                                return (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4 text-sm font-mono text-gray-300">{order.id}</td>
                                        <td className="p-4">
                                            <div className="font-bold text-sm">{order.shippingDetails.firstName} {order.shippingDetails.lastName}</div>
                                            <div className="text-xs text-gray-500">{order.shippingDetails.email}</div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">
                                            {order.items.length} items
                                        </td>
                                        <td className="p-4 font-mono text-cyan-400 font-bold">
                                            Rp {order.totalAmount.toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded w-max ${order.paymentMethod === 'cod' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {order.paymentMethod === 'cod' ? 'COD' : 'Bank Transfer'}
                                                </span>
                                                {order.paymentMethod === 'bank' && order.paymentProofUrl && (
                                                    <button
                                                        onClick={() => onViewProof(order.paymentProofUrl!)}
                                                        className="text-xs flex items-center gap-1 text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        <ImageIcon size={12} /> Check Proof
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' :
                                                order.status === 'shipped' ? 'bg-blue-500/20 text-blue-400' :
                                                    order.status === 'packing' ? 'bg-orange-500/20 text-orange-400' :
                                                        order.status === 'confirmed' ? 'bg-indigo-500/20 text-indigo-400' :
                                                            'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            {actionLabel ? (
                                                <button
                                                    onClick={() => onStatusUpdate(order.id, order.status)}
                                                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-lg ${order.status === 'pending' ? 'bg-green-600 hover:bg-green-500 text-white' :
                                                        order.status === 'confirmed' ? 'bg-indigo-600 hover:bg-indigo-500 text-white' :
                                                            order.status === 'packing' ? 'bg-blue-600 hover:bg-blue-500 text-white' :
                                                                order.status === 'shipped' ? 'bg-gray-700 hover:bg-gray-600 text-white' : ''
                                                        }`}
                                                >
                                                    {actionLabel}
                                                </button>
                                            ) : (
                                                <span className="text-xs text-gray-500 font-bold">Completed</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {orders.length === 0 && <div className="p-8 text-center text-gray-500">No orders found.</div>}
            </div>
        </motion.div>
    );
};

const ProductsTab = ({ products, onDelete, onEdit, onAdd }: { products: Product[], onDelete: any, onEdit: any, onAdd: any }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Inventory Management</h3>
            <button onClick={onAdd} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-bold text-sm transition-colors">
                <Plus size={16} /> Add Product
            </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map((product) => (
                <div key={product.id} className="bg-[#121212] border border-white/5 rounded-xl overflow-hidden group">
                    <div className="aspect-square bg-gray-900 relative">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-700 text-xs">No Image</div>
                        )}
                        <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => onEdit(product)} className="p-1.5 bg-white text-black rounded-full hover:scale-110 transition-transform"><Edit3 size={14} /></button>
                            <button onClick={() => onDelete(product.id)} className="p-1.5 bg-red-500 text-white rounded-full hover:scale-110 transition-transform"><Trash2 size={14} /></button>
                        </div>
                    </div>
                    <div className="p-3">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">{product.category}</p>
                        <h4 className="font-bold text-sm truncate mb-1">{product.title}</h4>
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col">
                                {product.isSale && <span className="text-[10px] text-gray-500 line-through">Rp {product.originalPrice?.toLocaleString()}</span>}
                                <span className={`font-mono text-sm ${product.isSale ? 'text-green-400 font-bold' : 'text-cyan-400'}`}>Rp {product.price.toLocaleString()}</span>
                            </div>
                            {product.isSale && (
                                <span className="text-[10px] bg-red-500 px-1.5 rounded text-white font-bold">
                                    -{product.discountPercentage}%
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
);

const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-[#121212] border border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-white/10 transition-colors">
        <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{title}</p>
            <h3 className="text-2xl font-black font-mono text-white">{value}</h3>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
        </div>
    </div>
);

export default AdminDashboard;
