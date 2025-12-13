import React, { useState } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { Ticket, Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw, Calendar, Users } from 'lucide-react';
import { Coupon } from '../types';
import { generateUniqueCouponCode } from '../utils/couponUtils';

const motion = framerMotion as any;

interface AdminCouponManagerProps {
    coupons: Coupon[];
    onCreateCoupon: (coupon: Omit<Coupon, 'id' | 'createdDate' | 'usageCount'>) => void;
    onToggleStatus: (couponId: string) => void;
    onDeleteCoupon: (couponId: string) => void;
    adminId: string;
}

const AdminCouponManager: React.FC<AdminCouponManagerProps> = ({
    coupons,
    onCreateCoupon,
    onToggleStatus,
    onDeleteCoupon,
    adminId,
}) => {
    const [discountPercent, setDiscountPercent] = useState(10);
    const [generatedCode, setGeneratedCode] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [maxUsage, setMaxUsage] = useState('');

    const handleGenerateCode = () => {
        const code = generateUniqueCouponCode(coupons);
        setGeneratedCode(code);
    };

    const handleCreateCoupon = () => {
        if (!generatedCode) {
            alert('Please generate a coupon code first');
            return;
        }

        if (discountPercent < 1 || discountPercent > 100) {
            alert('Discount must be between 1% and 100%');
            return;
        }

        const coupon: Omit<Coupon, 'id' | 'createdDate' | 'usageCount'> = {
            code: generatedCode,
            discountPercent,
            expiryDate: expiryDate || undefined,
            isActive: true,
            maxUsage: maxUsage ? parseInt(maxUsage) : undefined,
            createdBy: adminId,
            usedBy: [], // Initialize as empty array for new coupons
        };

        onCreateCoupon(coupon);

        // Reset form
        setGeneratedCode('');
        setDiscountPercent(10);
        setExpiryDate('');
        setMaxUsage('');
    };

    const activeCoupons = coupons.filter(c => c.isActive);
    const inactiveCoupons = coupons.filter(c => !c.isActive);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 border border-purple-500/30 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Ticket className="text-purple-400" size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-white">{coupons.length}</h3>
                    <p className="text-sm text-gray-400">Total Coupons</p>
                </div>

                <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 border border-green-500/30 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <ToggleRight className="text-green-400" size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-white">{activeCoupons.length}</h3>
                    <p className="text-sm text-gray-400">Active Coupons</p>
                </div>

                <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-800/40 border border-cyan-500/30 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="text-cyan-400" size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-white">
                        {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
                    </h3>
                    <p className="text-sm text-gray-400">Total Usage</p>
                </div>
            </div>

            {/* Create Coupon Form */}
            <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Plus size={24} className="text-cyan-400" />
                    Generate New Coupon
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Discount Percent */}
                    <div>
                        <label className="block text-white font-bold mb-2">Discount Percentage</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={discountPercent}
                                onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
                                className="flex-1"
                            />
                            <span className="text-3xl font-bold text-cyan-400 w-20 text-center">
                                {discountPercent}%
                            </span>
                        </div>
                    </div>

                    {/* Generated Code */}
                    <div>
                        <label className="block text-white font-bold mb-2">Coupon Code</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={generatedCode}
                                readOnly
                                placeholder="Click generate"
                                className="flex-1 bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500 font-mono text-lg"
                            />
                            <button
                                onClick={handleGenerateCode}
                                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-purple-600 hover:to-cyan-600 transition-all"
                            >
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Expiry Date */}
                    <div>
                        <label className="block text-white font-bold mb-2">
                            <Calendar className="inline mr-2" size={16} />
                            Expiry Date (Optional)
                        </label>
                        <input
                            type="date"
                            value={expiryDate}
                            onChange={(e) => setExpiryDate(e.target.value)}
                            className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2 text-white"
                        />
                    </div>

                    {/* Max Usage */}
                    <div>
                        <label className="block text-white font-bold mb-2">
                            <Users className="inline mr-2" size={16} />
                            Max Usage (Optional)
                        </label>
                        <input
                            type="number"
                            value={maxUsage}
                            onChange={(e) => setMaxUsage(e.target.value)}
                            placeholder="Unlimited"
                            min="1"
                            className="w-full bg-black/40 border border-purple-500/30 rounded-lg px-4 py-2 text-white placeholder-gray-500"
                        />
                    </div>
                </div>

                {/* Create Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateCoupon}
                    className="mt-6 w-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold py-4 px-8 rounded-lg flex items-center justify-center gap-3 hover:from-purple-600 hover:to-cyan-600 transition-all shadow-lg shadow-purple-500/50"
                >
                    <Plus size={20} />
                    Generate Coupon
                </motion.button>
            </div>

            {/* Coupon List */}
            <div className="bg-gradient-to-br from-purple-900/20 to-cyan-900/20 border border-purple-500/30 rounded-lg p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Ticket size={24} className="text-cyan-400" />
                    All Coupons ({coupons.length})
                </h2>

                {coupons.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Ticket size={48} className="mx-auto mb-4 opacity-50" />
                        <p>No coupons created yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {coupons.map((coupon) => (
                            <CouponCard
                                key={coupon.id}
                                coupon={coupon}
                                onToggleStatus={onToggleStatus}
                                onDelete={onDeleteCoupon}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// Coupon Card Component
const CouponCard: React.FC<{
    coupon: Coupon;
    onToggleStatus: (id: string) => void;
    onDelete: (id: string) => void;
}> = ({ coupon, onToggleStatus, onDelete }) => {
    const isExpired = coupon.expiryDate && new Date(coupon.expiryDate) < new Date();
    const usagePercent = coupon.maxUsage
        ? (coupon.usageCount / coupon.maxUsage) * 100
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${coupon.isActive
                ? 'from-green-900/20 to-cyan-900/20 border-green-500/30'
                : 'from-gray-900/20 to-gray-800/20 border-gray-500/30'
                } border rounded-lg p-4 flex items-center gap-4`}
        >
            {/* Code */}
            <div className="flex-shrink-0">
                <div className="bg-black/40 border-2 border-purple-500/50 rounded-lg px-4 py-2">
                    <p className="text-2xl font-mono font-bold text-cyan-400">{coupon.code}</p>
                </div>
            </div>

            {/* Info */}
            <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                    <span className="text-3xl font-bold text-white">{coupon.discountPercent}%</span>
                    <span className="text-sm text-gray-400">discount</span>
                    {isExpired && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded">
                            EXPIRED
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>
                        Used: {coupon.usageCount}
                        {coupon.maxUsage && ` / ${coupon.maxUsage}`}
                    </span>
                    {coupon.expiryDate && (
                        <span>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                    )}
                </div>

                {/* Usage Progress Bar */}
                {coupon.maxUsage && (
                    <div className="mt-2 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-purple-500 to-cyan-500"
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                        ></div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onToggleStatus(coupon.id)}
                    className={`p-2 rounded-lg transition-all ${coupon.isActive
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'
                        }`}
                    title={coupon.isActive ? 'Deactivate' : 'Activate'}
                >
                    {coupon.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                <button
                    onClick={() => {
                        if (confirm(`Delete coupon "${coupon.code}"?`)) {
                            onDelete(coupon.id);
                        }
                    }}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"
                    title="Delete"
                >
                    <Trash2 size={20} />
                </button>
            </div>
        </motion.div>
    );
};

export default AdminCouponManager;
