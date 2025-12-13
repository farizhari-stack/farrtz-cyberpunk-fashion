
import React, { useState, useMemo, useEffect } from 'react';
import { motion as framerMotion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import CategoryBar from './CategoryBar';
import Hero from './Hero';
import ProductSection from './ProductSection';
import Footer from './Footer';
import FeedbackSection from './FeedbackSection';
import ChatWidget from './ChatWidget';
import AccountSidebar from './AccountSidebar';
import CategoryBanner from './CategoryBanner';
import { Product, PageType, User, Feedback, ChatConversation, ChatMessage } from '../types';
import { generateProducts, generateMixedProducts } from '../utils/products';
import { productService } from '../services/productService';

const motion = framerMotion as any;

interface HomeProps {
    onNavigate: (page: PageType) => void;
    user: User | null;
    onLogout: () => void;
    onProductClick: (product: Product) => void;
    cartItemCount: number;
    targetCategory?: string | null;
    onSearch?: (query: string) => void;
    onSubmitFeedback?: (feedback: Omit<Feedback, 'id' | 'date' | 'status'>) => void;
    conversations?: ChatConversation[];
    onSendMessage?: (userId: string, userName: string, message: string) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate, user, onLogout, onProductClick, cartItemCount, targetCategory, onSearch, onSubmitFeedback, conversations = [], onSendMessage }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState("See All Product");

    // Real active products from Service (simulated DB)
    const [allProducts, setAllProducts] = useState<Product[]>([]);

    useEffect(() => {
        // Initial fetch to get any admin changes
        setAllProducts(productService.getAllProducts());

        if (targetCategory) {
            setActiveCategory(targetCategory);
        }
    }, [targetCategory]);

    const handleAccountClick = () => {
        if (user) {
            setIsSidebarOpen(true);
        } else {
            onNavigate('login');
        }
    };

    const handleLogout = () => {
        setIsSidebarOpen(false);
        onLogout();
    };

    const handleCategorySelect = (category: string) => {
        if (category === "See All Product") {
            onNavigate('all-products');
        } else {
            setActiveCategory(category);
        }
    };

    const handleViewAllClick = () => {
        onNavigate('all-products');
    };

    // Data Logic
    const isMainPage = activeCategory === "See All Product";

    // Filter Active Flash Sales
    const activeFlashSaleProducts = useMemo(() => {
        const now = new Date();
        return allProducts.filter(p => {
            if (!p.isSale || !p.discountEndTime) return false;
            const expiry = new Date(p.discountEndTime);
            return expiry > now;
        });
    }, [allProducts]);

    // Find the earliest ending time for the timer (to create urgency)
    const flashSaleEndTime = useMemo(() => {
        if (activeFlashSaleProducts.length === 0) return null;
        // Sort by time, get first
        const sorted = [...activeFlashSaleProducts].sort((a, b) => new Date(a.discountEndTime!).getTime() - new Date(b.discountEndTime!).getTime());
        return sorted[0].discountEndTime;
    }, [activeFlashSaleProducts]);

    // Best Sellers (Simulated from all products)
    const bestSellers = useMemo(() => {
        // Just take first 8 non-sale items or mixed for demo
        return allProducts.filter(p => !p.isSale).slice(0, 8);
    }, [allProducts]);

    // New Arrivals
    const newArrivals = useMemo(() => {
        return allProducts.filter(p => p.isNew).slice(0, 8);
    }, [allProducts]);

    // Category Logic (Simulated generation based on category if in main DB, else fallback to utils)
    const categoryProducts = useMemo(() => {
        const filtered = allProducts.filter(p => p.category === activeCategory);
        if (filtered.length > 0) return filtered;
        return generateProducts(activeCategory, 12, 600);
    }, [activeCategory, allProducts]);

    return (
        <div className="min-h-screen bg-[#020205] text-white font-sans overflow-x-hidden selection:bg-cyan-500 selection:text-black">
            <Navbar
                onAccountClick={handleAccountClick}
                onHomeClick={() => setActiveCategory("See All Product")}
                onCartClick={() => onNavigate('cart')}
                cartItemCount={cartItemCount}
                onSearch={onSearch}
            />

            <CategoryBar
                selectedCategory={activeCategory}
                onSelectCategory={handleCategorySelect}
            />

            <AccountSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout}
                user={user}
                onNavigate={onNavigate}
            />

            <AnimatePresence mode='wait'>
                {isMainPage ? (
                    <motion.div
                        key="main-content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <Hero />

                        {activeFlashSaleProducts.length > 0 && flashSaleEndTime && (
                            <ProductSection
                                id="flashsale"
                                title="Flash Sale"
                                subtitle="Hurry! Limited time offers on active gear."
                                products={activeFlashSaleProducts}
                                bgColor="bg-gradient-to-b from-[#0a0a0a] to-[#2e1065]"
                                onProductClick={onProductClick}
                                onViewAll={handleViewAllClick}
                                headerComponent={<CountdownTimer targetDate={flashSaleEndTime} />}
                            />
                        )}

                        <ProductSection
                            id="new-arrivals"
                            title="New Arrivals"
                            subtitle="Fresh from the cyber-forge."
                            products={newArrivals}
                            bgColor="bg-[#050505]"
                            onProductClick={onProductClick}
                            onViewAll={handleViewAllClick}
                        />

                        <ProductSection
                            id="bestsellers"
                            title="Best Sellers"
                            subtitle="Check out the most popular products on the Farrtz Marketplace!"
                            products={bestSellers}
                            bgColor="bg-[#0a0a0a]"
                            onProductClick={onProductClick}
                            onViewAll={handleViewAllClick}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key={`category-${activeCategory}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Specific Category View Header */}
                        <CategoryBanner category={activeCategory} />

                        {/* Main Category Grid */}
                        <ProductSection
                            id="cat-all"
                            title={`${activeCategory}`}
                            subtitle={`Browse our collection of ${activeCategory}`}
                            products={categoryProducts}
                            bgColor="bg-[#020205]"
                            onProductClick={onProductClick}
                            onViewAll={handleViewAllClick} // Added View All for category pages too
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Feedback Section - Only show if user is logged in */}
            {user && onSubmitFeedback && (
                <FeedbackSection user={user} onSubmitFeedback={onSubmitFeedback} />
            )}

            <Footer />

            {/* Chat Widget - Only show if user is logged in */}
            {user && onSendMessage && (
                <ChatWidget
                    userId={user.id}
                    userName={`${user.firstName} ${user.lastName}`}
                    onSendMessage={(message) => onSendMessage(user.id, `${user.firstName} ${user.lastName}`, message)}
                    messages={(conversations.find(c => c.userId === user.id)?.messages || [])}
                />
            )}
        </div>
    );
};

// Countdown Timer Component
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function calculateTimeLeft() {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60))), // Show total hours, not days
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            };
        }
        return timeLeft as { hours: number, minutes: number, seconds: number };
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const formatTime = (time: number) => {
        return time < 10 ? `0${time}` : time;
    };

    if (Object.keys(timeLeft).length === 0) {
        return <span className="text-red-500 font-bold">Ended</span>;
    }

    return (
        <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span className="text-xs uppercase font-bold tracking-widest text-cyan-400 animate-pulse">Ending In:</span>
            <div className="flex gap-2 font-mono text-2xl font-black text-white bg-black/50 px-4 py-2 rounded-lg border border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
                <span className="text-red-500">{formatTime(timeLeft.hours)}</span>
                <span className="animate-pulse">:</span>
                <span className="text-red-500">{formatTime(timeLeft.minutes)}</span>
                <span className="animate-pulse">:</span>
                <span className="text-red-500">{formatTime(timeLeft.seconds)}</span>
            </div>
        </div>
    );
};

export default Home;
