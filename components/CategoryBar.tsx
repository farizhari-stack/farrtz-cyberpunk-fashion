
import React, { useState } from 'react';
import { motion as framerMotion } from 'framer-motion';
import { ShoppingBag, Crown, Scissors, Zap, Sun, Baby, Shirt, LayoutGrid } from 'lucide-react';

const motion = framerMotion as any;

// Configuration for categories with local image paths and fallback icons
// IMPORTANT: Save your 3D images in the public/icons folder with these filenames.
export const categories = [
  { name: "See All Product", imagePath: "/icons/menu-3d.png", Icon: LayoutGrid },
  { name: "T-shirt", imagePath: "/icons/tshirt-3d.png", Icon: Shirt },
  { name: "Bags", imagePath: "/icons/bag-3d.png", Icon: ShoppingBag },
  { name: "Hats", imagePath: "/icons/hat-3d.png", Icon: Crown },
  { name: "Hoodies", imagePath: "/icons/hoodie-3d.png", Icon: Zap },
  { name: "Tank Tops", imagePath: "/icons/tanktop-3d.png", Icon: Sun },
  { name: "Kids", imagePath: "/icons/kids-3d.png", Icon: Baby },
  { name: "Shorts", imagePath: "/icons/shorts-3d.png", Icon: Scissors },
];

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}


// Helper component to handle image loading and fallback
interface CategoryItemProps {
  category: {
    name: string;
    imagePath: string;
    Icon: React.ComponentType<any>;
  };
  isSelected: boolean;
  onClick: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ category, isSelected, onClick }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -5, scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center cursor-pointer group"
    >
      <div className={`
        w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-2 transition-all duration-300 relative overflow-hidden p-2
        ${isSelected
          ? 'bg-[#1a1a2e]/80 border-2 border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
          : 'bg-[#1a1a2e] border border-white/5 shadow-lg group-hover:border-purple-500 group-hover:shadow-[0_0_15px_rgba(124,58,237,0.4)]'}
      `}>
        {isSelected && <div className="absolute inset-0 bg-cyan-400/10 animate-pulse rounded-2xl"></div>}

        {!imageError ? (
          <img
            src={category.imagePath}
            alt={category.name}
            onError={() => setImageError(true)}
            className={`w-full h-full object-contain drop-shadow-lg transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-110'}`}
          />
        ) : (
          <category.Icon
            size={28}
            className={`transition-colors duration-300 ${isSelected ? 'text-cyan-400' : 'text-gray-400 group-hover:text-white'}`}
          />
        )}
      </div>
      <span className={`text-[10px] md:text-xs font-bold uppercase tracking-widest tech-font transition-colors ${isSelected ? 'text-cyan-400' : 'text-gray-500 group-hover:text-white'
        }`}>
        {category.name}
      </span>
    </motion.div>
  );
};

const CategoryBar: React.FC<CategoryBarProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="sticky top-20 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <CategoryItem
              key={cat.name}
              category={cat}
              isSelected={selectedCategory === cat.name}
              onClick={() => onSelectCategory(cat.name)}
            />
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default CategoryBar;
