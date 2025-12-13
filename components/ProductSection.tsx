
import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import ProductCard from './ProductCard';
import { Product } from '../types';

const motion = framerMotion as any;

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: Product[];
  bgColor?: string;
  id?: string;
  onProductClick?: (product: Product) => void;
  onViewAll?: () => void;
  headerComponent?: React.ReactNode;
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, subtitle, products, bgColor = "bg-[#1a1a2e]", id, onProductClick, onViewAll, headerComponent }) => {
  return (
    <section id={id} className={`py-16 ${bgColor} relative overflow-hidden`}>
      {/* Decorative Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div className="text-center md:text-left">
             <h2 className="text-3xl md:text-4xl font-bold text-white brand-font mb-2">{title}</h2>
             {subtitle && <p className="text-gray-400 font-medium">{subtitle}</p>}
          </div>
          {headerComponent}
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 lg:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ProductCard product={product} onClick={() => onProductClick && onProductClick(product)} />
            </motion.div>
          ))}
        </div>

        {/* View All Button (Conditional if onViewAll is provided) */}
        {onViewAll && (
            <div className="mt-12 text-center">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onViewAll}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                    View All {title}
                </motion.button>
            </div>
        )}
      </div>
    </section>
  );
};

export default ProductSection;
