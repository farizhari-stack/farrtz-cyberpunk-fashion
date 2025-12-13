
export interface Product {
  id: number;
  title: string;
  price: number; // Final selling price
  originalPrice?: number; // Base price before discount
  discountPercentage?: number; // Discount in %
  discountEndTime?: string; // ISO String for Flash Sale Expiry
  imageUrl: string;
  category: string;
  description?: string; // Product description
  isNew?: boolean;
  isSale?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface Statistic {
  label: string;
  value: string;
  description: string;
}

export interface CartItem {
  id: number;
  productId: number;
  title: string;
  price: number;
  quantity: number;
  imageUrl: string;
  details: {
    [key: string]: string;
  };
  selected: boolean;
  originalPrice?: number; // Added for discount calc
  isSale?: boolean; // Added for discount calc
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string; // Only used internally, scrubbed for session
  avatar?: string;
  address?: string; // Kota/Alamat
  wishlist?: number[]; // Array of Product IDs
  isAdmin?: boolean; // New Admin Flag
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  shippingDetails: any;
  totalAmount: number;
  // Added 'confirmed' to status types
  status: 'pending' | 'confirmed' | 'paid' | 'packing' | 'shipped' | 'delivered';
  date: string;
  paymentMethod: 'bank' | 'cod';
  paymentProofUrl?: string; // Base64 string of the uploaded image
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number; // 1-5 stars
  message: string;
  type: 'feedback' | 'complaint';
  photoUrl?: string; // For complaint photos
  orderId?: string;
  date: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  sender: 'user' | 'admin';
  timestamp: string;
  read: boolean;
}

export interface ChatConversation {
  userId: string;
  userName: string;
  userEmail: string;
  messages: ChatMessage[];
  lastMessageTime: string;
  unreadCount: number;
}

export interface Coupon {
  id: string;
  code: string; // Random generated code (e.g., "CYBER20")
  discountPercent: number; // 5, 10, 15, 20, etc.
  createdDate: string;
  expiryDate?: string; // Optional expiry
  isActive: boolean;
  usageCount: number;
  maxUsage?: number; // Optional usage limit
  createdBy: string; // Admin ID
  usedBy: string[]; // Array of user IDs who have used this coupon
}

export type PageType = 'home' | 'login' | 'register' | 'product-detail' | 'cart' | 'checkout' | 'order-history' | 'account-settings' | 'favorites' | 'all-products' | 'admin-dashboard';
