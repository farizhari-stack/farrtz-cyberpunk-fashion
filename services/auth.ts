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
const initializeOrders = async () => {
  try {
    const response = await ordersApi.getAll();
    if (response.success && response.orders) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(response.orders));
    }
  } catch (error) {
    console.log('API not available for orders, using localStorage');
  }
};

// Auto-initialize
initializeOrders();

export const authService = {
  // --- DATABASE OPERATIONS ---

  getUsers: (): User[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  saveUser: (user: User) => {
    const users = authService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Also update in API (fire and forget)
    if (user.id) {
      usersApi.update(user.id, user).catch(console.error);
    }
  },

  // --- ORDER OPERATIONS (SYNC for backward compatibility) ---

  createOrder: async (order: Order): Promise<{ success: boolean; message?: string }> => {
    await delay(1000);
    try {
      // Try API first
      const response = await ordersApi.create({
        items: order.items,
        shippingDetails: order.shippingDetails,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentProofUrl: order.paymentProofUrl
      });

      if (response.success) {
        // Refresh local cache
        await initializeOrders();
        return { success: true };
      }
    } catch (error) {
      console.log('API error, saving order to localStorage');
    }

    // Fallback to localStorage
    const ordersStr = localStorage.getItem(ORDERS_KEY);
    const orders: Order[] = ordersStr ? JSON.parse(ordersStr) : [];
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return { success: true };
  },

  getOrdersByUser: (userId: string): Order[] => {
    const orders = authService.getAllOrders();
    return orders.filter(o => o.userId === userId);
  },

  // SYNC version for backward compatibility
  getAllOrders: (): Order[] => {
    const ordersStr = localStorage.getItem(ORDERS_KEY);
    return ordersStr ? JSON.parse(ordersStr) : [];
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<boolean> => {
    await delay(500);

    // Update localStorage
    const orders = authService.getAllOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

      // Also update in API (fire and forget)
      ordersApi.updateStatus(orderId, status).catch(console.error);
      return true;
    }
    return false;
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
    await delay(800);

    // HARDCODED ADMIN CHECK (same as original)
    if (email === 'admin@gmail.com' && password === 'admin') {
      const adminUser: User = {
        id: 'admin-master',
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@gmail.com',
        avatar: 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png',
        wishlist: [],
        isAdmin: true
      };
      authService.setAdminSession(adminUser);

      // Also try to login via API to get token
      authApi.adminLogin(email, password).catch(console.error);

      return { success: true, user: adminUser };
    }

    return { success: false, message: 'Invalid admin credentials.' };
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
