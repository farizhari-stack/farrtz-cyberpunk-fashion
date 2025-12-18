-- =============================================
-- FARRTZ CYBERPUNK FASHION - COMPLETE DATABASE RESET
-- =============================================
-- Run this in Supabase SQL Editor
-- This will DELETE ALL DATA but keep tables intact
-- =============================================

-- =============================================
-- STEP 1: CLEAR ALL DATA FROM TABLES
-- =============================================

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Clear all data from all tables (order matters for foreign keys)
TRUNCATE TABLE coupon_usages CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE feedbacks CASCADE;
TRUNCATE TABLE coupons CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE users CASCADE;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- =============================================
-- STEP 2: VERIFY TABLES ARE EMPTY
-- =============================================
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'coupons', COUNT(*) FROM coupons
UNION ALL
SELECT 'orders', COUNT(*) FROM orders
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'feedbacks', COUNT(*) FROM feedbacks
UNION ALL
SELECT 'coupon_usages', COUNT(*) FROM coupon_usages;

-- =============================================
-- DONE! All data cleared.
-- =============================================
-- Now follow these steps:
-- 
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Delete all existing auth users (if any)
-- 3. Click "Add User" > "Create new user"
-- 4. Enter: admin@gmail.com and your desired password
-- 5. Copy the USER ID that appears
-- 6. Run the INSERT command below with that USER ID
-- =============================================
