const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// ==================== GET ORDERS ====================
// User: gets own orders, Admin: gets all orders
router.get('/', auth, async (req, res) => {
    try {
        const where = req.user.isAdmin ? {} : { userId: req.user.id };

        const orders = await prisma.order.findMany({
            where,
            orderBy: { createdAt: 'desc' },
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
        });

        // Transform to match frontend format
        const transformedOrders = orders.map(order => ({
            id: order.id,
            userId: order.userId,
            items: order.items,
            shippingDetails: order.shippingDetails,
            totalAmount: order.totalAmount,
            status: order.status.toLowerCase(),
            paymentMethod: order.paymentMethod.toLowerCase(),
            paymentProofUrl: order.paymentProofUrl,
            date: order.createdAt.toISOString(),
            user: order.user
        }));

        res.json({
            success: true,
            orders: transformedOrders
        });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ success: false, message: 'Failed to get orders' });
    }
});

// ==================== GET ORDER BY ID ====================
router.get('/:id', auth, async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: { id: req.params.id },
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
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Check ownership (unless admin)
        if (!req.user.isAdmin && order.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.json({
            success: true,
            order: {
                ...order,
                status: order.status.toLowerCase(),
                paymentMethod: order.paymentMethod.toLowerCase(),
                date: order.createdAt.toISOString()
            }
        });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ success: false, message: 'Failed to get order' });
    }
});

// ==================== CREATE ORDER ====================
router.post('/', auth, async (req, res) => {
    try {
        const { items, shippingDetails, totalAmount, paymentMethod, paymentProofUrl } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order must have items' });
        }

        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                items: items,
                shippingDetails: shippingDetails,
                totalAmount: parseInt(totalAmount),
                paymentMethod: paymentMethod.toUpperCase(),
                paymentProofUrl: paymentProofUrl || null,
                status: 'PENDING'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: {
                ...order,
                status: order.status.toLowerCase(),
                paymentMethod: order.paymentMethod.toLowerCase(),
                date: order.createdAt.toISOString()
            }
        });
    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ success: false, message: 'Failed to create order' });
    }
});

// ==================== UPDATE ORDER STATUS (Admin) ====================
router.put('/:id/status', auth, adminOnly, async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['PENDING', 'CONFIRMED', 'PAID', 'PACKING', 'SHIPPED', 'DELIVERED'];
        const upperStatus = status.toUpperCase();

        if (!validStatuses.includes(upperStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status'
            });
        }

        const order = await prisma.order.update({
            where: { id: req.params.id },
            data: { status: upperStatus }
        });

        res.json({
            success: true,
            message: 'Order status updated',
            order: {
                ...order,
                status: order.status.toLowerCase(),
                paymentMethod: order.paymentMethod.toLowerCase(),
                date: order.createdAt.toISOString()
            }
        });
    } catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
});

// ==================== UPLOAD PAYMENT PROOF ====================
router.put('/:id/payment-proof', auth, async (req, res) => {
    try {
        const { paymentProofUrl } = req.body;

        const order = await prisma.order.findUnique({
            where: { id: req.params.id }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: req.params.id },
            data: { paymentProofUrl }
        });

        res.json({
            success: true,
            message: 'Payment proof uploaded',
            order: {
                ...updatedOrder,
                status: updatedOrder.status.toLowerCase(),
                paymentMethod: updatedOrder.paymentMethod.toLowerCase(),
                date: updatedOrder.createdAt.toISOString()
            }
        });
    } catch (error) {
        console.error('Upload payment proof error:', error);
        res.status(500).json({ success: false, message: 'Failed to upload payment proof' });
    }
});

module.exports = router;
