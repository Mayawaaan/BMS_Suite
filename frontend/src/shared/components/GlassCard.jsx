import React from 'react';

export const GlassCard = ({ children, className = '', glow = false, glowColor = 'brand', hover = true, ...props }) => {
  const glowClasses = {
    brand: 'hover:border-[#9A3412]/40 hover:shadow-lg',
    burgundy: 'hover:border-[#8B263E]/40 hover:shadow-lg',
    gold: 'hover:border-[#B4833E]/40 hover:shadow-lg',
    emerald: 'hover:border-emerald-500/40 hover:shadow-lg',
    rose: 'hover:border-rose-500/40 hover:shadow-lg',
    cyan: 'hover:border-cyan-500/40 hover:shadow-lg',
    amber: 'hover:border-amber-500/40 hover:shadow-lg',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-6 shadow-[var(--shadow-card)] transition-all duration-200 ${
        hover ? 'hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]' : ''
      } ${glow ? glowClasses[glowColor] || glowClasses.brand : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default GlassCard;
