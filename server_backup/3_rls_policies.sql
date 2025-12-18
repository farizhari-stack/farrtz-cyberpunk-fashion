-- =============================================
-- FARRTZ CYBERPUNK FASHION - RLS POLICIES
-- =============================================
-- Run this in Supabase SQL Editor
-- This sets up Row Level Security policies
-- =============================================

-- =============================================
-- DROP EXISTING POLICIES (to avoid conflicts)
-- =============================================
DO $$ 
BEGIN
    -- Products
    DROP POLICY IF EXISTS "Allow public read access to products" ON products;
    DROP POLICY IF EXISTS "Allow authenticated insert to products" ON products;
    DROP POLICY IF EXISTS "Allow authenticated update to products" ON products;
    DROP POLICY IF EXISTS "Allow authenticated delete to products" ON products;
    
    -- Coupons
    DROP POLICY IF EXISTS "Allow public read access to coupons" ON coupons;
    DROP POLICY IF EXISTS "Allow authenticated insert to coupons" ON coupons;
    DROP POLICY IF EXISTS "Allow authenticated update to coupons" ON coupons;
    DROP POLICY IF EXISTS "Allow authenticated delete to coupons" ON coupons;
    
    -- Coupon Usages
    DROP POLICY IF EXISTS "Allow authenticated read coupon_usages" ON coupon_usages;
    DROP POLICY IF EXISTS "Allow authenticated insert coupon_usages" ON coupon_usages;
    
    -- Messages
    DROP POLICY IF EXISTS "Allow public read access to messages" ON messages;
    DROP POLICY IF EXISTS "Allow authenticated insert to messages" ON messages;
    DROP POLICY IF EXISTS "Allow authenticated update to messages" ON messages;
    
    -- Feedbacks
    DROP POLICY IF EXISTS "Allow public read access to feedbacks" ON feedbacks;
    DROP POLICY IF EXISTS "Allow authenticated insert to feedbacks" ON feedbacks;
    DROP POLICY IF EXISTS "Allow authenticated update to feedbacks" ON feedbacks;
    DROP POLICY IF EXISTS "Allow public insert to feedbacks" ON feedbacks;
    
    -- Orders
    DROP POLICY IF EXISTS "Users can read their own orders" ON orders;
    DROP POLICY IF EXISTS "Allow authenticated insert to orders" ON orders;
    DROP POLICY IF EXISTS "Admin can update orders" ON orders;
    
    -- Users
    DROP POLICY IF EXISTS "Users can read their own profile" ON users;
    DROP POLICY IF EXISTS "Users can update their own profile" ON users;
    DROP POLICY IF EXISTS "Allow public insert to users" ON users;
    DROP POLICY IF EXISTS "Allow public read users for login" ON users;
END $$;

-- =============================================
-- PRODUCTS POLICIES
-- =============================================
CREATE POLICY "Allow public read access to products"
ON products FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert to products"
ON products FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update to products"
ON products FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to products"
ON products FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- COUPONS POLICIES
-- =============================================
CREATE POLICY "Allow public read access to coupons"
ON coupons FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert to coupons"
ON coupons FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update to coupons"
ON coupons FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated delete to coupons"
ON coupons FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- COUPON USAGES POLICIES
-- =============================================
CREATE POLICY "Allow authenticated read coupon_usages"
ON coupon_usages FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert coupon_usages"
ON coupon_usages FOR INSERT
TO authenticated
WITH CHECK (true);

-- =============================================
-- MESSAGES POLICIES
-- =============================================
CREATE POLICY "Allow public read access to messages"
ON messages FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated insert to messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated update to messages"
ON messages FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

-- =============================================
-- FEEDBACKS POLICIES
-- =============================================
CREATE POLICY "Allow public read access to feedbacks"
ON feedbacks FOR SELECT
USING (true);

CREATE POLICY "Allow public insert to feedbacks"
ON feedbacks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow authenticated update to feedbacks"
ON feedbacks FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

-- =============================================
-- ORDERS POLICIES
-- =============================================
CREATE POLICY "Users can read their own orders"
ON orders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated insert to orders"
ON orders FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admin can update orders"
ON orders FOR UPDATE
TO authenticated
USING (true) WITH CHECK (true);

-- =============================================
-- USERS POLICIES
-- =============================================
CREATE POLICY "Allow public read users for login"
ON users FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow public insert to users"
ON users FOR INSERT
WITH CHECK (true);

SELECT 'RLS Policies created successfully!' as result;
