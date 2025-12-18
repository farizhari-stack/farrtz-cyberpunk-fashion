-- =============================================
-- FARRTZ CYBERPUNK FASHION - INSERT ADMIN
-- =============================================
-- Run this AFTER creating admin user in Supabase Auth
-- =============================================
-- 
-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > "Create new user"  
-- 3. Enter email: admin@gmail.com (or your preferred email)
-- 4. Enter password: (your chosen password, minimum 6 characters)
-- 5. Click "Create User"
-- 6. COPY THE USER ID (UUID) that appears in the users list
-- 7. Replace 'YOUR_USER_ID_HERE' below with that UUID
-- 8. Run this SQL
-- =============================================

-- Replace the UUID below with the actual User ID from Supabase Auth
INSERT INTO users (
    id,
    email,
    "firstName",
    "lastName",
    avatar,
    "isAdmin",
    "createdAt",
    "updatedAt"
)
VALUES (
    'YOUR_USER_ID_HERE',  -- ← REPLACE THIS with UUID from Supabase Auth!
    'admin@gmail.com',    -- ← Must match the email you used in Auth
    'System',
    'Admin',
    'https://cdn-icons-png.flaticon.com/512/2942/2942813.png',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE 
SET "isAdmin" = true,
    "updatedAt" = NOW();

-- Verify admin was created
SELECT id, email, "firstName", "lastName", "isAdmin", "createdAt" 
FROM users 
WHERE email = 'admin@gmail.com';

-- =============================================
-- EXAMPLE (if your user ID is: abc123-def456-ghi789)
-- =============================================
-- INSERT INTO users (id, email, "firstName", "lastName", avatar, "isAdmin", "createdAt", "updatedAt")
-- VALUES (
--     'abc123-def456-ghi789',
--     'admin@gmail.com',
--     'System',
--     'Admin',
--     'https://cdn-icons-png.flaticon.com/512/2942/2942813.png',
--     true,
--     NOW(),
--     NOW()
-- );
