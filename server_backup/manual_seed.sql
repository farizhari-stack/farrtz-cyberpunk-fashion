-- Manual database seed for FARRTZ E-commerce
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/zsvvguibewyqkfklfubt/editor

-- Insert admin user
INSERT INTO users (email, password, "firstName", "lastName", avatar, "isAdmin", "createdDate")
VALUES (
  'admin@gmail.com',
  '$2a$10$5ks/1D6rY4HWke97HIcT2.dLpHdeq6nqcklP6t3KR14iO2Lw1ELmWy',
  'System',
  'Admin',
  'https://cdn-icons-png.flaticon.com/512/2942/2942813.png',
  true,
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert test user
INSERT INTO users (email, password, "firstName", "lastName", avatar, "isAdmin", "createdDate")
VALUES (
  'user@example.com',
  '$2a$10$HWJx8kKRowXLZ5d2ShgKZu41PB56yhU2RUhViOQ6A.ui',
  'Test',
  'User',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Test',
  false,
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Verify users were created
SELECT id, email, "firstName", "lastName", "isAdmin", "createdDate" 
FROM users 
ORDER BY "createdDate" DESC;

