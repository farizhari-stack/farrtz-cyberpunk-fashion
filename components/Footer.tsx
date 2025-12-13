import React from 'react';
import { motion as framerMotion } from 'framer-motion';
import { Instagram, Twitter, Github } from 'lucide-react';

const motion = framerMotion as any;

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-[#0f0c29] text-white pt-20 pb-10 overflow-hidden">
      
      {/* Background Image Overlay */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
         <img 
            src="https://picsum.photos/1920/1080?grayscale" 
            className="w-full h-full object-cover mix-blend-overlay" 
            alt="background" 
         />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
               <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-black font-bold text-xl">
                  🦊
               </div>
               <span className="text-3xl font-bold brand-font">FARRTZ</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Don't love it? We'll fix it. For free.<br/>
              100% Free Exchanges.
            </p>
            
            <div className="pt-4">
                <h4 className="font-bold mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                    <motion.a whileHover={{ y: -3, color: '#22d3ee' }} href="#" className="bg-white text-black p-2 rounded-full"><Twitter size={20} /></motion.a>
                    <motion.a whileHover={{ y: -3, color: '#e879f9' }} href="#" className="bg-white text-black p-2 rounded-full"><Instagram size={20} /></motion.a>
                    <motion.a whileHover={{ y: -3, color: '#818cf8' }} href="#" className="bg-white text-black p-2 rounded-full"><Github size={20} /></motion.a>
                </div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 brand-font">Support</h3>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Order Status</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact US</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Code Coupon</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-6 brand-font">About Us</h3>
            <ul className="space-y-4 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
             <h3 className="text-xl font-bold mb-6 brand-font">Contact</h3>
             <ul className="space-y-4 text-gray-400">
                <li><span className="block text-white font-medium">Phone:</span> +6238 0024 8686</li>
                <li><span className="block text-white font-medium">Email:</span> Farrtz@gmail.com</li>
                <li><span className="block text-white font-medium">Address:</span> Neo Tokyo, Sector 7, Floor 42</li>
             </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>CyberBeats - Farrtz 2025. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
             <a href="#" className="hover:text-white">Terms</a>
             <a href="#" className="hover:text-white">Privacy</a>
             <a href="#" className="hover:text-white">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;