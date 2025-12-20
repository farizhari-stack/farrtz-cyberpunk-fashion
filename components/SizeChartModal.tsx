import React, { useState } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const motion = framerMotion as any;

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: string;
}

const SizeChartModal: React.FC<SizeChartModalProps> = ({ isOpen, onClose, category }) => {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');

  if (!isOpen) return null;

  const toggleUnit = () => setUnit(prev => prev === 'in' ? 'cm' : 'in');

  const getSizeValue = (inches: number) => {
    return unit === 'in' ? `${inches}"` : `${Math.round(inches * 2.54)} cm`;
  };

  // Define data for different categories
  const tShirtData = {
    title: "Classic T-Shirt",
    fit: "Men's / Unisex Fit",
    description: "A customer-favorite everyday tee.",
    material: "Solids: 100% Cotton, Heathers: Cotton/Poly Blend. Weight: 4.5oz",
    measurements: [
      { size: 'S', chest: 18, length: 28 },
      { size: 'M', chest: 20, length: 29.25 },
      { size: 'L', chest: 22, length: 30.25 },
      { size: 'XL', chest: 24, length: 31.25 },
      { size: '2XL', chest: 26, length: 32.5 },
    ]
  };

  const hoodieData = {
    title: "Classic Pullover Hoodie",
    fit: "Unisex",
    description: "",
    material: "Solids: 80% Cotton/ 20% Recycled Polyester, Heathers: 60% Cotton/ 40% Recycled Polyester. Weight: 8.25oz",
    measurements: [
      { size: 'S', chest: 20, length: 27 },
      { size: 'M', chest: 22, length: 28 },
      { size: 'L', chest: 24, length: 29 },
      { size: 'XL', chest: 26, length: 30 },
      { size: '2XL', chest: 28, length: 31 },
    ]
  };

  const tankTopData = {
    title: "Classic Tank Top",
    fit: "Unisex",
    description: "",
    material: "Solids: 80% Cotton/ 20% Recycled Polyester, Heathers: 60% Cotton/ 40% Recycled Polyester. Weight: 8.25oz",
    measurements: [
      { size: 'S', chest: 20, length: 27 },
      { size: 'M', chest: 22, length: 28 },
      { size: 'L', chest: 24, length: 29 },
      { size: 'XL', chest: 26, length: 30 },
      { size: '2XL', chest: 28, length: 31 },
    ]
  };

  const kidsData = {
    title: "Classic Kids T-Shirt",
    fit: "Unisex / Standard Fit",
    description: "Perfect for active kids.",
    material: "Solids: 100% Cotton. Weight: 4.5oz",
    measurements: [
      { size: 'S', chest: 15.5, length: 20.5 },
      { size: 'M', chest: 17, length: 22 },
      { size: 'L', chest: 18.5, length: 23.5 },
      { size: 'XL', chest: 20, length: 25 },
      { size: '2XL', chest: 21.5, length: 26.5 },
    ]
  };

  const shortsData = {
    title: "Lounge Shorts",
    fit: "Unisex",
    description: "Relaxed lounge shorts with a comfy fit.",
    material: "100% Combed Ring Spun Cotton.",
    measurements: [
      { size: 'S', chest: 32, length: 7 },
      { size: 'M', chest: 34, length: 7 },
      { size: 'L', chest: 36, length: 7 },
      { size: 'XL', chest: 39, length: 7.125 },
      { size: '2XL', chest: 42, length: 7.25 },
    ]
  };

  // Determine which data to show
  let data = tShirtData;
  if (category === 'Hoodies') data = hoodieData;
  if (category === 'Tank Tops') data = tankTopData;
  if (category === 'Kids') data = kidsData;
  if (category === 'Shorts') data = shortsData;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white rounded-[30px] shadow-2xl w-full max-w-[700px] overflow-hidden relative text-gray-900 p-8 md:p-10 font-sans"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-gray-400 hover:text-gray-900" />
          </button>

          {/* Header */}
          <h2 className="text-3xl font-bold mb-6 tracking-tight text-black">Size Chart & Product Info</h2>

          {/* Product Details */}
          <div className="mb-8 space-y-1">
            <p className="text-gray-800 text-sm font-medium">{data.title}</p>
            <p className="text-gray-600 text-sm">{data.fit}</p>
            <button
              onClick={toggleUnit}
              className="text-sm font-medium text-gray-900 mt-1 hover:text-blue-600 transition-colors underline decoration-dotted underline-offset-4"
            >
              Switch to: {unit === 'in' ? 'CM' : 'INCHES'}
            </button>
            {data.description && <p className="text-gray-600 text-sm mt-3">{data.description}</p>}
            <p className={`text-gray-600 text-sm ${!data.description ? 'mt-3' : ''}`}>{data.material}</p>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 border-b border-gray-200">Size</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 text-center border-b border-gray-200 bg-white shadow-[inset_0_0_10px_rgba(0,0,0,0.02)]">Chest ({unit})</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 text-center border-b border-gray-200">Length ({unit})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.measurements.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-3 text-sm font-medium text-gray-800">{row.size}</td>
                    <td className="px-6 py-3 text-sm text-center text-gray-600 font-mono group-hover:text-black group-hover:font-bold bg-gray-50/50">{getSizeValue(row.chest)}</td>
                    <td className="px-6 py-3 text-sm text-center text-gray-600 font-mono group-hover:text-black group-hover:font-bold">{getSizeValue(row.length)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Notes */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-gray-400 text-[10px] mt-1">•</span>
              <p className="text-xs text-gray-500">All Measurements in {unit === 'in' ? 'INCHES' : 'CM'} Tolerance +/- {unit === 'in' ? '1 in' : '2.54 cm'}</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-400 text-[10px] mt-1">•</span>
              <p className="text-xs text-gray-500">If you're in-between sizes, we recommend sizing up as items may shrink up to a half size in the wash.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-gray-400 text-[10px] mt-1">•</span>
              <p className="text-xs text-gray-500">*Sizing may vary for international garments.</p>
            </div>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SizeChartModal;
