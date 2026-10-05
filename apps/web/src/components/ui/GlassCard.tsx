import React from 'react';

export const GlassCard: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, className = '', ...props }) => (
  <div className={`glass-panel p-5 md:p-6 relative overflow-hidden flex flex-col justify-between ${className}`} {...props}>
    {children}
  </div>
);
