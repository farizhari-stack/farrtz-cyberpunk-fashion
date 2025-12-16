/**
 * API Service for FARRTZ E-commerce
 * Connects frontend to Express.js backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token management
const getToken = (): string | null => {
    return sessionStorage.getItem('farrtz_token') || localStorage.getItem('farrtz_token');
};

const setToken = (token: string, remember: boolean = false): void => {
    if (remember) {
        localStorage.setItem('farrtz_token', token);
    } else {
        sessionStorage.setItem('farrtz_token', token);
    }
};

const removeToken = (): void => {
    sessionStorage.removeItem('farrtz_token');
    localStorage.removeItem('farrtz_token');
};

// API request helper
interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    [key: string]: any;
}

const apiRequest = async <T = any>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> => {
    const token = getToken();

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || `Error: ${response.status}`,
                ...data
            };
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Network error'
        };
    }
};

// ==================== AUTH API ====================
export const authApi = {
    register: async (firstName: string, lastName: string, email: string, password: string) => {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ firstName, lastName, email, password })
        });

        if (response.success && response.token) {
            setToken(response.token);
        }

        return response;
    },

    login: async (email: string, password: string, remember: boolean = false) => {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.success && response.token) {
            setToken(response.token, remember);
        }

        return response;
    },

    adminLogin: async (email: string, password: string) => {
        const response = await apiRequest('/auth/admin-login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        if (response.success && response.token) {
            setToken(response.token);
        }

        return response;
    },

    logout: () => {
        removeToken();
    },

    getCurrentUser: async () => {
        return apiRequest('/auth/me');
    },

    forgotPassword: async (email: string) => {
        return apiRequest('/auth/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    },

    validateResetCode: async (email: string, code: string) => {
        return apiRequest('/auth/validate-reset-code', {
            method: 'POST',
            body: JSON.stringify({ email, code })
        });
    },

    resetPassword: async (email: string, newPassword: string) => {
        return apiRequest('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ email, newPassword })
        });
    }
};

// ==================== PRODUCTS API ====================
export const productsApi = {
    getAll: async (filters?: { category?: string; search?: string; isNew?: boolean; isSale?: boolean }) => {
        const params = new URLSearchParams();
        if (filters?.category) params.append('category', filters.category);
        if (filters?.search) params.append('search', filters.search);
        if (filters?.isNew) params.append('isNew', 'true');
        if (filters?.isSale) params.append('isSale', 'true');

        const query = params.toString() ? `?${params.toString()}` : '';
        return apiRequest(`/products${query}`);
    },

    getById: async (id: number) => {
        return apiRequest(`/products/${id}`);
    },

    create: async (product: any) => {
        return apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(product)
        });
    },

    update: async (id: number, product: any) => {
        return apiRequest(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product)
        });
    },

    delete: async (id: number) => {
        return apiRequest(`/products/${id}`, {
            method: 'DELETE'
        });
    }
};

// ==================== ORDERS API ====================
export const ordersApi = {
    getAll: async () => {
        return apiRequest('/orders');
    },

    getById: async (id: string) => {
        return apiRequest(`/orders/${id}`);
    },

    create: async (orderData: {
        items: any[];
        shippingDetails: any;
        totalAmount: number;
        paymentMethod: string;
        paymentProofUrl?: string;
    }) => {
        return apiRequest('/orders', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    updateStatus: async (id: string, status: string) => {
        return apiRequest(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    uploadPaymentProof: async (id: string, paymentProofUrl: string) => {
        return apiRequest(`/orders/${id}/payment-proof`, {
            method: 'PUT',
            body: JSON.stringify({ paymentProofUrl })
        });
    }
};

// ==================== COUPONS API ====================
export const couponsApi = {
    getAll: async () => {
        return apiRequest('/coupons');
    },

    validate: async (code: string) => {
        return apiRequest('/coupons/validate', {
            method: 'POST',
            body: JSON.stringify({ code })
        });
    },

    use: async (couponId: string) => {
        return apiRequest('/coupons/use', {
            method: 'POST',
            body: JSON.stringify({ couponId })
        });
    },

    create: async (couponData: {
        code: string;
        discountPercent: number;
        expiryDate?: string;
        maxUsage?: number;
    }) => {
        return apiRequest('/coupons', {
            method: 'POST',
            body: JSON.stringify(couponData)
        });
    },

    update: async (id: string, couponData: any) => {
        return apiRequest(`/coupons/${id}`, {
            method: 'PUT',
            body: JSON.stringify(couponData)
        });
    },

    delete: async (id: string) => {
        return apiRequest(`/coupons/${id}`, {
            method: 'DELETE'
        });
    }
};

// ==================== USERS API ====================
export const usersApi = {
    getAll: async () => {
        return apiRequest('/users');
    },

    getById: async (id: string) => {
        return apiRequest(`/users/${id}`);
    },

    update: async (id: string, userData: any) => {
        return apiRequest(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(userData)
        });
    },

    // Wishlist
    addToWishlist: async (userId: string, productId: number) => {
        return apiRequest(`/users/${userId}/wishlist`, {
            method: 'POST',
            body: JSON.stringify({ productId })
        });
    },

    removeFromWishlist: async (userId: string, productId: number) => {
        return apiRequest(`/users/${userId}/wishlist/${productId}`, {
            method: 'DELETE'
        });
    },

    getWishlist: async (userId: string) => {
        return apiRequest(`/users/${userId}/wishlist`);
    }
};

// ==================== MESSAGES API ====================
export const messagesApi = {
    getMessages: async (userId?: string) => {
        const query = userId ? `?userId=${userId}` : '';
        return apiRequest(`/messages${query}`);
    },

    getConversations: async () => {
        return apiRequest('/messages/conversations');
    },

    send: async (message: string, targetUserId?: string) => {
        return apiRequest('/messages', {
            method: 'POST',
            body: JSON.stringify({ message, targetUserId })
        });
    },

    markAsRead: async (userId?: string) => {
        return apiRequest('/messages/read', {
            method: 'PUT',
            body: JSON.stringify({ userId })
        });
    }
};

// ==================== FEEDBACK API ====================
export const feedbackApi = {
    getAll: async (filters?: { status?: string; type?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.type) params.append('type', filters.type);

        const query = params.toString() ? `?${params.toString()}` : '';
        return apiRequest(`/feedback${query}`);
    },

    getMy: async () => {
        return apiRequest('/feedback/my');
    },

    create: async (feedbackData: {
        rating?: number;
        message: string;
        type: 'feedback' | 'complaint';
        photoUrl?: string;
        orderId?: string;
    }) => {
        return apiRequest('/feedback', {
            method: 'POST',
            body: JSON.stringify(feedbackData)
        });
    },

    updateStatus: async (id: string, status: string) => {
        return apiRequest(`/feedback/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    delete: async (id: string) => {
        return apiRequest(`/feedback/${id}`, {
            method: 'DELETE'
        });
    }
};

// Export token utilities for components that need them
export { getToken, setToken, removeToken };

// Default export with all APIs
export default {
    auth: authApi,
    products: productsApi,
    orders: ordersApi,
    coupons: couponsApi,
    users: usersApi,
    messages: messagesApi,
    feedback: feedbackApi
};
