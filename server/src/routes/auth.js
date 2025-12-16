const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { auth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// ==================== REGISTER ====================
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        // Validation
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                firstName,
                lastName,
                avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${firstName}`,
                isAdmin: false
            }
        });

        // Generate token
        const token = generateToken(user.id);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// ==================== LOGIN (User) ====================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if trying to login as admin through user login
        if (user.isAdmin) {
            return res.status(401).json({
                success: false,
                message: 'Please use admin login page'
            });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user.id);

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Login successful',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// ==================== ADMIN LOGIN ====================
router.post('/admin-login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Hardcoded admin check (same as before, but also check DB)
        if (email === 'admin@gmail.com' && password === 'admin') {
            // Check if admin exists in DB, if not create
            let adminUser = await prisma.user.findUnique({
                where: { email: 'admin@gmail.com' }
            });

            if (!adminUser) {
                const hashedPassword = await bcrypt.hash('admin', 10);
                adminUser = await prisma.user.create({
                    data: {
                        email: 'admin@gmail.com',
                        password: hashedPassword,
                        firstName: 'System',
                        lastName: 'Admin',
                        avatar: 'https://cdn-icons-png.flaticon.com/512/2942/2942813.png',
                        isAdmin: true
                    }
                });
            }

            const token = generateToken(adminUser.id);
            const { password: _, ...userWithoutPassword } = adminUser;

            return res.json({
                success: true,
                message: 'Admin login successful',
                user: userWithoutPassword,
                token
            });
        }

        // Check DB for other admin users
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user || !user.isAdmin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid admin credentials'
            });
        }

        const token = generateToken(user.id);
        const { password: _, ...userWithoutPassword } = user;

        res.json({
            success: true,
            message: 'Admin login successful',
            user: userWithoutPassword,
            token
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ success: false, message: 'Admin login failed' });
    }
});

// ==================== GET CURRENT USER ====================
router.get('/me', auth, async (req, res) => {
    try {
        // Get fresh user data with wishlist
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: {
                wishlist: true
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;

        // Transform wishlist to array of product IDs
        userWithoutPassword.wishlist = user.wishlist.map(w => w.productId);

        res.json({
            success: true,
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ success: false, message: 'Failed to get user' });
    }
});

// ==================== FORGOT PASSWORD ====================
// Store reset codes in memory (in production, use Redis or DB)
const resetCodes = new Map();

router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        // Also allow admin (for demo)
        const isAdmin = email === 'admin@gmail.com';

        if (!user && !isAdmin) {
            return res.status(404).json({
                success: false,
                message: 'Email address not found'
            });
        }

        // Generate 5-digit code
        const code = Math.floor(10000 + Math.random() * 90000).toString();
        const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Store code
        resetCodes.set(email.toLowerCase(), { code, expires });

        // In production, send email here
        console.log(`[AUTH] Reset code for ${email}: ${code}`);

        res.json({
            success: true,
            message: 'Reset code sent to email',
            // For demo purposes only - remove in production!
            devCode: process.env.NODE_ENV === 'development' ? code : undefined
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Failed to process request' });
    }
});

router.post('/validate-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;

        const record = resetCodes.get(email.toLowerCase());

        if (!record) {
            return res.status(400).json({
                success: false,
                message: 'No reset request found'
            });
        }

        if (Date.now() > record.expires) {
            resetCodes.delete(email.toLowerCase());
            return res.status(400).json({
                success: false,
                message: 'Code has expired'
            });
        }

        if (record.code !== code) {
            return res.status(400).json({
                success: false,
                message: 'Invalid code'
            });
        }

        res.json({ success: true, message: 'Code validated' });
    } catch (error) {
        console.error('Validate code error:', error);
        res.status(500).json({ success: false, message: 'Validation failed' });
    }
});

router.post('/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Don't allow reset for hardcoded admin in demo
        if (email === 'admin@gmail.com') {
            return res.status(400).json({
                success: false,
                message: 'Cannot reset demo admin password'
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { email: email.toLowerCase() },
            data: { password: hashedPassword }
        });

        // Clean up reset code
        resetCodes.delete(email.toLowerCase());

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Password reset failed' });
    }
});

module.exports = router;
