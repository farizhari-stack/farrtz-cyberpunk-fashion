(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/utils/products.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "generateMixedProducts",
    ()=>generateMixedProducts,
    "generateProducts",
    ()=>generateProducts,
    "getCategoryBasePrice",
    ()=>getCategoryBasePrice,
    "getProductById",
    ()=>getProductById,
    "getProductImage",
    ()=>getProductImage,
    "getProductTitle",
    ()=>getProductTitle
]);
const getProductTitle = (category, index)=>{
    const titles = {
        'T-shirt': [
            'NEON ORB Surreal Eye Portrait T-Shirt',
            'Neon Flamingo Vaporwave Tropic T-Shirt',
            'Porcelain Memory — Vintage Doll Study T-Shirt',
            'CHROME SERAPHIM — CHR-01: Halo Requiem T-Shirt',
            'Tiger Storm Seal — Unit RAIJIN T-Shirt',
            'Cyber Fox Emblem — Tactical Mode T-Shirt',
            'Vortex Serpent — Spindel Core (VOID-01) T-Shirt',
            'RAIJU KITSUNE — Plasma Eclipse Form T-Shirt'
        ],
        'Bags': [
            'NEON ORB Surreal Eye Portrait Bag',
            'Holo-Sheen Crossbody Messenger',
            'Urban Drifter Tech Tote',
            'Quantum Duffel Bag - Series 7',
            'Stealth Courier Pack v2',
            'Neon Trim Sling Bag',
            'Data-Runner Hard Shell Satchel',
            'Void Storage Unit - Black'
        ],
        'Hats': [
            'NEON ORB Surreal Eye Portrait Hat',
            'Neon Visor v2 - Cyan',
            'Street Samurai Snapback',
            'Digital Camo Bucket Hat',
            'Cyber-Goth Beanie',
            'Chromed Out Trucker Hat',
            'LED Display Cap - Programmable',
            'Night City Embroidered Beanie'
        ],
        'Hoodies': [
            'Tech-Fleece Oversized Hoodie',
            'Glitch Camo Zip-Up',
            'Netrunner Graphic Pullover',
            'Void Black Mantle',
            'Cyber-Samurai Tech Hoodie',
            'Neon Stitch Heavyweight Hoodie',
            'Hacker Silhouette Sweatshirt',
            'Urban Ninja Shell Jacket'
        ],
        'Tank Tops': [
            'NEON ORB Surreal Eye Portrait Tank Top',
            'Mesh Grid Runner Vest',
            'Neon Trim Workout Tank',
            'Bio-Mech Sleeveless Top',
            'Core Temperature Regulating Tank',
            'Flux Flow Yoga Top',
            'Sector 7 Sports Jersey',
            'Rebel Scum Distressed Tank'
        ],
        'Kids': [
            'Vintage Doll Study Kids T-Shirt',
            'Future Hero Onesie',
            'Robo-Pup Graphic Tee',
            'Little Glitch Hoodie',
            'Pixel Art Cap - Kids Size',
            'Neon Kids Light-Up Sneakers',
            'Junior Space Ranger Tee',
            'Tiny Tech Vest'
        ],
        'Shorts': [
            'Neon Flamingo Vaporwave Tropic Shorts',
            'Urban Utility Bermudas',
            'Neon Runner Athletic Shorts',
            'Digital Camo Sweat Shorts',
            'Flux Performance Shorts',
            'Tactical Knee-Length Shorts',
            'Street Basketball Mesh Shorts',
            'Swim Grid Trunks'
        ]
    };
    // Fallback if index exceeds array length
    const categoryTitles = titles[category] || titles['T-shirt'];
    return categoryTitles[index % categoryTitles.length];
};
const getProductImage = (category, id)=>{
    // Map categories to local assets in /public
    // Next.js serves files in /public at the root URL path
    switch(category){
        case 'T-shirt':
            return id % 2 === 0 ? "/tshirt-black-futures-edge.png" : "/tshirt-white-techwear.png";
        case 'Bags':
            return "/icons/bag-3d.png";
        case 'Hats':
            return "/icons/hat-3d.png";
        case 'Hoodies':
            return "/icons/hoodie-3d.png";
        case 'Kids':
            return "/icons/kids-3d.png";
        case 'Shorts':
            return "/icons/shorts-3d.png";
        case 'Tank Tops':
            // Fallback or use banner if no specific icon
            return "/tshirt-white-techwear.png";
        default:
            return "/cyberpunk-robot.png";
    }
};
const getCategoryBasePrice = (category)=>{
    switch(category){
        case 'Bags':
            return 100000;
        case 'Hats':
            return 65000;
        case 'Hoodies':
            return 350000;
        case 'Tank Tops':
            return 120000;
        case 'Kids':
            return 150000;
        case 'Shorts':
            return 100000;
        case 'T-shirt':
        default:
            return 250000;
    }
};
const generateProducts = (category, count, startId, isSale = false)=>{
    const basePrice = getCategoryBasePrice(category);
    return Array.from({
        length: count
    }).map((_, i)=>({
            id: startId + i,
            title: getProductTitle(category, i),
            price: isSale ? basePrice * 0.5 : basePrice,
            originalPrice: isSale ? basePrice : undefined,
            imageUrl: getProductImage(category, startId + i),
            category: category,
            isSale: isSale,
            isNew: i < 2 // Mark first two as new
        }));
};
const generateMixedProducts = (count, startId)=>{
    const categories = [
        'T-shirt',
        'Bags',
        'Hats',
        'Hoodies',
        'Tank Tops',
        'Kids',
        'Shorts'
    ];
    return Array.from({
        length: count
    }).map((_, i)=>{
        const category = categories[i % categories.length];
        const basePrice = getCategoryBasePrice(category);
        return {
            id: startId + i,
            title: getProductTitle(category, i),
            price: basePrice,
            originalPrice: undefined,
            imageUrl: getProductImage(category, startId + i),
            category: category,
            isSale: false,
            isNew: i < 3 // Mark a few as new
        };
    });
};
const getProductById = (id)=>{
    // We search through our standard sets of generated data
    // This is a simulation since we don't have a real DB
    const allGeneratedProducts = [
        ...generateMixedProducts(8, 100),
        ...generateMixedProducts(4, 200).map((p)=>({
                ...p,
                isSale: true,
                price: p.price * 0.5,
                originalPrice: p.price
            })),
        ...generateMixedProducts(16, 300),
        // Add some category specific ranges just in case
        ...generateProducts('T-shirt', 20, 500),
        ...generateProducts('Bags', 20, 600),
        ...generateProducts('Hats', 20, 700),
        ...generateProducts('Hoodies', 20, 800),
        ...generateProducts('Tank Tops', 20, 900)
    ];
    return allGeneratedProducts.find((p)=>p.id === id);
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/utils/couponUtils.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "calculateDiscount",
    ()=>calculateDiscount,
    "formatCouponDiscount",
    ()=>formatCouponDiscount,
    "generateCouponCode",
    ()=>generateCouponCode,
    "generateUniqueCouponCode",
    ()=>generateUniqueCouponCode,
    "isCouponExpired",
    ()=>isCouponExpired,
    "validateCoupon",
    ()=>validateCoupon
]);
const generateCouponCode = (length = 8)=>{
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for(let i = 0; i < length; i++){
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
};
const validateCoupon = (code, coupons, userId)=>{
    if (!code || code.trim() === '') {
        return {
            valid: false,
            error: 'Please enter a coupon code'
        };
    }
    // Find coupon (case-insensitive)
    const coupon = coupons.find((c)=>c.code.toUpperCase() === code.trim().toUpperCase());
    if (!coupon) {
        return {
            valid: false,
            error: 'Invalid coupon code'
        };
    }
    if (!coupon.isActive) {
        return {
            valid: false,
            error: 'This coupon is no longer active'
        };
    }
    if (isCouponExpired(coupon)) {
        return {
            valid: false,
            error: 'This coupon has expired'
        };
    }
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
        return {
            valid: false,
            error: 'This coupon has reached its usage limit'
        };
    }
    // Check if user has already used this coupon
    if (userId && coupon.usedBy && coupon.usedBy.includes(userId)) {
        return {
            valid: false,
            error: 'You have already used this coupon'
        };
    }
    return {
        valid: true,
        coupon
    };
};
const calculateDiscount = (subtotal, coupon)=>{
    return Math.floor(subtotal * coupon.discountPercent / 100);
};
const isCouponExpired = (coupon)=>{
    if (!coupon.expiryDate) return false;
    return new Date(coupon.expiryDate) < new Date();
};
const formatCouponDiscount = (coupon)=>{
    return `-${coupon.discountPercent}%`;
};
const generateUniqueCouponCode = (existingCoupons)=>{
    let code = generateCouponCode();
    let attempts = 0;
    // Ensure uniqueness
    while(existingCoupons.some((c)=>c.code === code) && attempts < 10){
        code = generateCouponCode();
        attempts++;
    }
    return code;
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/productService.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "productService",
    ()=>productService
]);
const productService = {
    initialize: ()=>{
    // No-op
    },
    getAllProducts: async ()=>{
        try {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            return data;
        } catch (e) {
            console.error(e);
            return [];
        }
    },
    getAllProductsAsync: async ()=>{
        return productService.getAllProducts();
    },
    getAllProductsSync: ()=>{
        console.warn("getAllProductsSync is deprecated in Next.js version");
        return [];
    },
    saveProduct: async (product)=>{
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            });
            const data = await res.json();
            return {
                success: res.ok,
                product: data
            };
        } catch (e) {
            return {
                success: false
            };
        }
    },
    deleteProduct: async (id)=>{
    // Implement DELETE API if needed
    },
    getProductById: (id)=>{
        // Cannot be sync anymore. Return undefined.
        return undefined;
    },
    getProductsByCategory: (category)=>{
        // Cannot be sync.
        return [];
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authService",
    ()=>authService
]);
const USER_SESSION_KEY = 'farrtz_user_session';
const ADMIN_SESSION_KEY = 'farrtz_admin_session';
const authService = {
    // Login
    async login (email, password) {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });
            const data = await res.json();
            if (data.success && data.user) {
                if (!data.user.isAdmin) {
                    authService.setUserSession(data.user);
                } else {
                    return {
                        success: false,
                        message: 'Please use admin login page.'
                    };
                }
            }
            return data;
        } catch (e) {
            return {
                success: false,
                message: 'Network error'
            };
        }
    },
    async adminLogin (email, password) {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });
            const data = await res.json();
            if (data.success && data.user) {
                if (data.user.isAdmin) {
                    authService.setAdminSession(data.user);
                } else {
                    return {
                        success: false,
                        message: 'Not an admin account.'
                    };
                }
            }
            return data;
        } catch (e) {
            return {
                success: false,
                message: 'Network error'
            };
        }
    },
    async register (firstName, lastName, email, password) {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${firstName}`
                })
            });
            const data = await res.json();
            if (data.success) {
                authService.setUserSession(data.user);
            }
            return data;
        } catch (e) {
            return {
                success: false,
                message: 'Network error'
            };
        }
    },
    async checkAdminExists () {
        // Mock true or fetch check
        return true;
    },
    async adminRegister (userData) {
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...userData,
                    isAdmin: true
                })
            });
            const data = await res.json();
            if (data.success) {
                authService.setAdminSession(data.user);
                return {
                    success: true,
                    user: data.user,
                    autoLogin: true
                };
            }
            return data;
        } catch (e) {
            return {
                success: false,
                message: 'Network error'
            };
        }
    },
    async adminUpdatePassword (newPassword) {
        // Implement password update logic here (API call)
        return {
            success: true,
            message: 'Password updated'
        };
    },
    async updateUser (user) {
        try {
            const res = await fetch('/api/auth/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            const data = await res.json();
            if (data.success && data.user) {
                // Update session
                const currentSession = authService.getCurrentUserSession();
                if (currentSession && currentSession.id === data.user.id) {
                    authService.setUserSession(data.user);
                }
                const currentAdmin = authService.getCurrentAdminSession();
                if (currentAdmin && currentAdmin.id === data.user.id) {
                    authService.setAdminSession(data.user);
                }
            }
            return data;
        } catch (e) {
            return {
                success: false,
                message: 'Update failed'
            };
        }
    },
    // Orders
    createOrder: async (order)=>{
        await fetch('/api/orders', {
            method: 'POST',
            body: JSON.stringify(order)
        });
        return {
            success: true
        };
    },
    getAllOrdersAsync: async ()=>{
        try {
            const res = await fetch('/api/orders');
            return res.ok ? res.json() : [];
        } catch  {
            return [];
        }
    },
    getAllOrders: ()=>{
        // Legacy sync method not supported with API
        return [];
    },
    getOrdersByUser: async (userId)=>{
        const orders = await authService.getAllOrdersAsync();
        return orders.filter((o)=>o.userId === userId);
    },
    updateOrderStatus: async (orderId, status)=>{
        return true;
    },
    // Session methods
    setUserSession: (user)=>{
        const safeUser = {
            ...user
        };
        delete safeUser.password;
        sessionStorage.setItem(USER_SESSION_KEY, JSON.stringify(safeUser));
    },
    setAdminSession: (user)=>{
        const safeUser = {
            ...user
        };
        delete safeUser.password;
        sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(safeUser));
    },
    getCurrentUserSession: ()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const data = sessionStorage.getItem(USER_SESSION_KEY);
        return data ? JSON.parse(data) : null;
    },
    getCurrentAdminSession: ()=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        const data = sessionStorage.getItem(ADMIN_SESSION_KEY);
        return data ? JSON.parse(data) : null;
    },
    getCurrentUser: ()=>{
        return authService.getCurrentAdminSession() || authService.getCurrentUserSession();
    },
    logout: ()=>{
        sessionStorage.removeItem(USER_SESSION_KEY);
        sessionStorage.removeItem(ADMIN_SESSION_KEY);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/services/localServices.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "couponsService",
    ()=>couponsService,
    "feedbackService",
    ()=>feedbackService,
    "messagesService",
    ()=>messagesService,
    "productsApiService",
    ()=>productsApiService
]);
const feedbackService = {
    getAllFeedback: async ()=>{
        try {
            const res = await fetch('/api/feedbacks');
            return res.ok ? res.json() : [];
        } catch  {
            return [];
        }
    },
    createFeedback: async (feedback)=>{
        try {
            const res = await fetch('/api/feedbacks', {
                method: 'POST',
                body: JSON.stringify(feedback)
            });
            return res.json();
        } catch  {
            return null;
        }
    },
    updateFeedbackStatus: async (id, status)=>{
        return null;
    }
};
const messagesService = {
    getAllMessages: async ()=>{
        try {
            const res = await fetch('/api/messages');
            return res.ok ? res.json() : [];
        } catch  {
            return [];
        }
    },
    sendMessage: async (messageData)=>{
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                body: JSON.stringify(messageData)
            });
            return res.ok;
        } catch  {
            return false;
        }
    },
    markAsRead: async (userId)=>{
        return true;
    }
};
const couponsService = {
    getAllCoupons: async ()=>{
        try {
            const res = await fetch('/api/coupons');
            return res.ok ? res.json() : [];
        } catch  {
            return [];
        }
    },
    createCoupon: async (coupon)=>{
        try {
            const res = await fetch('/api/coupons', {
                method: 'POST',
                body: JSON.stringify(coupon)
            });
            return res.json();
        } catch  {
            return null;
        }
    },
    toggleCouponStatus: async (id)=>{
        return null;
    },
    deleteCoupon: async (id)=>{
        return true;
    },
    useCoupon: async (couponId)=>{
        return true;
    }
};
const productsApiService = {
    getAll: async ()=>{
        return {
            success: true,
            products: []
        };
    },
    create: async (product)=>{
        // Could redirect to productService
        return {
            success: false
        };
    },
    update: async (id, product)=>{
        return {
            success: false
        };
    },
    delete: async (id)=>{
        return {
            success: false
        };
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_9985fda1._.js.map