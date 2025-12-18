/**
 * Auth Service - localStorage Version (No Backend)
 * All data stored in browser localStorage
 */

import { User, Order } from '../types';

const USERS_KEY = 'farrtz_users_db';
const ORDERS_KEY = 'farrtz_orders_db';
const ADMIN_SESSION_KEY = 'farrtz_admin_session';
const USER_SESSION_KEY = 'farrtz_user_session';

// Default admin account
const DEFAULT_ADMIN: User = {
  id: 'admin-001',
  firstName: 'System',
  lastName: 'Admin',
  email: 'admin@gmail.com',
  password: 'admin123',
  avatar: 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png',
  wishlist: [],
  isAdmin: true
};

// Initialize users with default admin
const initializeUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  if (stored) {
    const users = JSON.parse(stored);
    // Ensure admin exists
    if (!users.find((u: User) => u.email === 'admin@gmail.com')) {
      users.push(DEFAULT_ADMIN);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
    return users;
  }
  localStorage.setItem(USERS_KEY, JSON.stringify([DEFAULT_ADMIN]));
  return [DEFAULT_ADMIN];
};

// Simulate delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Get all users
  getUsers: (): User[] => {
    return initializeUsers();
  },

  // Save/update user
  saveUser: (user: User): User => {
    const users = authService.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return user;
  },

  // Register new user
  async register(firstName: string, lastName: string, email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    await delay(500);

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
  },

  // User login
  async login(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    await delay(500);

    const users = authService.getUsers();
    const user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    if (user.isAdmin) {
      return { success: false, message: 'Please use admin login page.' };
    }

    authService.setUserSession(user);
    return { success: true, user };
  },

  // Admin login
  async adminLogin(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    await delay(300);

    const users = authService.getUsers();
    const user = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password &&
      u.isAdmin
    );

    if (!user) {
      return { success: false, message: 'Invalid admin credentials.' };
    }

    authService.setAdminSession(user);
    return { success: true, user };
  },

  // Check if admin exists
  async checkAdminExists(): Promise<boolean> {
    const users = authService.getUsers();
    return users.some(u => u.isAdmin);
  },

  // Admin registration
  async adminRegister(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    adminCode: string;
  }): Promise<{ success: boolean; user?: User; message?: string; autoLogin?: boolean }> {
    await delay(500);

    // Verify admin code - accept both codes for flexibility
    const SETUP_CODE = 'FARRTZ_SETUP_2024';
    const ADMIN_CODE = 'FARRTZ_ADMIN_2024';

    // Accept either code for registration
    const validCodes = [SETUP_CODE, ADMIN_CODE];

    if (!validCodes.includes(userData.adminCode)) {
      throw new Error(`Invalid registration code. Use: ${SETUP_CODE} or ${ADMIN_CODE}`);
    }

    const users = authService.getUsers();
    if (users.find(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error('Email already registered');
    }

    const newAdmin: User = {
      id: Date.now().toString(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      avatar: 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png',
      wishlist: [],
      isAdmin: true
    };

    authService.saveUser(newAdmin);
    authService.setAdminSession(newAdmin);

    return {
      success: true,
      user: newAdmin,
      autoLogin: true,
      message: 'Admin created successfully!'
    };
  },

  // Forgot password (simulated)
  async adminForgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
    await delay(500);

    const users = authService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.isAdmin);

    if (!user) {
      throw new Error('Admin email not found');
    }

    // In localStorage version, just show the password
    alert(`[DEV MODE] Your password is: ${user.password}`);
    return { success: true, message: 'Password shown in alert (dev mode)' };
  },

  // Update password
  async adminUpdatePassword(newPassword: string): Promise<{ success: boolean; message?: string }> {
    await delay(300);

    const admin = authService.getCurrentAdminSession();
    if (!admin) {
      throw new Error('Not logged in');
    }

    const users = authService.getUsers();
    const index = users.findIndex(u => u.id === admin.id);
    if (index >= 0) {
      users[index].password = newPassword;
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    return { success: true, message: 'Password updated!' };
  },

  // Update user
  async updateUser(updatedUser: User): Promise<{ success: boolean; user?: User }> {
    await delay(300);
    authService.saveUser(updatedUser);

    if (updatedUser.isAdmin) {
      authService.setAdminSession(updatedUser);
    } else {
      authService.setUserSession(updatedUser);
    }

    return { success: true, user: updatedUser };
  },

  // Session management
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
    const data = sessionStorage.getItem(USER_SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },

  getCurrentAdminSession: (): User | null => {
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

  logoutUser: () => {
    sessionStorage.removeItem(USER_SESSION_KEY);
  },

  logoutAdmin: () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  },

  // Orders
  createOrder: async (order: Order): Promise<{ success: boolean; message?: string }> => {
    await delay(300);
    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    orders.push({ ...order, id: Date.now().toString(), createdAt: new Date().toISOString() });
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return { success: true };
  },

  getAllOrders: (): Order[] => {
    return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  },

  getAllOrdersAsync: async (): Promise<Order[]> => {
    await delay(100);
    return authService.getAllOrders();
  },

  getOrdersByUser: async (userId: string): Promise<Order[]> => {
    await delay(100);
    const orders = authService.getAllOrders();
    return orders.filter(o => o.userId === userId);
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<boolean> => {
    await delay(200);
    const orders = authService.getAllOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index >= 0) {
      orders[index].status = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      return true;
    }
    return false;
  }
};
