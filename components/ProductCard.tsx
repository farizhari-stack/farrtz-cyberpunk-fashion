import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { Product } from '../types';
import { Plus } from 'lucide-react';

const motion = framerMotion as any;

interface ProductCardProps {
  product: Product;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={onClick}
      className="group relative bg-[#0a0a0a] p-2 overflow-hidden cursor-pointer"
    >
      {/* Tech Borders */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent group-hover:via-purple-500 transition-all duration-500"></div>
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gray-700 to-transparent group-hover:via-cyan-500 transition-all duration-500"></div>
      
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-gray-500 group-hover:border-purple-500 transition-colors"></div>
      <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-gray-500 group-hover:border-purple-500 transition-colors"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-gray-500 group-hover:border-cyan-500 transition-colors"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-gray-500 group-hover:border-cyan-500 transition-colors"></div>

      {/* Image Container */}
      <div className="relative w-full aspect-[3/4] bg-gray-900 mb-4 overflow-hidden flex items-center justify-center">
        {product.imageUrl ? (
            <motion.img
            src={product.imageUrl}
            alt={product.title}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
            />
        ) : (
            <div className="text-gray-700 font-bold tech-font text-xs uppercase tracking-widest text-center px-4">
                Image Placeholder
            </div>
        )}
        
        {/* Holographic Overlay Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none mix-blend-overlay"></div>
        
        {/* Badge */}
        {product.isSale && (
          <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 tech-font uppercase tracking-wider transform skew-x-[-10deg]">
            SALE {product.discountPercentage ? `-${product.discountPercentage}%` : ''}
          </div>
        )}

        {/* Add to Cart Action */}
        <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-black/80 backdrop-blur-sm border-t border-white/10">
            <button className="w-full py-2 bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2">
                <Plus size={14} /> View Details
            </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-2 pb-2">
        <h3 className="text-white font-bold text-sm brand-font mb-2 line-clamp-2 leading-tight group-hover:text-cyan-400 transition-colors">
          {product.title}
        </h3>
        
        <div className="flex items-end justify-between border-t border-gray-800 pt-2 mt-2">
          <div className="flex flex-col">
             <span className="text-[10px] text-gray-500 uppercase tech-font tracking-wider">Price</span>
             <div className="flex gap-2 items-baseline">
                {product.isSale && (
                  <span className="text-xs text-gray-500 line-through font-mono">Rp {product.originalPrice?.toLocaleString()}</span>
                )}
                <span className={`text-sm font-bold font-mono ${product.isSale ? 'text-red-500' : 'text-white'}`}>
                  Rp {product.price.toLocaleString()}
                </span>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
