import { Coupon } from '../types';

/**
 * Generate a random coupon code
 * @param length - Length of the code (default: 8)
 * @returns Random uppercase alphanumeric code
 */
export const generateCouponCode = (length: number = 8): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
};

/**
 * Validate a coupon code
 * @param code - Coupon code to validate
 * @param coupons - Array of all coupons
 * @param userId - Current user ID (optional, for checking duplicate usage)
 * @returns Validation result with coupon if valid
 */
export const validateCoupon = (
    code: string,
    coupons: Coupon[],
    userId?: string
): { valid: boolean; coupon?: Coupon; error?: string } => {
    if (!code || code.trim() === '') {
        return { valid: false, error: 'Please enter a coupon code' };
    }

    // Find coupon (case-insensitive)
    const coupon = coupons.find(
        (c) => c.code.toUpperCase() === code.trim().toUpperCase()
    );

    if (!coupon) {
        return { valid: false, error: 'Invalid coupon code' };
    }

    if (!coupon.isActive) {
        return { valid: false, error: 'This coupon is no longer active' };
    }

    if (isCouponExpired(coupon)) {
        return { valid: false, error: 'This coupon has expired' };
    }

    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
        return { valid: false, error: 'This coupon has reached its usage limit' };
    }

    // Check if user has already used this coupon
    if (userId && coupon.usedBy && coupon.usedBy.includes(userId)) {
        return { valid: false, error: 'You have already used this coupon' };
    }

    return { valid: true, coupon };
};

/**
 * Calculate discount amount
 * @param subtotal - Subtotal before discount
 * @param coupon - Applied coupon
 * @returns Discount amount
 */
export const calculateDiscount = (subtotal: number, coupon: Coupon): number => {
    return Math.floor((subtotal * coupon.discountPercent) / 100);
};

/**
 * Check if coupon is expired
 * @param coupon - Coupon to check
 * @returns True if expired
 */
export const isCouponExpired = (coupon: Coupon): boolean => {
    if (!coupon.expiryDate) return false;
    return new Date(coupon.expiryDate) < new Date();
};

/**
 * Format coupon discount display
 * @param coupon - Coupon object
 * @returns Formatted string (e.g., "-20%")
 */
export const formatCouponDiscount = (coupon: Coupon): string => {
    return `-${coupon.discountPercent}%`;
};

/**
 * Generate unique coupon code (check against existing)
 * @param existingCoupons - Array of existing coupons
 * @returns Unique code
 */
export const generateUniqueCouponCode = (existingCoupons: Coupon[]): string => {
    let code = generateCouponCode();
    let attempts = 0;

    // Ensure uniqueness
    while (existingCoupons.some(c => c.code === code) && attempts < 10) {
        code = generateCouponCode();
        attempts++;
    }

    return code;
};
