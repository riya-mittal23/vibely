import React from 'react';
import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glass?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  className, 
  children, 
  glass = true,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "rounded-2xl p-6",
        glass ? "glass-panel" : "bg-card border border-white/5 shadow-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
