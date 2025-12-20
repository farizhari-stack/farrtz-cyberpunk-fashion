
import { Product } from '../types';

// Enhanced Mock Data Generation based on Category
export const getProductTitle = (category: string, index: number) => {
  const titles: Record<string, string[]> = {
    'T-shirt': ['NEON ORB Surreal Eye Portrait T-Shirt', 'Neon Flamingo Vaporwave Tropic T-Shirt', 'Porcelain Memory — Vintage Doll Study T-Shirt', 'CHROME SERAPHIM — CHR-01: Halo Requiem T-Shirt', 'Tiger Storm Seal — Unit RAIJIN T-Shirt', 'Cyber Fox Emblem — Tactical Mode T-Shirt', 'Vortex Serpent — Spindel Core (VOID-01) T-Shirt', 'RAIJU KITSUNE — Plasma Eclipse Form T-Shirt'],
    'Bags': ['NEON ORB Surreal Eye Portrait Bag', 'Holo-Sheen Crossbody Messenger', 'Urban Drifter Tech Tote', 'Quantum Duffel Bag - Series 7', 'Stealth Courier Pack v2', 'Neon Trim Sling Bag', 'Data-Runner Hard Shell Satchel', 'Void Storage Unit - Black'],
    'Hats': ['NEON ORB Surreal Eye Portrait Hat', 'Neon Visor v2 - Cyan', 'Street Samurai Snapback', 'Digital Camo Bucket Hat', 'Cyber-Goth Beanie', 'Chromed Out Trucker Hat', 'LED Display Cap - Programmable', 'Night City Embroidered Beanie'],
    'Hoodies': ['Tech-Fleece Oversized Hoodie', 'Glitch Camo Zip-Up', 'Netrunner Graphic Pullover', 'Void Black Mantle', 'Cyber-Samurai Tech Hoodie', 'Neon Stitch Heavyweight Hoodie', 'Hacker Silhouette Sweatshirt', 'Urban Ninja Shell Jacket'],
    'Tank Tops': ['NEON ORB Surreal Eye Portrait Tank Top', 'Mesh Grid Runner Vest', 'Neon Trim Workout Tank', 'Bio-Mech Sleeveless Top', 'Core Temperature Regulating Tank', 'Flux Flow Yoga Top', 'Sector 7 Sports Jersey', 'Rebel Scum Distressed Tank'],
    'Kids': ['Vintage Doll Study Kids T-Shirt', 'Future Hero Onesie', 'Robo-Pup Graphic Tee', 'Little Glitch Hoodie', 'Pixel Art Cap - Kids Size', 'Neon Kids Light-Up Sneakers', 'Junior Space Ranger Tee', 'Tiny Tech Vest'],
    'Shorts': ['Neon Flamingo Vaporwave Tropic Shorts', 'Urban Utility Bermudas', 'Neon Runner Athletic Shorts', 'Digital Camo Sweat Shorts', 'Flux Performance Shorts', 'Tactical Knee-Length Shorts', 'Street Basketball Mesh Shorts', 'Swim Grid Trunks']
  };

  // Fallback if index exceeds array length
  const categoryTitles = titles[category] || titles['T-shirt'];
  return categoryTitles[index % categoryTitles.length];
};

export const getProductImage = (category: string, id: number) => {
  // Map categories to local assets in /public
  // Next.js serves files in /public at the root URL path
  switch (category) {
    case 'T-shirt':
      return id % 2 === 0 ? "/tshirt-black-futures-edge.png" : "/tshirt-white-techwear.png";
    case 'Bags':
      return "/icons/bag-3d.png";
    case 'Hats':
      return "/icons/hat-3d.png";
    case 'Hoodies':
      return "/icons/hoodie-3d.png";
    case 'Kids':
      return "/icons/kids-3d.png";
    case 'Shorts':
      return "/icons/shorts-3d.png";
    case 'Tank Tops':
      // Fallback or use banner if no specific icon
      return "/tshirt-white-techwear.png";
    default:
      return "/cyberpunk-robot.png";
  }
};

// Base prices matching the design specs
export const getCategoryBasePrice = (category: string) => {
  switch (category) {
    case 'Bags': return 100000;
    case 'Hats': return 65000;
    case 'Hoodies': return 350000;
    case 'Tank Tops': return 120000;
    case 'Kids': return 150000;
    case 'Shorts': return 100000;
    case 'T-shirt':
    default: return 250000;
  }
};

export const generateProducts = (category: string, count: number, startId: number, isSale = false): Product[] => {
  const basePrice = getCategoryBasePrice(category);

  return Array.from({ length: count }).map((_, i) => ({
    id: startId + i,
    title: getProductTitle(category, i),
    price: isSale ? basePrice * 0.5 : basePrice, // 50% off if sale
    originalPrice: isSale ? basePrice : undefined,
    imageUrl: getProductImage(category, startId + i),
    category: category,
    isSale: isSale,
    isNew: i < 2 // Mark first two as new
  }));
};

// Generate a mix of products from all categories for the main page
export const generateMixedProducts = (count: number, startId: number): Product[] => {
  const categories = ['T-shirt', 'Bags', 'Hats', 'Hoodies', 'Tank Tops', 'Kids', 'Shorts'];
  return Array.from({ length: count }).map((_, i) => {
    const category = categories[i % categories.length];
    const basePrice = getCategoryBasePrice(category);
    return {
      id: startId + i,
      title: getProductTitle(category, i),
      price: basePrice,
      originalPrice: undefined,
      imageUrl: getProductImage(category, startId + i),
      category: category,
      isSale: false,
      isNew: i < 3 // Mark a few as new
    };
  });
};

// Helper to find a product by ID from our "database" of generated products
export const getProductById = (id: number): Product | undefined => {
  // We search through our standard sets of generated data
  // This is a simulation since we don't have a real DB
  const allGeneratedProducts = [
    ...generateMixedProducts(8, 100),
    ...generateMixedProducts(4, 200).map(p => ({ ...p, isSale: true, price: p.price * 0.5, originalPrice: p.price })),
    ...generateMixedProducts(16, 300),
    // Add some category specific ranges just in case
    ...generateProducts('T-shirt', 20, 500),
    ...generateProducts('Bags', 20, 600),
    ...generateProducts('Hats', 20, 700),
    ...generateProducts('Hoodies', 20, 800),
    ...generateProducts('Tank Tops', 20, 900),
  ];

  return allGeneratedProducts.find(p => p.id === id);
};
