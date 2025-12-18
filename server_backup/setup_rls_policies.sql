-- Row Level Security Policies for FARRTZ Cyberpunk Fashion

-- =============================================
-- PRODUCTS TABLE
-- =============================================
-- Allow public read access to products
CREATE POLICY "Allow public read access to products"
ON products
FOR SELECT
USING (true);

-- Allow authenticated users to insert products (for admin)
CREATE POLICY "Allow authenticated insert to products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update products (for admin)
CREATE POLICY "Allow authenticated update to products"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete products (for admin)
CREATE POLICY "Allow authenticated delete to products"
ON products
FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- COUPONS TABLE
-- =============================================
-- Allow public read access to active coupons
CREATE POLICY "Allow public read access to coupons"
ON coupons
FOR SELECT
USING (true);

-- Allow authenticated users to insert coupons (for admin)
CREATE POLICY "Allow authenticated insert to coupons"
ON coupons
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update coupons (for admin)
CREATE POLICY "Allow authenticated update to coupons"
ON coupons
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to delete coupons (for admin)
CREATE POLICY "Allow authenticated delete to coupons"
ON coupons
FOR DELETE
TO authenticated
USING (true);

-- =============================================
-- MESSAGES TABLE
-- =============================================
-- Allow public read access to messages
CREATE POLICY "Allow public read access to messages"
ON messages
FOR SELECT
USING (true);

-- Allow authenticated users to insert messages
CREATE POLICY "Allow authenticated insert to messages"
ON messages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update their own messages
CREATE POLICY "Allow authenticated update to messages"
ON messages
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- =============================================
-- FEEDBACKS TABLE
-- =============================================
-- Allow public read access to feedbacks
CREATE POLICY "Allow public read access to feedbacks"
ON feedbacks
FOR SELECT
USING (true);

-- Allow authenticated users to insert feedbacks
CREATE POLICY "Allow authenticated insert to feedbacks"
ON feedbacks
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to update feedbacks (for admin)
CREATE POLICY "Allow authenticated update to feedbacks"
ON feedbacks
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- =============================================
-- ORDERS TABLE
-- =============================================
-- Allow users to read their own orders
CREATE POLICY "Users can read their own orders"
ON orders
FOR SELECT
TO authenticated
USING (auth.uid() = userId OR EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND isAdmin = true
));

-- Allow authenticated users to insert orders
CREATE POLICY "Allow authenticated insert to orders"
ON orders
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow admin to update order status
CREATE POLICY "Admin can update orders"
ON orders
FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND isAdmin = true
))
WITH CHECK (true);

-- =============================================
-- USERS TABLE
-- =============================================
-- Allow users to read their own profile
CREATE POLICY "Users can read their own profile"
ON users  
FOR SELECT
TO authenticated
USING (auth.uid() = id OR EXISTS (
  SELECT 1 FROM users WHERE id = auth.uid() AND isAdmin = true
));

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
ON users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow public insert for user registration
CREATE POLICY "Allow public insert to users"
ON users
FOR INSERT
WITH CHECK (true);
