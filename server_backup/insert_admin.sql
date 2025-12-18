-- Insert admin user profile into users table
-- User ID from Supabase Auth: 7fd20d10-e94d-4bf2-be89-8c1ef2ca26a4

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
  '7fd20d10-e94d-4bf2-be89-8c1ef2ca26a4',
  'admin@gmail.com',
  'System',
  'Admin',
  'https://cdn-icons-png.flaticon.com/512/2942/2942813.png',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE
SET "isAdmin" = true;

-- Verify admin user was created
SELECT id, email, "firstName", "lastName", "isAdmin", "createdAt" 
FROM users 
WHERE email = 'admin@gmail.com';
