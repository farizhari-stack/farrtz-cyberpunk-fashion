
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import LoginPage from './components/LoginPage';
import AdminLoginPage from './components/AdminLoginPage';
import AdminResetPasswordPage from './components/AdminResetPasswordPage';
import RegisterPage from './components/RegisterPage';
import ProductDetailPage from './components/ProductDetailPage';
import CartPage from './components/CartPage';
import CheckoutPage from './components/CheckoutPage';
import OrderHistoryPage from './components/OrderHistoryPage';
import AccountSettingsPage from './components/AccountSettingsPage';
import FavoritesPage from './components/FavoritesPage';
import AllProductsPage from './components/AllProductsPage';
import AdminDashboard from './components/AdminDashboard';
import FeedbackSection from './components/FeedbackSection';
import ChatWidget from './components/ChatWidget';
import { PageType, Product, CartItem, User, Feedback, ChatConversation, ChatMessage, Coupon } from './types';
import { authService } from './services/auth';
import { productService } from './services/productService';
import { feedbackService, messagesService, couponsService } from './services/localServices';
import { validateCoupon } from './utils/couponUtils';



// User App Component
interface UserAppProps {
  onSubmitFeedback: (feedback: Omit<Feedback, 'id' | 'date' | 'status'>) => void;
  conversations: ChatConversation[];
  onSendMessage: (userId: string, userName: string, message: string) => void;
  appliedCoupon: Coupon | null;
  onApplyCoupon: (code: string, userId?: string) => { success: boolean; message: string; coupon?: Coupon };
  onRemoveCoupon: () => void;
  onIncrementCouponUsage: (couponId: string, userId: string) => void;
}

const UserApp: React.FC<UserAppProps> = ({ onSubmitFeedback, conversations, onSendMessage, appliedCoupon, onApplyCoupon, onRemoveCoupon, onIncrementCouponUsage }) => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [user, setUser] = useState<User | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [targetCategory, setTargetCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    productService.initialize();
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
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
    <>
      {currentPage === 'home' && (
        <Home
          onNavigate={setCurrentPage}
          user={user}
          onLogout={handleLogout}
          onProductClick={handleProductClick}
          targetCategory={targetCategory}
          onSubmitFeedback={onSubmitFeedback}
          conversations={conversations}
          onSendMessage={onSendMessage}
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
          onApplyCoupon={onApplyCoupon}
          onRemoveCoupon={onRemoveCoupon}
        />
      )}
      {currentPage === 'checkout' && (
        <CheckoutPage
          onNavigate={setCurrentPage}
          cartItems={cartItems}
          user={user}
          onClearCart={handleClearCart}
          appliedCoupon={appliedCoupon}
          onIncrementCouponUsage={onIncrementCouponUsage}
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
    </>
  );
};

// Admin App Component
interface AdminAppProps {
  feedbacks: Feedback[];
  conversations: ChatConversation[];
  coupons: Coupon[];
  onUpdateFeedbackStatus: (feedbackId: string, status: Feedback['status']) => void;
  onSendMessage: (userId: string, message: string) => void;
  onCreateCoupon: (coupon: Omit<Coupon, 'id' | 'createdDate' | 'usageCount'>) => void;
  onToggleCouponStatus: (couponId: string) => void;
  onDeleteCoupon: (couponId: string) => void;
}

const AdminApp: React.FC<AdminAppProps> = ({ feedbacks, conversations, coupons, onUpdateFeedbackStatus, onSendMessage, onCreateCoupon, onToggleCouponStatus, onDeleteCoupon }) => {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentAdmin = authService.getCurrentUser();
    if (currentAdmin?.isAdmin) {
      setAdminUser(currentAdmin);
    }
    setIsLoading(false);
  }, []);


  const handleAdminLoginSuccess = (user: User) => {
    setAdminUser(user);
  };

  const handleAdminLogout = async () => {
    await authService.logout();
    setAdminUser(null);
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center text-red-400 brand-font">LOADING ADMIN PANEL...</div>;

  return (
    <>
      {!adminUser ? (
        <AdminLoginPage onLoginSuccess={handleAdminLoginSuccess} />
      ) : (
        <AdminDashboard
          user={adminUser}
          onNavigate={() => { }} // Not used in admin
          onLogout={handleAdminLogout}
          feedbacks={feedbacks}
          conversations={conversations}
          coupons={coupons}
          onUpdateFeedbackStatus={onUpdateFeedbackStatus}
          onSendMessage={onSendMessage}
          onCreateCoupon={onCreateCoupon}
          onToggleCouponStatus={onToggleCouponStatus}
          onDeleteCoupon={onDeleteCoupon}
        />
      )}
    </>
  );
};


// Main App with Router
const App: React.FC = () => {
  // Global state for feedback and chat
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);

  // Global state for coupons
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Load feedback and chat data from localStorage on mount + setup polling
  // Load initial data from API
  useEffect(() => {
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

    loadData();

    // Polling for updates (every 5 seconds)
    const pollInterval = setInterval(loadData, 5000);
    return () => clearInterval(pollInterval);
  }, []);

  // Save to localStorage whenever data changes (but not empty arrays on initial load)
  // REMOVED localStorage effects


  // Feedback handlers
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



  const handleUpdateFeedbackStatus = async (feedbackId: string, status: Feedback['status']) => {
    try {
      const feedback = await feedbackService.updateFeedbackStatus(feedbackId, status);
      if (feedback) {
        setFeedbacks((prev) =>
          prev.map((f) => (f.id === feedbackId ? { ...f, status } : f))
        );
      }
    } catch (e) { console.error(e); }
  };

  // Chat handlers
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

  const handleAdminSendMessage = async (userId: string, message: string) => {
    const messageData = {
      userId,
      message,
      sender: 'admin' as const,
    };

    try {
      const result = await messagesService.sendMessage(messageData);
      if (result) {
        // Optimistic update
        const messages = await messagesService.getAllMessages();
        if (messages) setConversations(messages);
      }
    } catch (e) { console.error(e); }
  };

  // Coupon handlers
  const handleCreateCoupon = async (newCoupon: Omit<Coupon, 'id' | 'createdDate' | 'usageCount' | 'usedBy'>) => {
    try {
      const coupon = await couponsService.createCoupon(newCoupon);
      if (coupon) {
        setCoupons((prev) => [coupon, ...prev]);
        console.log('✅ Coupon created via API:', coupon);
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

  const handleToggleCouponStatus = async (couponId: string) => {
    try {
      const coupon = await couponsService.toggleCouponStatus(couponId);
      if (coupon) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c))
        );
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    try {
      if (confirm('Delete this coupon?')) {
        await couponsService.deleteCoupon(couponId);
        setCoupons((prev) => prev.filter((c) => c.id !== couponId));
        if (appliedCoupon?.id === couponId) {
          setAppliedCoupon(null);
        }
      }
    } catch (e) { console.error(e); }
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
                // userId might be needed for local display until refresh, but api handles backend
                usedBy: [...(c.usedBy || []), userId]
              }
              : c
          )
        );
        console.log('✅ Coupon usage recorded via API');
      }
    } catch (e) { console.error('Failed to record coupon usage', e); }
  };

  return (
    <BrowserRouter basename="/farrtz-cyberpunk-fashion">
      <Routes>
        <Route
          path="/admin/reset-password"
          element={
            <AdminResetPasswordPage
              onResetSuccess={() => window.location.href = '/farrtz-cyberpunk-fashion/admin'}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <AdminApp
              feedbacks={feedbacks}
              conversations={conversations}
              coupons={coupons}
              onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
              onSendMessage={handleAdminSendMessage}
              onCreateCoupon={handleCreateCoupon}
              onToggleCouponStatus={handleToggleCouponStatus}
              onDeleteCoupon={handleDeleteCoupon}
            />
          }
        />
        <Route
          path="/*"
          element={
            <UserApp
              onSubmitFeedback={handleSubmitFeedback}
              conversations={conversations}
              onSendMessage={handleUserSendMessage}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onIncrementCouponUsage={handleIncrementCouponUsage}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

