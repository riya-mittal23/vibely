import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Target, MessageSquareText, Compass } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 sm:px-6">
      
      {/* Hero Section */}
      <div className="max-w-3xl w-full text-center space-y-8 mb-20 mt-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4 drop-shadow-xl">
            Where does your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">vibe</span> land?
          </h1>
          <p className="text-xl sm:text-2xl text-white/80 font-medium">
            Give a clue. Read the room. Find the perfect spot.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col items-center justify-center gap-4 pt-8 max-w-sm mx-auto"
        >
          <Button size="xl" onClick={() => navigate('/online-setup')} className="w-full">
            PLAY WITH FRIENDS (ONLINE)
          </Button>
          <Button variant="outline" size="md" onClick={() => navigate('/how-to-play')} className="w-full border-white/20 hover:bg-white/10 mt-4">
            HOW TO PLAY
          </Button>
        </motion.div>
      </div>

      {/* Interactive Preview Concept (Simplified for Home) */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="w-full max-w-2xl mx-auto mb-24"
      >
        <Card className="p-8 text-center border-primary/30">
          <p className="text-sm uppercase tracking-widest text-primary font-bold mb-6">HOW CHAOTIC?</p>
          <div className="relative w-full h-12 mb-8">
            <div className="absolute top-1/2 left-0 w-full h-4 -translate-y-1/2 bg-white/10 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            </div>
            {/* Animated marker */}
            <motion.div 
              className="absolute top-1/2 -translate-y-1/2 -ml-6 w-12 h-12 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.5)] border-4 border-primary z-10"
              animate={{ left: ["20%", "80%", "50%"] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <div className="flex justify-between text-sm font-medium text-white/60 uppercase mb-8">
            <span>Chill</span>
            <span>Chaotic</span>
          </div>
          <div className="inline-block px-6 py-3 rounded-full bg-white/5 border border-white/10">
            <p className="italic font-medium text-lg text-white">"Ordering dessert before dinner"</p>
          </div>
        </Card>
      </motion.div>

      {/* How it Works Summary */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="flex flex-col items-center text-center p-8 hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-6">
            <Compass className="text-primary" size={24} />
          </div>
          <h3 className="text-xl font-bold mb-3">01. Get a Spectrum</h3>
          <p className="text-white/60">Everything from Totally Normal to Absolutely Wild.</p>
        </Card>

        <Card className="flex flex-col items-center text-center p-8 hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center mb-6">
            <MessageSquareText className="text-secondary" size={24} />
          </div>
          <h3 className="text-xl font-bold mb-3">02. Give a Clue</h3>
          <p className="text-white/60">Say something that lands exactly between the two extremes.</p>
        </Card>

        <Card className="flex flex-col items-center text-center p-8 hover:bg-white/10 transition-colors">
          <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center mb-6">
            <Target className="text-accent" size={24} />
          </div>
          <h3 className="text-xl font-bold mb-3">03. Find the Vibe</h3>
          <p className="text-white/60">Place your guess. Reveal the target. See how close you got.</p>
        </Card>
      </div>
    </div>
  );
};
