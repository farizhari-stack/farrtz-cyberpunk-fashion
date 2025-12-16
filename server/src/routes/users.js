const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ==================== GET ALL USERS (Admin) ====================
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
                address: true,
                isAdmin: true,
                createdAt: true,
                _count: {
                    select: {
                        orders: true,
                        wishlist: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            users
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ success: false, message: 'Failed to get users' });
    }
});

// ==================== GET USER BY ID ====================
router.get('/:id', auth, async (req, res) => {
    try {
        // Users can only get their own profile (unless admin)
        if (!req.user.isAdmin && req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const user = await prisma.user.findUnique({
            where: { id: req.params.id },
            include: {
                wishlist: true
            }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { password: _, ...userWithoutPassword } = user;
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

// ==================== UPDATE USER ====================
router.put('/:id', auth, async (req, res) => {
    try {
        // Users can only update their own profile (unless admin)
        if (!req.user.isAdmin && req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { firstName, lastName, avatar, address, password } = req.body;

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (avatar) updateData.avatar = avatar;
        if (address !== undefined) updateData.address = address;
        if (password) updateData.password = await bcrypt.hash(password, 10);

        const user = await prisma.user.update({
            where: { id: req.params.id },
            data: updateData,
            include: {
                wishlist: true
            }
        });

        const { password: _, ...userWithoutPassword } = user;
        userWithoutPassword.wishlist = user.wishlist.map(w => w.productId);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: userWithoutPassword
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ success: false, message: 'Failed to update user' });
    }
});

// ==================== WISHLIST OPERATIONS ====================

// Add to wishlist
router.post('/:id/wishlist', auth, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const { productId } = req.body;

        await prisma.wishlist.create({
            data: {
                userId: req.user.id,
                productId: parseInt(productId)
            }
        });

        // Get updated wishlist
        const wishlist = await prisma.wishlist.findMany({
            where: { userId: req.user.id }
        });

        res.json({
            success: true,
            message: 'Added to wishlist',
            wishlist: wishlist.map(w => w.productId)
        });
    } catch (error) {
        // If duplicate, still return success
        if (error.code === 'P2002') {
            const wishlist = await prisma.wishlist.findMany({
                where: { userId: req.user.id }
            });
            return res.json({
                success: true,
                message: 'Already in wishlist',
                wishlist: wishlist.map(w => w.productId)
            });
        }
        console.error('Add to wishlist error:', error);
        res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
    }
});

// Remove from wishlist
router.delete('/:id/wishlist/:productId', auth, async (req, res) => {
    try {
        if (req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        await prisma.wishlist.deleteMany({
            where: {
                userId: req.user.id,
                productId: parseInt(req.params.productId)
            }
        });

        // Get updated wishlist
        const wishlist = await prisma.wishlist.findMany({
            where: { userId: req.user.id }
        });

        res.json({
            success: true,
            message: 'Removed from wishlist',
            wishlist: wishlist.map(w => w.productId)
        });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
    }
});

// Get wishlist
router.get('/:id/wishlist', auth, async (req, res) => {
    try {
        if (!req.user.isAdmin && req.user.id !== req.params.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const wishlist = await prisma.wishlist.findMany({
            where: { userId: req.params.id }
        });

        res.json({
            success: true,
            wishlist: wishlist.map(w => w.productId)
        });
    } catch (error) {
        console.error('Get wishlist error:', error);
        res.status(500).json({ success: false, message: 'Failed to get wishlist' });
    }
});

module.exports = router;
