
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import LoginPage from './components/LoginPage';
import AdminLoginPage from './components/AdminLoginPage';
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
    const currentUser = authService.getCurrentUserSession();
    if (currentUser) {
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setUser(user);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    authService.logoutUser();
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
    const currentAdmin = authService.getCurrentAdminSession();
    if (currentAdmin) {
      setAdminUser(currentAdmin);
    }
    setIsLoading(false);
  }, []);


  const handleAdminLoginSuccess = (user: User) => {
    setAdminUser(user);
  };

  const handleAdminLogout = () => {
    authService.logoutAdmin();
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
  useEffect(() => {
    const loadData = () => {
      const savedFeedbacks = localStorage.getItem('feedbacks');
      const savedConversations = localStorage.getItem('conversations');
      const savedCoupons = localStorage.getItem('coupons');

      if (savedFeedbacks) {
        setFeedbacks(JSON.parse(savedFeedbacks));
      }
      if (savedConversations) {
        setConversations(JSON.parse(savedConversations));
      }
      if (savedCoupons) {
        setCoupons(JSON.parse(savedCoupons));
      }
    };

    // Initial load
    loadData();

    // Setup polling for realtime updates (every 3 seconds)
    const pollInterval = setInterval(() => {
      loadData();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, []);

  // Save to localStorage whenever data changes (but not empty arrays on initial load)
  useEffect(() => {
    if (feedbacks.length > 0) {
      console.log('💾 Saving feedbacks to localStorage:', feedbacks);
      localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    }
  }, [feedbacks]);

  useEffect(() => {
    if (conversations.length > 0) {
      console.log('💾 Saving conversations to localStorage:', conversations);
      localStorage.setItem('conversations', JSON.stringify(conversations));
    }
  }, [conversations]);

  useEffect(() => {
    if (coupons.length > 0) {
      console.log('💾 Saving coupons to localStorage:', coupons);
      localStorage.setItem('coupons', JSON.stringify(coupons));
    }
  }, [coupons]);

  // Feedback handlers
  const handleSubmitFeedback = (newFeedback: Omit<Feedback, 'id' | 'date' | 'status'>) => {
    console.log('📝 handleSubmitFeedback called with:', newFeedback);

    const feedback: Feedback = {
      ...newFeedback,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      status: 'pending',
    };

    console.log('✅ Created feedback object:', feedback);

    setFeedbacks((prev) => {
      const updated = [feedback, ...prev];
      console.log('📊 Updated feedbacks array:', updated);
      // Immediately save to localStorage
      localStorage.setItem('feedbacks', JSON.stringify(updated));
      return updated;
    });

    console.log('✅ Feedback submitted successfully!');
  };

  const handleUpdateFeedbackStatus = (feedbackId: string, status: Feedback['status']) => {
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === feedbackId ? { ...f, status } : f))
    );
  };

  // Chat handlers
  const handleUserSendMessage = (userId: string, userName: string, message: string) => {
    console.log('User sending message:', { userId, userName, message });

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId,
      userName,
      message,
      sender: 'user',
      timestamp: new Date().toISOString(),
      read: false,
    };

    setConversations((prev) => {
      console.log('Current conversations:', prev);
      const existing = prev.find((c) => c.userId === userId);
      let updated;
      if (existing) {
        console.log('Updating existing conversation');
        updated = prev.map((c) =>
          c.userId === userId
            ? {
              ...c,
              messages: [...c.messages, newMessage],
              lastMessageTime: newMessage.timestamp,
            }
            : c
        );
      } else {
        console.log('Creating new conversation');
        // Create new conversation
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        updated = [
          ...prev,
          {
            userId,
            userName,
            userEmail: currentUser.email || '',
            messages: [newMessage],
            lastMessageTime: newMessage.timestamp,
            unreadCount: 0,
          },
        ];
      }

      // Immediately save to localStorage
      console.log('💾 Saving conversations to localStorage:', updated);
      localStorage.setItem('conversations', JSON.stringify(updated));

      return updated;
    });
  };

  const handleAdminSendMessage = (userId: string, message: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId,
      userName: 'Admin',
      message,
      sender: 'admin',
      timestamp: new Date().toISOString(),
      read: false,
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.userId === userId
          ? {
            ...c,
            messages: [...c.messages, newMessage],
            lastMessageTime: newMessage.timestamp,
            unreadCount: c.unreadCount + 1,
          }
          : c
      )
    );
  };

  // Coupon handlers
  const handleCreateCoupon = (newCoupon: Omit<Coupon, 'id' | 'createdDate' | 'usageCount' | 'usedBy'>) => {
    const coupon: Coupon = {
      ...newCoupon,
      id: Date.now().toString(),
      createdDate: new Date().toISOString(),
      usageCount: 0,
      usedBy: [], // Initialize empty array
    };

    setCoupons((prev) => {
      const updated = [coupon, ...prev];
      localStorage.setItem('coupons', JSON.stringify(updated));
      return updated;
    });

    console.log('✅ Coupon created:', coupon);
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

  const handleToggleCouponStatus = (couponId: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === couponId ? { ...c, isActive: !c.isActive } : c))
    );
  };

  const handleDeleteCoupon = (couponId: string) => {
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
    // If deleted coupon was applied, remove it
    if (appliedCoupon?.id === couponId) {
      setAppliedCoupon(null);
    }
  };

  const handleIncrementCouponUsage = (couponId: string, userId: string) => {
    setCoupons((prev) =>
      prev.map((c) =>
        c.id === couponId
          ? {
            ...c,
            usageCount: c.usageCount + 1,
            usedBy: [...(c.usedBy || []), userId]  // Add user to usedBy array
          }
          : c
      )
    );
  };

  return (
    <BrowserRouter>
      <Routes>
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

