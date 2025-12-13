
import { User, Order } from '../types';
import emailjs from '@emailjs/browser';

const USERS_KEY = 'farrtz_users_db';
const ADMIN_SESSION_KEY = 'farrtz_admin_session';
const USER_SESSION_KEY = 'farrtz_user_session';
const ORDERS_KEY = 'farrtz_orders_db';
// Key to store temporary reset codes: { email: { code: string, expires: number } }
const RESET_CODES_KEY = 'farrtz_reset_codes';

// --- KONFIGURASI EMAILJS (GANTI DENGAN PUNYA ANDA) ---
// 1. Daftar di emailjs.com
// 2. Buat Service (Gmail) -> dapat Service ID
// 3. Buat Email Template -> dapat Template ID
// 4. Ambil Public Key di Account Settings
const EMAILJS_SERVICE_ID = 'service_jhajp2d';
const EMAILJS_TEMPLATE_ID = 'template_fmc5xpj';
const EMAILJS_PUBLIC_KEY = 'eMXPedz89SSbeq6zC';

// Simulate a database delay for realism
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // --- DATABASE OPERATIONS ---

  getUsers: (): User[] => {
    const usersStr = localStorage.getItem(USERS_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  },

  saveUser: (user: User) => {
    const users = authService.getUsers();
    // Check if user exists, update if so, else push
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  // --- ORDER OPERATIONS ---

  createOrder: async (order: Order): Promise<{ success: boolean; message?: string }> => {
    await delay(1000); // Simulate processing
    try {
      const ordersStr = localStorage.getItem(ORDERS_KEY);
      const orders: Order[] = ordersStr ? JSON.parse(ordersStr) : [];
      orders.push(order);
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Failed to save order' };
    }
  },

  getOrdersByUser: (userId: string): Order[] => {
    const ordersStr = localStorage.getItem(ORDERS_KEY);
    const orders: Order[] = ordersStr ? JSON.parse(ordersStr) : [];
    return orders.filter(o => o.userId === userId);
  },

  getAllOrders: (): Order[] => {
    const ordersStr = localStorage.getItem(ORDERS_KEY);
    return ordersStr ? JSON.parse(ordersStr) : [];
  },

  updateOrderStatus: async (orderId: string, status: Order['status']): Promise<boolean> => {
    await delay(500);
    const orders = authService.getAllOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      return true;
    }
    return false;
  },

  // --- AUTH OPERATIONS ---

  async register(firstName: string, lastName: string, email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    await delay(800); // Fake network delay

    const users = authService.getUsers();

    // Check if user already exists
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: 'Email already registered.' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      password, // In a real app, this would be hashed!
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${firstName}`,
      wishlist: [],
      isAdmin: false
    };

    authService.saveUser(newUser);
    return { success: true, user: newUser };
  },

  async login(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    await delay(800); // Fake network delay

    const users = authService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);

    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    // Don't allow admin login through user login
    if (user.isAdmin) {
      return { success: false, message: 'Please use admin login page.' };
    }

    // Initialize wishlist if undefined
    if (!user.wishlist) user.wishlist = [];

    // Create user session
    authService.setUserSession(user);

    return { success: true, user };
  },

  async adminLogin(email: string, password: string): Promise<{ success: boolean; message?: string; user?: User }> {
    await delay(800); // Fake network delay

    // HARDCODED ADMIN CHECK
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
      return { success: true, user: adminUser };
    }

    return { success: false, message: 'Invalid admin credentials.' };
  },

  async updateUser(updatedUser: User): Promise<{ success: boolean; user?: User }> {
    await delay(500);

    // Update in DB
    authService.saveUser(updatedUser);

    // Update in appropriate Session
    if (updatedUser.isAdmin) {
      authService.setAdminSession(updatedUser);
    } else {
      authService.setUserSession(updatedUser);
    }

    return { success: true, user: updatedUser };
  },

  logoutUser: () => {
    sessionStorage.removeItem(USER_SESSION_KEY);
  },

  logoutAdmin: () => {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  },

  // --- PASSWORD RESET LOGIC ---

  async initiatePasswordReset(email: string): Promise<{ success: boolean; message?: string }> {
    await delay(1000);

    // 1. Check if user exists
    const users = authService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    // Also allow admin to reset self (simulation)
    const isAdmin = email === 'admin@gmail.com';

    if (!user && !isAdmin) {
      return { success: false, message: 'Email address not found in our records.' };
    }

    // 2. Generate 5-digit code
    const code = Math.floor(10000 + Math.random() * 90000).toString();
    const expires = Date.now() + 5 * 60 * 1000; // 5 minutes from now

    // 3. Store code
    const resetCodes = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || '{}');
    resetCodes[email] = { code, expires };
    localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));

    // 4. Send Email via EmailJS
    console.log(`[AUTH] Generating code for ${email}: ${code}`);

    // CHECK: Have you replaced all placeholders?
    // We check if ANY of them are still placeholders. If so, use simulation.
    // Casting to string to avoid TS error if constants are inferred as literals that don't overlap with placeholders
    if ((EMAILJS_SERVICE_ID as string) === 'YOUR_SERVICE_ID' || (EMAILJS_TEMPLATE_ID as string) === 'YOUR_TEMPLATE_ID' || (EMAILJS_PUBLIC_KEY as string) === 'YOUR_PUBLIC_KEY') {
      // Fallback to alert if user hasn't configured ALL keys yet
      alert(`[DEV MODE] EmailJS incomplete configuration.\n\nSimulated Email to: ${email}\nCode: ${code}\n\nPlease set Template ID and Public Key in services/auth.ts`);
      return { success: true, message: 'Code simulated (Configure EmailJS for real emails)' };
    }

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_name: user ? user.firstName : 'Admin',
          to_email: email,
          code: code,
          // INI PERUBAHAN PENTING:
          // Kita masukkan Kode langsung ke dalam variabel 'message'.
          // Template default EmailJS biasanya pasti menampilkan variabel {{message}}.
          message: `KODE RESET PASSWORD ANDA ADALAH: ${code}. (Berlaku 5 menit)`
        },
        EMAILJS_PUBLIC_KEY
      );
      return { success: true, message: 'Code sent to your email' };
    } catch (error) {
      console.error('EmailJS Error:', error);
      return { success: false, message: 'Failed to send email. Check network or API keys.' };
    }
  },

  async validateResetCode(email: string, code: string): Promise<{ success: boolean; message?: string }> {
    await delay(800);
    const resetCodes = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || '{}');
    const record = resetCodes[email];

    if (!record) {
      return { success: false, message: 'No reset request found for this email.' };
    }

    if (Date.now() > record.expires) {
      return { success: false, message: 'Code has expired. Please request a new one.' };
    }

    if (record.code !== code) {
      return { success: false, message: 'Invalid code. Please try again.' };
    }

    return { success: true };
  },

  async completePasswordReset(email: string, newPassword: string): Promise<{ success: boolean; message?: string }> {
    await delay(1000);

    // Hardcoded Admin
    if (email === 'admin@gmail.com') {
      return { success: false, message: 'Cannot reset hardcoded admin password in demo.' };
    }

    const users = authService.getUsers();
    const index = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

    if (index === -1) {
      return { success: false, message: 'User not found.' };
    }

    // Update password
    users[index].password = newPassword;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Clean up reset code
    const resetCodes = JSON.parse(localStorage.getItem(RESET_CODES_KEY) || '{}');
    delete resetCodes[email];
    localStorage.setItem(RESET_CODES_KEY, JSON.stringify(resetCodes));

    return { success: true, message: 'Password updated successfully' };
  },

  // --- SESSION MANAGEMENT ---

  setUserSession: (user: User) => {
    // Don't store password in session
    const safeUser = { ...user };
    delete safeUser.password;
    sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(safeUser));
  },

  setAdminSession: (user: User) => {
    // Don't store password in session
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

  // Legacy method for backward compatibility
  getCurrentUser: (): User | null => {
    // Check both sessions, prioritize admin
    return authService.getCurrentAdminSession() || authService.getCurrentUserSession();
  }
};
