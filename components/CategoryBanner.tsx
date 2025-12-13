import React from 'react';
import { motion as framerMotion } from 'framer-motion';

const motion = framerMotion as any;

interface CategoryBannerProps {
  category: string;
}

const CategoryBanner: React.FC<CategoryBannerProps> = ({ category }) => {
  // Map categories to specific background images or colors
  const getBannerImage = (cat: string) => {
    // Custom cyberpunk banners for each category
    switch (cat) {
      case 'T-Shirt': return '/banner-tshirt.png';
      case 'Bags': return '/banner-bags.png';
      case 'Hats': return '/banner-hats.png';
      case 'Hoodies': return '/banner-hoodies.png';
      case 'Kids': return '/banner-kids.png';
      case 'Tank Tops': return '/banner-tank-tops.png';
      case 'Shorts': return '/banner-shorts-celanapendek_upscayl_5x_ultrasharp-4x.png';
      default: return '/banner-tshirt.png'; // T-shirt default
    }
  };

  return (
    <div className="relative w-full h-[350px] overflow-hidden flex items-end pb-12 justify-start border-b border-purple-500/30">
      {/* Background Image */}
      <div className="absolute inset-0 bg-black">
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5 }}
          src={getBannerImage(category)}
          alt={category}
          className="w-full h-full object-cover opacity-70 hover:opacity-90 transition-all duration-700"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020205] via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#020205]/80 via-[#020205]/40 to-transparent"></div>

        {/* Torn Paper Effect (Visual simulation with SVG/CSS) */}
        <div className="absolute bottom-0 w-full h-12 bg-[#020205]" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0, 80% 60%, 60% 20%, 40% 80%, 20% 40%, 0 90%)" }}></div>
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 px-8 md:px-16 w-full max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="h-[2px] w-12 bg-cyan-500 shadow-[0_0_10px_#22d3ee]"></div>
          <span className="text-cyan-400 tech-font tracking-[0.3em] uppercase text-sm font-bold">Category</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black brand-font text-white tracking-wide capitalize drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]">
          {category}
        </h1>

        {/* Breadcrumb-style links under title */}
        <div className="mt-4 flex gap-4 text-xs text-gray-400 tech-font">
          <span className="hover:text-white cursor-pointer">Home</span>
          <span>/</span>
          <span className="hover:text-white cursor-pointer">Shop</span>
          <span>/</span>
          <span className="text-purple-400 font-bold">{category}</span>
        </div>
      </motion.div>

      {/* Decorative Tech Elements */}
      <div className="absolute top-10 right-10 flex gap-2">
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse delay-75"></div>
        <div className="w-2 h-2 bg-white rounded-full animate-pulse delay-150"></div>
      </div>
    </div>
  );
};

export default CategoryBanner;