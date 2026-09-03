import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'How to Play', path: '/how-to-play' },
  ];

  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="w-full z-40 bg-background/50 backdrop-blur-lg border-b border-white/5 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-2xl font-display font-bold tracking-tighter text-white" onClick={closeMenu}>
              <img src="/vibely-logo.jpg" alt="Vibely Logo" className="w-12 h-12 rounded-full" />
              VIBELY
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white",
                  location.pathname === link.path ? "text-white" : "text-white/60"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white/80 hover:text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-white/10 p-4 flex flex-col space-y-4">
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={cn(
                "block text-lg font-medium py-2 transition-colors",
                location.pathname === link.path ? "text-white" : "text-white/60"
              )}
              onClick={closeMenu}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};
