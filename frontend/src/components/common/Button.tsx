import React from 'react';
import { cn } from '../../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'glass' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background active:scale-95 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    primary: "bg-primary text-white hover:bg-primary/90 shadow-[0_4px_14px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.6)] focus:ring-primary",
    secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10 focus:ring-white/50",
    glass: "glass-button",
    outline: "border border-white/20 text-white hover:bg-white/10 focus:ring-white/50",
    ghost: "bg-transparent text-white/80 hover:text-white hover:bg-white/10 focus:ring-white/50",
  };
  
  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-11 px-6 text-base",
    lg: "h-14 px-8 text-lg",
    xl: "h-16 px-10 text-xl",
  };
  
  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      {...props}
    >
      {children}
    </button>
  );
};
