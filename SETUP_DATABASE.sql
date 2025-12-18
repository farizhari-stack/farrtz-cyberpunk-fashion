-- =============================================
-- FARRTZ CYBERPUNK FASHION
-- COMPLETE DATABASE SETUP FROM SCRATCH
-- =============================================
-- Jalankan script ini di Supabase SQL Editor
-- Ini akan: DROP semua tabel lama → CREATE tabel baru → Setup RLS
-- =============================================

-- =============================================
-- STEP 1: DROP SEMUA TABEL YANG ADA
-- =============================================
DROP TABLE IF EXISTS coupon_usages CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS feedbacks CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- STEP 2: CREATE TABEL USERS
-- =============================================
CREATE TABLE users (
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
-- STEP 3: CREATE TABEL PRODUCTS
-- =============================================
CREATE TABLE products (
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
-- STEP 4: CREATE TABEL COUPONS
-- =============================================
CREATE TABLE coupons (
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
-- STEP 5: CREATE TABEL COUPON USAGES
-- =============================================
CREATE TABLE coupon_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "couponId" UUID REFERENCES coupons(id) ON DELETE CASCADE,
    "userId" UUID REFERENCES users(id) ON DELETE CASCADE,
    "usedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("couponId", "userId")
);

-- =============================================
-- STEP 6: CREATE TABEL ORDERS
-- =============================================
CREATE TABLE orders (
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
-- STEP 7: CREATE TABEL MESSAGES
-- =============================================
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID REFERENCES users(id),
    "userName" VARCHAR(255),
    message TEXT NOT NULL,
    sender VARCHAR(50) NOT NULL,
    "isRead" BOOLEAN DEFAULT false,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 8: CREATE TABEL FEEDBACKS
-- =============================================
CREATE TABLE feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    rating INTEGER,
    status VARCHAR(50) DEFAULT 'pending',
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STEP 9: CREATE INDEXES
-- =============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user ON orders("userId");
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_messages_user ON messages("userId");
CREATE INDEX idx_coupons_code ON coupons(code);

-- =============================================
-- STEP 10: ENABLE ROW LEVEL SECURITY
-- =============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STEP 11: CREATE RLS POLICIES - USERS
-- =============================================
CREATE POLICY "Allow public read users" ON users
FOR SELECT USING (true);

CREATE POLICY "Allow public insert users" ON users
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- =============================================
-- STEP 12: CREATE RLS POLICIES - PRODUCTS
-- =============================================
CREATE POLICY "Allow public read products" ON products
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert products" ON products
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update products" ON products
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete products" ON products
FOR DELETE TO authenticated USING (true);

-- =============================================
-- STEP 13: CREATE RLS POLICIES - COUPONS
-- =============================================
CREATE POLICY "Allow public read coupons" ON coupons
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert coupons" ON coupons
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update coupons" ON coupons
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete coupons" ON coupons
FOR DELETE TO authenticated USING (true);

-- =============================================
-- STEP 14: CREATE RLS POLICIES - COUPON USAGES
-- =============================================
CREATE POLICY "Allow authenticated read coupon_usages" ON coupon_usages
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert coupon_usages" ON coupon_usages
FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- STEP 15: CREATE RLS POLICIES - ORDERS
-- =============================================
CREATE POLICY "Allow authenticated read orders" ON orders
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated insert orders" ON orders
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update orders" ON orders
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- STEP 16: CREATE RLS POLICIES - MESSAGES
-- =============================================
CREATE POLICY "Allow public read messages" ON messages
FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert messages" ON messages
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated update messages" ON messages
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- STEP 17: CREATE RLS POLICIES - FEEDBACKS
-- =============================================
CREATE POLICY "Allow public read feedbacks" ON feedbacks
FOR SELECT USING (true);

CREATE POLICY "Allow public insert feedbacks" ON feedbacks
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update feedbacks" ON feedbacks
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- =============================================
-- SELESAI! Verifikasi tabel sudah dibuat:
-- =============================================
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
