-- =============================================
-- FARRTZ CYBERPUNK FASHION - CREATE TABLES
-- =============================================
-- Run this in Supabase SQL Editor
-- This creates all required tables (skip if already exist)
-- =============================================

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    avatar TEXT,
    wishlist TEXT[] DEFAULT '{}',
    "isAdmin" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    "originalPrice" DECIMAL(10,2),
    description TEXT,
    "imageUrl" TEXT,
    images TEXT[] DEFAULT '{}',
    category VARCHAR(100),
    sizes TEXT[] DEFAULT '{}',
    colors TEXT[] DEFAULT '{}',
    stock INTEGER DEFAULT 0,
    "isSale" BOOLEAN DEFAULT false,
    "isNew" BOOLEAN DEFAULT false,
    "isFeatured" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COUPONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) UNIQUE NOT NULL,
    "discountPercent" INTEGER NOT NULL,
    "expiryDate" TIMESTAMP WITH TIME ZONE,
    "isActive" BOOLEAN DEFAULT true,
    "maxUsage" INTEGER DEFAULT 100,
    "usageCount" INTEGER DEFAULT 0,
    "createdBy" UUID REFERENCES users(id),
    "createdDate" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COUPON USAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "couponId" UUID REFERENCES coupons(id) ON DELETE CASCADE,
    "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
    "usedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("couponId", "userId")
);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES users(id),
    items JSONB NOT NULL,
    "totalAmount" DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    "shippingDetails" JSONB,
    "paymentMethod" VARCHAR(50),
    "paymentProofUrl" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MESSAGES TABLE (for chat)
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES users(id),
    "userName" VARCHAR(255),
    message TEXT NOT NULL,
    sender VARCHAR(50) NOT NULL, -- 'user' or 'admin'
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- FEEDBACKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    rating INTEGER,
    status VARCHAR(50) DEFAULT 'pending', -- pending, reviewed, resolved
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders("userId");
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_messages_user ON messages("userId");
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

SELECT 'Tables created successfully!' as result;
