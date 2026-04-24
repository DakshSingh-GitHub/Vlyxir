"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Home, Terminal } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = Math.random() > 0.5 ? "#6366f1" : "#a855f7"; // Indigo or Purple
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > canvas!.width) this.x = 0;
        if (this.x < 0) this.x = canvas!.width;
        if (this.y > canvas!.height) this.y = 0;
        if (this.y < 0) this.y = canvas!.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw connecting lines
      ctx.strokeStyle = "rgba(99, 102, 241, 0.1)";
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-[#0b0b0f] text-white overflow-hidden font-sans">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <div className="mb-8 relative inline-block">
          <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
          <Terminal className="w-24 h-24 text-indigo-400 relative z-10" />
        </div>

        <h1 className="text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-600 mb-4 tracking-tighter">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-200 mb-4">
          Page Not Found
        </h2>
        
        <p className="text-gray-400 max-w-md mx-auto mb-10 text-sm md:text-base leading-relaxed">
          The requested resource could not be found on this server. 
          It seems you've ventured into undefined territory.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/"
            className="group flex items-center gap-2 px-6 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-200 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          
          <button 
            onClick={() => {
              if (pathname === '/admin') {
                router.push('/');
              } else if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            className="group flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-xl font-semibold hover:bg-white/10 transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Go Back</span>
          </button>
        </div>
      </div>

      {/* Footer Code Snippet Decoration */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center opacity-30 pointer-events-none">
        <div className="bg-black/50 backdrop-blur-sm border border-white/5 rounded-lg p-4 font-mono text-xs text-gray-500">
          <p><span className="text-purple-400">if</span> (!page.exists) &#123;</p>
          <p className="pl-4"><span className="text-blue-400">throw</span> <span className="text-green-400">new</span> Error(<span className="text-yellow-300">"404"</span>);</p>
          <p>&#125;</p>
        </div>
      </div>
    </div>
  );
}
