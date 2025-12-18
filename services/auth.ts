/**
 * Auth Service - Updated to use Backend API
 * Maintains FULL backward compatibility with existing components (sync calls)
 */

import { User, Order } from '../types';
import { authApi, ordersApi, usersApi, getToken, removeToken } from './api';
import emailjs from '@emailjs/browser';

const USERS_KEY = 'farrtz_users_db';
const ORDERS_KEY = 'farrtz_orders_db';
const ADMIN_SESSION_KEY = 'farrtz_admin_session';
const USER_SESSION_KEY = 'farrtz_user_session';

// --- KONFIGURASI EMAILJS (untuk password reset emails) ---
const EMAILJS_SERVICE_ID = 'service_jhajp2d';
const EMAILJS_TEMPLATE_ID = 'template_fmc5xpj';
const EMAILJS_PUBLIC_KEY = 'eMXPedz89SSbeq6zC';

// Simulate a database delay for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Initialize orders from API on module load
// Initialize orders from API on module load
const initializeOrders = async () => {
  // No-op or just log
  console.log("Orders initialized via API");
};

// Auto-initialize
initializeOrders();

export const authService = {
  // --- DATABASE OPERATIONS ---

  getUsers: (): User[] => {
    // Deprecated: Users should be fetched via API
    return [];
  },

  saveUser: async (user: User) => {
    // Direct API call via usersApi or authApi if needed,
    // but typically user update happens via specific endpoints.
    // We will assume this legacy method was for local dev.
    console.warn("saveUser is deprecated. Use usersApi.update()");
    // If the user has an ID, attempt to update via API
    if (user.id) {
      try {
        await usersApi.update(user.id, user);
      } catch (error) {
        console.error("Failed to update user via API:", error);
      }
    }
    return user;
  },

  // --- ORDER OPERATIONS ---

  createOrder: async (order: Order): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await ordersApi.create({
        items: order.items,
        shippingDetails: order.shippingDetails,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentProofUrl: order.paymentProofUrl
      });

      if (response.success) {
        return { success: true };
      }
      return { success: false, message: response.message || 'Failed to create order' };
    } catch (error) {
      console.error('Order creation failed:', error);
      return { success: false, message: 'Network error' };
    }
  },

  getOrdersByUser: async (userId: string): Promise<Order[]> => {
    try {
      const response = await ordersApi.getAll();
      if (response.success && response.orders) {
        return response.orders.filter((o: Order) => o.userId === userId);
      }
    } catch (error) {
      console.error('Failed to get user orders:', error);
    }
    return [];
  },

  // Async version
  getAllOrdersAsync: async (): Promise<Order[]> => {
    try {
      const response = await ordersApi.getAll();
      if (response.success && response.orders) {
        return response.orders;
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    }
    return [];
  },

  // Deprecated sync version - kept for temporary compatibility but returns empty
  getAllOrders: (): Order[] => {
    console.warn("authService.getAllOrders() is deprecated. Use getAllOrdersAsync().");
    return [];
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<boolean> => {
    try {
      const response = await ordersApi.updateStatus(orderId, status);
      return response.success;
    } catch (error) {
      console.error('Failed to update order status:', error);
      return false;
    }
  },

  // --- AUTH OPERATIONS ---

  async register(firstName: string, lastName: string, email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    await delay(800);

    try {
      const response = await authApi.register(firstName, lastName, email, password);
      if (response.success && response.user) {
        authService.setUserSession(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message };
    } catch (error) {
      // Fallback to localStorage registration
      const users = authService.getUsers();

      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        return { success: false, message: 'Email already registered.' };
      }

      const newUser: User = {
        id: Date.now().toString(),
        firstName,
        lastName,
        email,
        password,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${firstName}`,
        wishlist: [],
        isAdmin: false
      };

      authService.saveUser(newUser);
      authService.setUserSession(newUser);
      return { success: true, user: newUser };
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    await delay(800);

    try {
      const response = await authApi.login(email, password);
      if (response.success && response.user) {
        authService.setUserSession(response.user);
        return { success: true, user: response.user };
      }
      return { success: false, message: response.message };
    } catch (error) {
      // Fallback to localStorage login
      const users = authService.getUsers();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

      if (!user) {
        return { success: false, message: 'Invalid email or password.' };
      }

      if (user.isAdmin) {
        return { success: false, message: 'Please use admin login page.' };
      }

      if (!user.wishlist) user.wishlist = [];
      authService.setUserSession(user);
      return { success: true, user };
    }
  },

  async adminLogin(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    await delay(300);

    try {
      // Call the backend API for admin login
      const response = await authApi.adminLogin(email, password);

      if (response.success && response.user) {
        const adminUser: User = {
          id: response.user.id || 'admin-master',
          firstName: response.user.firstName || 'System',
          lastName: response.user.lastName || 'Admin',
          email: response.user.email || email,
          avatar: response.user.avatar || 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png',
          wishlist: response.user.wishlist || [],
          isAdmin: true
        };
        authService.setAdminSession(adminUser);
        console.log('✅ Admin logged in successfully, token stored');
        return { success: true, user: adminUser };
      }

      return { success: false, message: response.message || 'Invalid admin credentials.' };
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    }
  },

  async updateUser(updatedUser: User): Promise<{ success: boolean; user?: User }> {
    await delay(500);

    authService.saveUser(updatedUser);

    if (updatedUser.isAdmin) {
      authService.setAdminSession(updatedUser);
    } else {
      authService.setUserSession(updatedUser);
    }

    return { success: true, user: updatedUser };
  },

  logoutUser: () => {
    sessionStorage.removeItem(USER_SESSION_KEY);
    removeToken();
  },

  logoutAdmin: () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    removeToken();
  },

  // --- PASSWORD RESET LOGIC ---

  async initiatePasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
    await delay(1000);

    try {
      const response = await authApi.forgotPassword(email);
      if (response.success) {
        if (response.devCode) {
          console.log(`[AUTH] Dev mode - Reset code: ${response.devCode}`);
          alert(`[DEV MODE] Reset code: ${response.devCode}`);
        }
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  },

  async validateResetCode(email: string, code: string): Promise<{ success: boolean; message?: string }> {
    await delay(800);

    try {
      const response = await authApi.validateResetCode(email, code);
      return { success: response.success, message: response.message };
    } catch (error) {
      return { success: false, message: 'Validation failed. Please try again.' };
    }
  },

  async completePasswordReset(email: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    await delay(1000);

    // Hardcoded Admin
    if (email === 'admin@gmail.com') {
      return { success: false, message: 'Cannot reset hardcoded admin password in demo.' };
    }

    try {
      const response = await authApi.resetPassword(email, newPassword);
      return { success: response.success, message: response.message };
    } catch (error) {
      // Fallback to localStorage
      const users = authService.getUsers();
      const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

      if (index === -1) {
        return { success: false, message: 'User not found.' };
      }

      users[index].password = newPassword;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      return { success: true, message: 'Password updated successfully' };
    }
  },

  // --- SESSION MANAGEMENT ---

  setUserSession: (user: User) => {
    const safeUser = { ...user };
    delete safeUser.password;
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(safeUser));
  },

  setAdminSession: (user: User) => {
    const safeUser = { ...user };
    delete safeUser.password;
    sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(safeUser));
  },

  getCurrentUserSession: (): User | null => {
    const sessionStr = sessionStorage.getItem(USER_SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  getCurrentAdminSession: (): User | null => {
    const sessionStr = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return sessionStr ? JSON.parse(sessionStr) : null;
  },

  getCurrentUser: (): User | null => {
    return authService.getCurrentAdminSession() || authService.getCurrentUserSession();
  },

  isAuthenticated: (): boolean => {
    return !!getToken();
  },

  async refreshCurrentUser(): Promise<User | null> {
    if (!getToken()) return null;

    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.user) {
        if (response.user.isAdmin) {
          authService.setAdminSession(response.user);
        } else {
          authService.setUserSession(response.user);
        }
        return response.user;
      }
    } catch (error) {
      console.log('Failed to refresh user from API');
    }
    return null;
  },

  // Refresh orders from API
  refreshOrders: async (): Promise<void> => {
    await initializeOrders();
  }
};
