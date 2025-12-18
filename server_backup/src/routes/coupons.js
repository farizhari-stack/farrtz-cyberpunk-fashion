const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly, optionalAuth } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ==================== GET ALL COUPONS (Admin) ====================
router.get('/', auth, adminOnly, async (req, res) => {
    try {
        const coupons = await prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                usedBy: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        // Transform to match frontend format
        const transformedCoupons = coupons.map(coupon => ({
            id: coupon.id,
            code: coupon.code,
            discountPercent: coupon.discountPercent,
            createdDate: coupon.createdAt.toISOString(),
            expiryDate: coupon.expiryDate ? coupon.expiryDate.toISOString() : undefined,
            isActive: coupon.isActive,
            usageCount: coupon.usageCount,
            maxUsage: coupon.maxUsage,
            createdBy: coupon.createdById,
            usedBy: coupon.usedBy.map(u => u.userId)
        }));

        res.json({
            success: true,
            coupons: transformedCoupons
        });
    } catch (error) {
        console.error('Get coupons error:', error);
        res.status(500).json({ success: false, message: 'Failed to get coupons' });
    }
});

// ==================== VALIDATE COUPON ====================
router.post('/validate', optionalAuth, async (req, res) => {
    try {
        const { code } = req.body;
        const userId = req.user?.id;

        if (!code || code.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Please enter a coupon code'
            });
        }

        const coupon = await prisma.coupon.findFirst({
            where: {
                code: {
                    equals: code.trim(),
                    mode: 'insensitive'
                }
            },
            include: {
                usedBy: true
            }
        });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        if (!coupon.isActive) {
            return res.status(400).json({
                success: false,
                message: 'This coupon is no longer active'
            });
        }

        if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
            return res.status(400).json({
                success: false,
                message: 'This coupon has expired'
            });
        }

        if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
            return res.status(400).json({
                success: false,
                message: 'This coupon has reached its usage limit'
            });
        }

        // Check if user has already used this coupon
        if (userId) {
            const hasUsed = coupon.usedBy.some(u => u.userId === userId);
            if (hasUsed) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already used this coupon'
                });
            }
        }

        res.json({
            success: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discountPercent: coupon.discountPercent,
                expiryDate: coupon.expiryDate?.toISOString(),
                isActive: coupon.isActive
            }
        });
    } catch (error) {
        console.error('Validate coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to validate coupon' });
    }
});

// ==================== USE COUPON (after successful payment) ====================
router.post('/use', auth, async (req, res) => {
    try {
        const { couponId } = req.body;
        const userId = req.user.id;

        // Record usage
        await prisma.couponUsage.create({
            data: {
                couponId,
                userId
            }
        });

        // Increment usage count
        await prisma.coupon.update({
            where: { id: couponId },
            data: {
                usageCount: { increment: 1 }
            }
        });

        res.json({
            success: true,
            message: 'Coupon usage recorded'
        });
    } catch (error) {
        // If unique constraint violation, coupon was already used
        if (error.code === 'P2002') {
            return res.status(400).json({
                success: false,
                message: 'You have already used this coupon'
            });
        }
        console.error('Use coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to use coupon' });
    }
});

// ==================== CREATE COUPON (Admin) ====================
router.post('/', auth, adminOnly, async (req, res) => {
    try {
        const { code, discountPercent, expiryDate, maxUsage } = req.body;

        if (!code || !discountPercent) {
            return res.status(400).json({
                success: false,
                message: 'Code and discount percent are required'
            });
        }

        // Check if code already exists
        const existingCoupon = await prisma.coupon.findFirst({
            where: {
                code: {
                    equals: code,
                    mode: 'insensitive'
                }
            }
        });

        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists'
            });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                discountPercent: parseInt(discountPercent),
                expiryDate: expiryDate ? new Date(expiryDate) : null,
                maxUsage: maxUsage ? parseInt(maxUsage) : null,
                createdById: req.user.id,
                isActive: true,
                usageCount: 0
            }
        });

        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discountPercent: coupon.discountPercent,
                createdDate: coupon.createdAt.toISOString(),
                expiryDate: coupon.expiryDate?.toISOString(),
                isActive: coupon.isActive,
                usageCount: coupon.usageCount,
                maxUsage: coupon.maxUsage,
                createdBy: coupon.createdById,
                usedBy: []
            }
        });
    } catch (error) {
        console.error('Create coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to create coupon' });
    }
});

// ==================== UPDATE COUPON (Admin) ====================
router.put('/:id', auth, adminOnly, async (req, res) => {
    try {
        const { code, discountPercent, expiryDate, maxUsage, isActive } = req.body;

        const coupon = await prisma.coupon.update({
            where: { id: req.params.id },
            data: {
                code: code?.toUpperCase(),
                discountPercent: discountPercent ? parseInt(discountPercent) : undefined,
                expiryDate: expiryDate ? new Date(expiryDate) : undefined,
                maxUsage: maxUsage ? parseInt(maxUsage) : undefined,
                isActive: isActive !== undefined ? Boolean(isActive) : undefined
            }
        });

        res.json({
            success: true,
            message: 'Coupon updated successfully',
            coupon
        });
    } catch (error) {
        console.error('Update coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to update coupon' });
    }
});

// ==================== DELETE COUPON (Admin) ====================
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        await prisma.coupon.delete({
            where: { id: req.params.id }
        });

        res.json({
            success: true,
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        console.error('Delete coupon error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete coupon' });
    }
});

module.exports = router;
