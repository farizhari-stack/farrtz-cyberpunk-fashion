import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

const motion = framerMotion as any;

const Hero: React.FC = () => {
  return (
    <div className="relative w-full overflow-hidden bg-[#050505] min-h-[650px] flex items-center border-b border-purple-900/30">

      {/* Cyberpunk Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-purple-900/20 via-blue-900/10 to-transparent skew-x-12 opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(76,29,149,0.15),transparent_50%)]"></div>

        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full flex flex-col md:flex-row items-center">

        {/* Text Content */}
        <div className="w-full md:w-1/2 text-white pt-10 md:pt-0 relative">
          {/* Decorative line */}
          <div className="absolute -left-8 top-20 w-1 h-32 bg-gradient-to-b from-cyan-400 to-purple-500 hidden lg:block"></div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-block px-3 py-1 mb-4 border border-cyan-500/30 rounded-full bg-cyan-900/20 backdrop-blur-sm">
              <span className="text-cyan-400 text-xs font-bold tracking-[0.2em] uppercase tech-font">Cyber-Week Exclusive</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-none mb-6 brand-font italic">
              SALE! <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">EVERYTHING IS</span> <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 filter drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                UP TO 50% OFF
              </span>
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <button className="group relative px-8 py-4 bg-white text-black font-bold text-lg overflow-hidden skew-x-[-10deg] hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-cyan-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative flex items-center gap-3 skew-x-[10deg] group-hover:text-white transition-colors">
                Shop The Sale <ArrowRight size={20} />
              </span>
            </button>
          </motion.div>

          {/* Stats with Hover Color Change */}
          <div className="flex gap-10 mt-16 border-t border-white/10 pt-8">
            {[
              { val: '89.2K+', label: 'Discover the Future' },
              { val: '7001+', label: 'Stories and Lore' },
              { val: '3,124+', label: 'Art and Design' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (index * 0.1) }}
                className="flex flex-col cursor-default"
              >
                <motion.span
                  whileHover={{
                    color: '#22d3ee',
                    textShadow: '0px 0px 15px rgba(34, 211, 238, 0.8)',
                    scale: 1.1
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="text-4xl md:text-5xl font-bold brand-font text-white transition-colors duration-200"
                >
                  {stat.val}
                </motion.span>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest tech-font mt-1">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Hero Image / Model - Dual Display */}
        <div className="w-full md:w-1/2 relative mt-10 md:mt-0 flex justify-center md:justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="relative w-full max-w-[550px] h-[480px] md:h-[600px] mr-0 md:mr-10"
          >
            {/* Glitchy Background Rects */}
            <div className="absolute top-5 -right-5 w-full h-full border-2 border-purple-500/30 rounded-none z-0"></div>
            <div className="absolute -bottom-5 -left-5 w-full h-full border-2 border-cyan-500/30 rounded-none z-0"></div>

            {/* Main Image Container - Two Models Side by Side */}
            <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex gap-2">
              {/* Model 1 - Black T-shirt "FUTURE'S EDGE" */}
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex-1 relative overflow-hidden group"
              >
                <img
                  src="/tshirt-black-futures-edge.png"
                  alt="Cyberpunk Fashion - Black T-Shirt FUTURE'S EDGE"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                {/* Label */}
                <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 border-l-2 border-cyan-400">
                  <p className="text-xs text-cyan-400 font-bold">FUTURE'S EDGE</p>
                </div>
              </motion.div>

              {/* Model 2 - White T-shirt Japanese Style */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="flex-1 relative overflow-hidden group"
              >
                <img
                  src="/tshirt-white-techwear.png"
                  alt="Cyberpunk Fashion - White T-Shirt TECH-WEAR"
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                {/* Label */}
                <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-sm px-3 py-1.5 border-r-2 border-purple-500">
                  <p className="text-xs text-purple-400 font-bold">TECH-WEAR</p>
                </div>
              </motion.div>
            </div>

            {/* Floating "NEW ARRIVAL" Tag */}
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute bottom-20 -left-12 z-20 bg-black/80 backdrop-blur-md border-l-4 border-cyan-400 p-4 text-white shadow-lg max-w-[180px]"
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap size={14} className="text-cyan-400" />
                <p className="text-xs font-bold brand-font text-cyan-400">NEW ARRIVAL</p>
              </div>
              <p className="text-sm font-bold leading-tight">DUAL COLLECTION</p>
            </motion.div>
          </motion.div>
        </div>

      </div>

      {/* Background Big Text Overlay */}
      <div className="absolute -bottom-12 left-0 right-0 select-none pointer-events-none overflow-hidden opacity-10">
        <span className="text-[120px] md:text-[200px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent whitespace-nowrap brand-font tracking-tighter">
          CYBERPUNK
        </span>
      </div>
    </div>
  );
};

export default Hero;
