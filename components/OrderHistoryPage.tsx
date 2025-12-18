
import React, { useEffect, useState } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Truck, Check, Package, Calendar, MapPin, CreditCard, X, ChevronRight, Calculator, Banknote } from 'lucide-react';
import Navbar from './Navbar';
import AccountSidebar from './AccountSidebar';
import { PageType, User, Order } from '../types';
import { authService } from '../services/auth';

const motion = framerMotion as any;

interface OrderHistoryPageProps {
  onNavigate: (page: PageType) => void;
  user: User | null;
  onAccountClick: () => void;
  cartItemCount: number;
  onLogout: () => void;
  onSearch?: (query: string) => void;
}

const OrderHistoryPage: React.FC<OrderHistoryPageProps> = ({ onNavigate, user, onAccountClick, cartItemCount, onLogout, onSearch }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      const userOrders = authService.getOrdersByUser(user.id);
      // Sort by newest first
      setOrders(userOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }
  }, [user]);

  const handleLogout = () => {
    setIsSidebarOpen(false);
    onLogout();
  };

  // Logic to calculate estimated date based on shipping method
  const getEstimatedArrival = (orderDate: string, method: string) => {
    const date = new Date(orderDate);
    let daysToAdd = 7; // Standard 6-8 days (taking avg 7)
    if (method === 'regular') daysToAdd = 5; // 4-5 days
    if (method === 'express') daysToAdd = 3; // 2-3 days
    
    date.setDate(date.getDate() + daysToAdd);
    return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] to-[#0f0c29] text-white font-sans selection:bg-cyan-500 selection:text-black">
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
        onLogout={handleLogout}
        user={user}
        onNavigate={onNavigate}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal 
        order={selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        getEstimatedArrival={getEstimatedArrival}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Page Header */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
        >
            <h1 className="text-3xl md:text-4xl font-black brand-font mb-6">My Account</h1>
            
            {/* Tabs */}
            <div className="relative border-b border-white/10">
                <div className="absolute bottom-0 left-0 w-40 h-[2px] bg-blue-500 shadow-[0_0_10px_#3b82f6]"></div>
                <div className="flex gap-8">
                    <button className="pb-4 px-2 flex items-center gap-2 text-white font-bold text-sm tracking-wide">
                        <ShoppingBag size={18} /> Order History
                    </button>
                    {/* Placeholder for other tabs if needed in future */}
                </div>
            </div>
        </motion.div>

        {/* Orders List */}
        <div className="space-y-6">
            {orders.length === 0 ? (
                <div className="bg-white/5 rounded-2xl p-12 text-center border border-white/10">
                    <Package size={48} className="mx-auto text-gray-500 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Orders Yet</h3>
                    <p className="text-gray-400 mb-6">Go explore the shop and grab some gear!</p>
                    <button 
                        onClick={() => onNavigate('home')}
                        className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full font-bold shadow-lg hover:shadow-cyan-500/50 transition-all"
                    >
                        Start Shopping
                    </button>
                </div>
            ) : (
                orders.map((order, index) => {
                    const estimatedDate = getEstimatedArrival(order.date, order.shippingDetails.method);
                    
                    return (
                        <motion.div 
                            key={order.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-[#2e1065]/40 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-xl"
                        >
                            {/* Order Header Info */}
                            <div className="bg-black/20 p-6 flex flex-wrap gap-6 items-center border-b border-white/5">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center border border-white/10">
                                        {order.items[0]?.imageUrl ? (
                                            <img src={order.items[0].imageUrl} alt="Product" className="w-full h-full object-cover" />
                                        ) : (
                                            <Package className="text-gray-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1">{order.items[0]?.title}</h3>
                                        {order.items.length > 1 && (
                                            <p className="text-xs text-gray-400">+ {order.items.length - 1} other items</p>
                                        )}
                                        <div className="mt-2 text-xs text-gray-400 space-y-1">
                                            <p>Order ID: <span className="text-gray-300 font-mono">{order.id}</span></p>
                                            <p>Date: <span className="text-gray-300">{new Date(order.date).toLocaleDateString()}</span></p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Timeline Component */}
                                <div className="flex-1 min-w-[300px] flex flex-col justify-center px-4 lg:px-12">
                                    <OrderTimeline status={order.status} />
                                    <div className="mt-3 text-center">
                                        <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
                                            Est. Arrival: <span className="text-white">{estimatedDate}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Order Footer Info */}
                            <div className="p-6 flex flex-wrap justify-between items-center gap-4 bg-gradient-to-r from-transparent to-black/30">
                                <div>
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
                                        {order.paymentMethod === 'cod' ? 'Total Tagihan COD' : 'Total Dibayar (Transfer)'}
                                    </p>
                                    <p className={`text-xl font-bold font-mono ${order.paymentMethod === 'cod' ? 'text-orange-400' : 'text-green-400'}`}>
                                        Rp. {order.totalAmount.toLocaleString()}
                                    </p>
                                </div>
                                
                                <div className="hidden sm:block">
                                    <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Payment Method</p>
                                    <p className="text-sm font-bold uppercase flex items-center gap-2">
                                        {order.paymentMethod === 'cod' ? <Banknote size={16} /> : <CreditCard size={16} />}
                                        {order.paymentMethod === 'cod' ? 'COD (Cash)' : 'Bank Transfer'}
                                    </p>
                                </div>

                                <button 
                                    onClick={() => setSelectedOrder(order)}
                                    className="px-6 py-2 border border-white/20 rounded-full hover:bg-white/10 hover:border-cyan-400 hover:text-cyan-400 transition-all text-sm font-bold flex items-center gap-2 group"
                                >
                                    View Details <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </motion.div>
                    );
                })
            )}
        </div>
      </div>
    </div>
  );
};

// --- Sub-Components ---

// Order Timeline Component
const OrderTimeline = ({ status }: { status: Order['status'] }) => {
    // Determine active step index
    let activeIndex = 0;
    if (status === 'packing') activeIndex = 1;
    if (status === 'shipped') activeIndex = 2;
    if (status === 'delivered') activeIndex = 3;

    const steps = [
        { label: 'Packaging', icon: Package },
        { label: 'Shipping', icon: Truck },
        { label: 'To Destination', icon: Check }
    ];

    return (
        <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gray-700 -translate-y-1/2 z-0"></div>
            <div 
                className="absolute top-1/2 left-0 h-[2px] bg-gradient-to-r from-purple-500 to-cyan-500 -translate-y-1/2 z-0 transition-all duration-1000"
                style={{ width: `${(activeIndex / (steps.length - 0.5)) * 100}%` }}
            ></div>

            <div className="relative z-10 flex justify-between w-full">
                {steps.map((step, idx) => {
                    const isActive = idx + 1 <= activeIndex; // +1 because packing is index 1 in my logic above
                    const isCurrent = idx + 1 === activeIndex;
                    
                    return (
                        <div key={idx} className="flex flex-col items-center gap-2">
                            <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-2 transition-all duration-500 ${
                                isActive ? 'bg-white border-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-gray-900 border-gray-600'
                            }`}>
                                {isCurrent && (
                                    <div className="absolute top-0 left-0 w-full h-full bg-cyan-400 rounded-full animate-ping opacity-75"></div>
                                )}
                            </div>
                            <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors ${
                                isActive ? 'text-white' : 'text-gray-500'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Detail Modal Component
const OrderDetailModal = ({ order, onClose, getEstimatedArrival }: { order: Order | null, onClose: () => void, getEstimatedArrival: (d: string, m: string) => string }) => {
    if (!order) return null;

    const estimatedDate = getEstimatedArrival(order.date, order.shippingDetails.method);

    // Calculate Dynamic Values
    const grossSubtotal = order.items.reduce((acc, item) => {
        // If it was a sale item, use the original price for gross calculation
        const itemPrice = (item.isSale && item.originalPrice) ? item.originalPrice : item.price;
        return acc + (itemPrice * item.quantity);
    }, 0);

    const totalDiscount = order.items.reduce((acc, item) => {
        // Calculate savings if item was on sale
        if (item.isSale && item.originalPrice && item.originalPrice > item.price) {
            return acc + ((item.originalPrice - item.price) * item.quantity);
        }
        return acc;
    }, 0);
    
    // Determine shipping cost based on method name stored
    let shippingCost = 25000;
    if (order.shippingDetails.method === 'regular') shippingCost = 35000;
    if (order.shippingDetails.method === 'express') shippingCost = 50000;
    
    const tax = 2000;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    className="bg-[#1e1b4b] border border-purple-500/30 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl relative shadow-[0_0_50px_rgba(76,29,149,0.3)] custom-scrollbar"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-[#1e1b4b]/95 backdrop-blur-xl p-6 border-b border-white/10 flex justify-between items-center z-10">
                        <div>
                            <h2 className="text-2xl font-bold brand-font">Order Details</h2>
                            <p className="text-xs text-gray-400 font-mono mt-1">ID: {order.id}</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        
                        {/* Status Banner */}
                        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 rounded-xl border border-blue-500/30 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <Truck size={20} className="text-cyan-400" />
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</p>
                                    <p className="font-bold text-white uppercase">{order.status}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Est. Delivery</p>
                                <p className="font-bold text-white">{estimatedDate}</p>
                             </div>
                        </div>

                        {/* Items */}
                        <section>
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Package size={16} /> Product Items
                            </h3>
                            <div className="space-y-4">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                                        <div className="w-16 h-16 bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-sm leading-tight mb-1">{item.title}</h4>
                                            <div className="text-xs text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                                                <span>Qty: <span className="text-white">{item.quantity}</span></span>
                                                {item.details.size && <span>Size: <span className="text-white">{item.details.size}</span></span>}
                                                {item.details.color && <span>Color: <span className="text-white capitalize">{item.details.color}</span></span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {item.isSale && item.originalPrice ? (
                                                <>
                                                    <p className="text-xs text-gray-500 line-through">Rp. {item.originalPrice.toLocaleString()}</p>
                                                    <p className="font-bold font-mono text-sm text-green-400">Rp. {item.price.toLocaleString()}</p>
                                                </>
                                            ) : (
                                                <p className="font-bold font-mono text-sm">Rp. {item.price.toLocaleString()}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Shipping Info */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <MapPin size={16} /> Delivery Address
                                </h3>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-sm space-y-1 text-gray-300">
                                    <p className="text-white font-bold">{order.shippingDetails.firstName} {order.shippingDetails.lastName}</p>
                                    <p>{order.shippingDetails.address}</p>
                                    <p>{order.shippingDetails.subdistrict}, {order.shippingDetails.district}</p>
                                    <p>{order.shippingDetails.city}, {order.shippingDetails.zipCode}</p>
                                    <div className="pt-2 mt-2 border-t border-white/10 flex flex-col text-xs text-gray-500">
                                        <span>Phone: {order.shippingDetails.phone}</span>
                                        <span>Email: {order.shippingDetails.email}</span>
                                    </div>
                                </div>
                            </section>

                            {/* Payment Info / Breakdown */}
                            <section>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Calculator size={16} /> Payment Summary
                                </h3>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-3">
                                    
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Metode</span>
                                        <span className="text-white font-bold uppercase">{order.paymentMethod === 'cod' ? 'COD' : 'Transfer'}</span>
                                    </div>

                                    <div className="h-px bg-white/10 my-2"></div>

                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Subtotal Barang</span>
                                        <span className="font-mono">Rp. {grossSubtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Ongkos Kirim ({order.shippingDetails.method})</span>
                                        <span className="font-mono">Rp. {shippingCost.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-300">
                                        <span>Pajak</span>
                                        <span className="font-mono">Rp. {tax.toLocaleString()}</span>
                                    </div>
                                    
                                    {totalDiscount > 0 && (
                                        <div className="flex justify-between text-sm text-green-400">
                                            <span>Diskon</span>
                                            <span className="font-mono">- Rp. {totalDiscount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    
                                    <div className="h-px bg-white/10 my-2"></div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-white text-lg">Total Akhir</span>
                                        <span className="font-bold text-xl text-cyan-400 font-mono">Rp. {order.totalAmount.toLocaleString()}</span>
                                    </div>

                                    {order.paymentMethod === 'cod' && (
                                        <div className="mt-3 text-xs text-orange-200 bg-orange-900/40 border border-orange-500/30 p-3 rounded-lg flex gap-2">
                                            <Banknote size={16} className="shrink-0" />
                                            <span>
                                                <strong>COD (Bayar Ditempat):</strong> Mohon siapkan uang tunai sebesar <strong>Rp. {order.totalAmount.toLocaleString()}</strong> untuk diserahkan kepada kurir saat paket sampai. Harga ini sudah termasuk ongkos kirim.
                                            </span>
                                        </div>
                                    )}

                                    {order.paymentMethod === 'bank' && (
                                        <div className="mt-3 text-xs text-green-200 bg-green-900/40 border border-green-500/30 p-3 rounded-lg flex gap-2">
                                            <CreditCard size={16} className="shrink-0" />
                                            <span>
                                                <strong>LUNAS:</strong> Pembayaran sebesar <strong>Rp. {order.totalAmount.toLocaleString()}</strong> telah kami terima. Harga ini sudah termasuk ongkos kirim.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default OrderHistoryPage;
