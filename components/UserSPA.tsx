"use client";
import React, { useState, useEffect } from 'react';
import Home from './Home';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ProductDetailPage from './ProductDetailPage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';
import OrderHistoryPage from './OrderHistoryPage';
import AccountSettingsPage from './AccountSettingsPage';
import FavoritesPage from './FavoritesPage';
import AllProductsPage from './AllProductsPage';
import { PageType, Product, CartItem, User, Feedback, ChatConversation, Coupon } from '../types';
import { authService } from '../services/auth';
import { productService } from '../services/productService';
import { feedbackService, messagesService, couponsService } from '../services/localServices';
import { validateCoupon } from '../utils/couponUtils';

export default function UserSPA() {
    const [currentPage, setCurrentPage] = useState<PageType>('home');
    const [user, setUser] = useState<User | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Global Data
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

    const [targetCategory, setTargetCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async () => {
        try {
            const [fbRes, msgRes, cpnRes] = await Promise.all([
                feedbackService.getAllFeedback(),
                messagesService.getAllMessages(),
                couponsService.getAllCoupons()
            ]);

            setFeedbacks(fbRes || []);
            setConversations(msgRes || []);
            setCoupons(cpnRes || []);
        } catch (error) {
            console.error("Failed to load initial app data", error);
        }
    };

    useEffect(() => {
        productService.initialize();
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        loadData();
        setIsLoading(false);
    }, []);

    useEffect(() => {
        const pollInterval = setInterval(loadData, 5000);
        return () => clearInterval(pollInterval);
    }, []);


    const handleLoginSuccess = (user: User) => {
        setUser(user);
        setCurrentPage('home');
    };

    const handleLogout = async () => {
        await authService.logout();
        setUser(null);
        setCurrentPage('login');
    };

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setCurrentPage('product-detail');
    };

    const handleAccountClick = () => {
        if (!user) {
            setCurrentPage('login');
        }
    };

    const handleAddToCart = (product: Product, quantity: number, details: { [key: string]: string }) => {
        const newItem: CartItem = {
            id: Date.now(),
            productId: product.id,
            title: product.title,
            price: product.price,
            quantity: quantity,
            imageUrl: product.imageUrl,
            details: details,
            selected: true,
            originalPrice: product.originalPrice,
            isSale: product.isSale
        };
        setCartItems([...cartItems, newItem]);
    };

    const handleClearCart = () => {
        setCartItems([]);
    };

    const handleCategorySelect = (category: string) => {
        setTargetCategory(category);
        setSearchQuery('');
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setTargetCategory(null);
        setCurrentPage('all-products');
    };

    const handleSubmitFeedback = async (newFeedback: Omit<Feedback, 'id' | 'date' | 'status'>) => {
        const feedbackData = {
            ...newFeedback,
            date: new Date().toISOString(),
            status: 'pending' as const, // Cast to literal type
        };

        try {
            const feedback = await feedbackService.createFeedback(feedbackData);
            if (feedback) {
                setFeedbacks((prev) => [feedback, ...prev]);
                console.log('✅ Feedback submitted via API!');
            }
        } catch (e) {
            console.error('Failed to submit feedback', e);
        }
    };

    const handleUserSendMessage = async (userId: string, userName: string, message: string) => {
        const messageData = {
            userId,
            userName,
            message,
            sender: 'user' as const,
        };

        try {
            const result = await messagesService.sendMessage(messageData);
            if (result) {
                // Optimistic update or wait for poll
                const messages = await messagesService.getAllMessages();
                if (messages) setConversations(messages);
            }
        } catch (e) { console.error(e); }
    };

    const handleApplyCoupon = (code: string, userId?: string): { success: boolean; message: string; coupon?: Coupon } => {
        const result = validateCoupon(code, coupons, userId);

        if (result.valid && result.coupon) {
            setAppliedCoupon(result.coupon);
            console.log('✅ Coupon applied:', result.coupon);
            return { success: true, message: `Coupon "${result.coupon.code}" applied! ${result.coupon.discountPercent}% discount`, coupon: result.coupon };
        } else {
            console.log('❌ Invalid coupon:', result.error);
            return { success: false, message: result.error || 'Invalid coupon' };
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        console.log('🗑️ Coupon removed');
    };

    const handleIncrementCouponUsage = async (couponId: string, userId: string) => {
        try {
            const res = await couponsService.useCoupon(couponId);
            if (res) {
                setCoupons((prev) =>
                    prev.map((c) =>
                        c.id === couponId
                            ? {
                                ...c,
                                usageCount: c.usageCount + 1,
                                usedBy: [...(c.usedBy || []), userId]
                            }
                            : c
                    )
                );
                console.log('✅ Coupon usage recorded via API');
            }
        } catch (e) { console.error('Failed to record coupon usage', e); }
    };


    useEffect(() => {
        if (currentPage !== 'home') {
            setTargetCategory(null);
        }
    }, [currentPage]);

    if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-cyan-400 brand-font">LOADING MAINFRAME...</div>;

    const commonProps = {
        cartItemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
        onSearch: handleSearch
    };

    return (
        <div className="min-h-screen bg-black text-white relative">
            {/* Debug Banner - Remove later */}
            {/* <div className="bg-red-600 text-white p-1 text-center text-xs">System Online</div> */}

            {currentPage === 'home' && (
                <Home
                    onNavigate={setCurrentPage}
                    user={user}
                    onLogout={handleLogout}
                    onProductClick={handleProductClick}
                    targetCategory={targetCategory}
                    onSubmitFeedback={handleSubmitFeedback}
                    conversations={conversations}
                    onSendMessage={handleUserSendMessage}
                    {...commonProps}
                />
            )}
            {currentPage === 'all-products' && (
                <AllProductsPage
                    onNavigate={setCurrentPage}
                    user={user}
                    onLogout={handleLogout}
                    onProductClick={handleProductClick}
                    onSelectCategory={handleCategorySelect}
                    searchQuery={searchQuery}
                    {...commonProps}
                />
            )}
            {currentPage === 'login' && (
                <LoginPage
                    onNavigate={setCurrentPage}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
            {currentPage === 'register' && (
                <RegisterPage
                    onNavigate={setCurrentPage}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}
            {currentPage === 'product-detail' && selectedProduct && (
                <ProductDetailPage
                    product={selectedProduct}
                    user={user}
                    setUser={setUser}
                    onNavigate={setCurrentPage}
                    onBack={() => setCurrentPage('home')}
                    onAccountClick={handleAccountClick}
                    onAddToCart={handleAddToCart}
                    {...commonProps}
                />
            )}
            {currentPage === 'cart' && (
                <CartPage
                    onNavigate={setCurrentPage}
                    onAccountClick={handleAccountClick}
                    cartItems={cartItems}
                    setCartItems={setCartItems}
                    user={user}
                    onSearch={handleSearch}
                    appliedCoupon={appliedCoupon}
                    onApplyCoupon={handleApplyCoupon}
                    onRemoveCoupon={handleRemoveCoupon}
                />
            )}
            {currentPage === 'checkout' && (
                <CheckoutPage
                    onNavigate={setCurrentPage}
                    cartItems={cartItems}
                    user={user}
                    onClearCart={handleClearCart}
                    appliedCoupon={appliedCoupon}
                    onIncrementCouponUsage={handleIncrementCouponUsage}
                />
            )}
            {currentPage === 'order-history' && (
                <OrderHistoryPage
                    onNavigate={setCurrentPage}
                    user={user}
                    onAccountClick={handleAccountClick}
                    onLogout={handleLogout}
                    {...commonProps}
                />
            )}
            {currentPage === 'account-settings' && (
                <AccountSettingsPage
                    onNavigate={setCurrentPage}
                    user={user}
                    setUser={setUser}
                    onLogout={handleLogout}
                    {...commonProps}
                />
            )}
            {currentPage === 'favorites' && (
                <FavoritesPage
                    onNavigate={setCurrentPage}
                    user={user}
                    setUser={setUser}
                    onLogout={handleLogout}
                    onProductClick={handleProductClick}
                    {...commonProps}
                />
            )}
        </div>
    );
}
