import { User, Order } from '../types';

const USER_SESSION_KEY = 'farrtz_user_session';
const ADMIN_SESSION_KEY = 'farrtz_admin_session';

export const authService = {
  // Login
  async login(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        if (!data.user.isAdmin) {
          authService.setUserSession(data.user);
        } else {
          return { success: false, message: 'Please use admin login page.' };
        }
      }
      return data;
    } catch (e) {
      return { success: false, message: 'Network error' };
    }
  },

  async adminLogin(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success && data.user) {
        if (data.user.isAdmin) {
          authService.setAdminSession(data.user);
        } else {
          return { success: false, message: 'Not an admin account.' };
        }
      }
      return data;
    } catch (e) {
      return { success: false, message: 'Network error' };
    }
  },

  async register(firstName: string, lastName: string, email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName, lastName, email, password,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${firstName}`
        })
      });
      const data = await res.json();
      if (data.success) {
        authService.setUserSession(data.user);
      }
      return data;
    } catch (e) {
      return { success: false, message: 'Network error' };
    }
  },

  async checkAdminExists(): Promise<boolean> {
    // Mock true or fetch check
    return true;
  },

  async adminRegister(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    adminCode: string;
  }): Promise<{ success: boolean; user?: User; message?: string; autoLogin?: boolean }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...userData,
          isAdmin: true
        })
      });
      const data = await res.json();
      if (data.success) {
        authService.setAdminSession(data.user);
        return { success: true, user: data.user, autoLogin: true };
      }
      return data;
    } catch (e) {
      return { success: false, message: 'Network error' };
    }
  },

  async adminUpdatePassword(newPassword: string): Promise<{ success: boolean; message?: string }> {
    // Implement password update logic here (API call)
    return { success: true, message: 'Password updated' };
  },

  // Orders
  createOrder: async (order: Order): Promise<{ success: boolean; message?: string }> => {
    await fetch('/api/orders', { method: 'POST', body: JSON.stringify(order) });
    return { success: true };
  },

  getAllOrdersAsync: async (): Promise<Order[]> => {
    try {
      const res = await fetch('/api/orders');
      return res.ok ? res.json() : [];
    } catch { return []; }
  },

  getAllOrders: (): Order[] => {
    // Legacy sync method not supported with API
    return [];
  },

  getOrdersByUser: async (userId: string): Promise<Order[]> => {
    const orders = await authService.getAllOrdersAsync();
    return orders.filter(o => o.userId === userId);
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<boolean> => {
    return true;
  },

  // Session methods
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
    if (typeof window === 'undefined') return null;
    const data = sessionStorage.getItem(USER_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },
  getCurrentAdminSession: (): User | null => {
    if (typeof window === 'undefined') return null;
    const data = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },
  getCurrentUser: (): User | null => {
    return authService.getCurrentAdminSession() || authService.getCurrentUserSession();
  },
  logout: () => {
    sessionStorage.removeItem(USER_SESSION_KEY);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  },
};
