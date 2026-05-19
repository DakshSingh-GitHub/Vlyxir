"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const LoadingOverlay = () => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0C15]"
        >
            {/* Subtle Gradient Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative flex flex-col items-center gap-8">
                {/* Logo Container */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* Glowing Ring */}
                    <div className="absolute inset-0 rounded-full border border-indigo-500/20 vlyxir-logo-pulse" />
                    <div className="absolute inset-[-10px] rounded-full border border-indigo-500/10 vlyxir-logo-pulse" style={{ animationDelay: '0.5s' }} />
                    
                    {/* The Logo (Image) */}
                    <div className="relative w-20 h-20 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
                        <Image 
                            src="/logo.png" 
                            alt="Vlyxir" 
                            fill 
                            sizes="80px"
                            className="object-contain"
                            loading="eager"
                            priority
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-xl font-black uppercase tracking-[0.3em] text-white/90">
                        Vlyxir
                    </h2>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-bounce" />
                    </div>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">
                    Switching Sessions
                </p>
            </div>
        </motion.div>
    );
};

export default LoadingOverlay;
