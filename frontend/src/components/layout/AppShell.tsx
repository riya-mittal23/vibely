import React from 'react';
import { AnimatedBackground } from './AnimatedBackground.tsx';
import { Navbar } from './Navbar.tsx';
import { useSocket } from '../../hooks/useSocket';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  useSocket(); // Initialize socket connection

  return (
    <div className="h-[100dvh] w-full flex flex-col text-foreground relative selection:bg-primary/30 overflow-hidden">
      <AnimatedBackground />
      <Navbar />
      <main className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-2 pb-2 sm:px-6 lg:px-8 overflow-y-auto overflow-x-hidden min-h-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {children}
      </main>
    </div>
  );
};
