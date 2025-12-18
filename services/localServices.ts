/**
 * Services - localStorage Version (No Backend)
 * All data stored in browser localStorage
 */

import { Feedback, ChatConversation, ChatMessage, Coupon, Product } from '../types';

const FEEDBACKS_KEY = 'farrtz_feedbacks';
const MESSAGES_KEY = 'farrtz_messages';
const COUPONS_KEY = 'farrtz_coupons';
const PRODUCTS_KEY = 'farrtz_products';

// Helper delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// =============================================
// FEEDBACK SERVICE
// =============================================
export const feedbackService = {
    getAllFeedback: async (): Promise<Feedback[]> => {
        await delay(100);
        const data = localStorage.getItem(FEEDBACKS_KEY);
        return data ? JSON.parse(data) : [];
    },

    createFeedback: async (feedback: Omit<Feedback, 'id'>): Promise<Feedback> => {
        await delay(200);
        const feedbacks = await feedbackService.getAllFeedback();
        const newFeedback: Feedback = {
            ...feedback,
            id: Date.now().toString()
        };
        feedbacks.unshift(newFeedback);
        localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(feedbacks));
        return newFeedback;
    },

    updateFeedbackStatus: async (id: string, status: Feedback['status']): Promise<Feedback | null> => {
        await delay(100);
        const feedbacks = await feedbackService.getAllFeedback();
        const index = feedbacks.findIndex(f => f.id === id);
        if (index >= 0) {
            feedbacks[index].status = status;
            localStorage.setItem(FEEDBACKS_KEY, JSON.stringify(feedbacks));
            return feedbacks[index];
        }
        return null;
    }
};

// =============================================
// MESSAGES SERVICE
// =============================================
export const messagesService = {
    getAllMessages: async (): Promise<ChatConversation[]> => {
        await delay(100);
        const data = localStorage.getItem(MESSAGES_KEY);
        return data ? JSON.parse(data) : [];
    },

    sendMessage: async (messageData: {
        userId: string;
        userName?: string;
        message: string;
        sender: 'user' | 'admin';
    }): Promise<boolean> => {
        await delay(100);
        const conversations = await messagesService.getAllMessages();

        let conversation = conversations.find(c => c.userId === messageData.userId);

        const newMessage: ChatMessage = {
            id: Date.now().toString(),
            userId: messageData.userId,
            userName: messageData.userName || 'User',
            message: messageData.message,
            sender: messageData.sender,
            timestamp: new Date().toISOString(),
            read: messageData.sender === 'admin'
        };

        if (conversation) {
            conversation.messages.push(newMessage);
            conversation.lastMessageTime = new Date().toISOString();
            if (messageData.sender === 'admin') {
                conversation.unreadCount = 0;
            } else {
                conversation.unreadCount++;
            }
        } else {
            conversation = {
                userId: messageData.userId,
                userName: messageData.userName || 'User',
                userEmail: '',
                messages: [newMessage],
                lastMessageTime: new Date().toISOString(),
                unreadCount: messageData.sender === 'user' ? 1 : 0
            };
            conversations.push(conversation);
        }

        localStorage.setItem(MESSAGES_KEY, JSON.stringify(conversations));
        return true;
    },

    markAsRead: async (userId: string): Promise<boolean> => {
        await delay(50);
        const conversations = await messagesService.getAllMessages();
        const conversation = conversations.find(c => c.userId === userId);
        if (conversation) {
            conversation.unreadCount = 0;
            localStorage.setItem(MESSAGES_KEY, JSON.stringify(conversations));
        }
        return true;
    }
};

// =============================================
// COUPONS SERVICE
// =============================================
export const couponsService = {
    getAllCoupons: async (): Promise<Coupon[]> => {
        await delay(100);
        const data = localStorage.getItem(COUPONS_KEY);
        return data ? JSON.parse(data) : [];
    },

    createCoupon: async (coupon: Omit<Coupon, 'id' | 'createdDate' | 'usageCount' | 'usedBy'>): Promise<Coupon> => {
        await delay(200);
        const coupons = await couponsService.getAllCoupons();
        const newCoupon: Coupon = {
            ...coupon,
            id: Date.now().toString(),
            createdDate: new Date().toISOString(),
            usageCount: 0,
            usedBy: []
        };
        coupons.unshift(newCoupon);
        localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
        return newCoupon;
    },

    toggleCouponStatus: async (id: string): Promise<Coupon | null> => {
        await delay(100);
        const coupons = await couponsService.getAllCoupons();
        const index = coupons.findIndex(c => c.id === id);
        if (index >= 0) {
            coupons[index].isActive = !coupons[index].isActive;
            localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
            return coupons[index];
        }
        return null;
    },

    deleteCoupon: async (id: string): Promise<boolean> => {
        await delay(100);
        const coupons = await couponsService.getAllCoupons();
        const filtered = coupons.filter(c => c.id !== id);
        localStorage.setItem(COUPONS_KEY, JSON.stringify(filtered));
        return true;
    },

    useCoupon: async (couponId: string): Promise<boolean> => {
        await delay(100);
        const coupons = await couponsService.getAllCoupons();
        const index = coupons.findIndex(c => c.id === couponId);
        if (index >= 0) {
            coupons[index].usageCount++;
            localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
            return true;
        }
        return false;
    }
};

// =============================================
// PRODUCTS SERVICE (for admin CRUD)
// =============================================
export const productsApiService = {
    getAll: async (): Promise<{ success: boolean; products?: Product[] }> => {
        await delay(100);
        const data = localStorage.getItem(PRODUCTS_KEY);
        return { success: true, products: data ? JSON.parse(data) : [] };
    },

    create: async (product: Omit<Product, 'id'>): Promise<{ success: boolean; product?: Product }> => {
        await delay(200);
        const result = await productsApiService.getAll();
        const products = result.products || [];
        const newProduct: Product = {
            ...product,
            id: Date.now()
        };
        products.push(newProduct);
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
        return { success: true, product: newProduct };
    },

    update: async (id: number, product: Partial<Product>): Promise<{ success: boolean; product?: Product }> => {
        await delay(100);
        const result = await productsApiService.getAll();
        const products = result.products || [];
        const index = products.findIndex(p => p.id === id);
        if (index >= 0) {
            products[index] = { ...products[index], ...product };
            localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
            return { success: true, product: products[index] };
        }
        return { success: false };
    },

    delete: async (id: number): Promise<{ success: boolean }> => {
        await delay(100);
        const result = await productsApiService.getAll();
        const products = result.products || [];
        const filtered = products.filter(p => p.id !== id);
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(filtered));
        return { success: true };
    }
};
