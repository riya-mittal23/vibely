import React from 'react';

export const AnimatedBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background">
      {/* Subtle Grain Overlay */}
      <div className="noise-overlay" />

      {/* Starry Space Background */}
      <div className="stars-bg absolute inset-0 opacity-60" />
      <div className="stars-bg absolute inset-0 opacity-30" style={{ transform: 'scale(1.5)', animationDuration: '150s' }} />

      {/* Animated Nebula Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/20 blur-[120px] animate-blob1 mix-blend-screen" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full bg-secondary/15 blur-[150px] animate-blob2 mix-blend-screen" />
      <div className="absolute top-[20%] left-[30%] w-[50vw] h-[50vw] rounded-full bg-accent/20 blur-[100px] animate-blob3 mix-blend-screen" />
      
      {/* Twinkling and Shooting Stars */}
      <div className="twinkle-stars absolute inset-0 opacity-50" />
      <div className="shooting-star" />
      <div className="shooting-star" />
      <div className="shooting-star" />
    </div>
  );
};
