import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useNavigate } from 'react-router-dom';
import { Target, MessageSquareText, Compass } from 'lucide-react';
import { motion } from 'framer-motion';

export const HowToPlay: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex flex-col items-center py-12 px-4"
    >
      <h1 className="text-4xl sm:text-5xl font-display font-bold mb-12 uppercase tracking-widest text-center">
        How To Play
      </h1>
      
      <div className="w-full max-w-4xl space-y-8 mb-12">
        <Card className="flex flex-col sm:flex-row gap-6 items-center p-8">
          <div className="w-16 h-16 shrink-0 rounded-full bg-primary/20 flex items-center justify-center">
            <Compass className="text-primary" size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">1. See the spectrum</h3>
            <p className="text-white/70 text-lg">
              One player is the Clue Giver. They receive a spectrum with two extremes (e.g., "Chill" to "Chaotic") and see a hidden target zone somewhere on that spectrum.
            </p>
          </div>
        </Card>

        <Card className="flex flex-col sm:flex-row gap-6 items-center p-8">
          <div className="w-16 h-16 shrink-0 rounded-full bg-secondary/20 flex items-center justify-center">
            <MessageSquareText className="text-secondary" size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">2. Give a clue</h3>
            <p className="text-white/70 text-lg">
              The Clue Giver provides a single clue that they believe lands exactly where the hidden target is located on the spectrum.
            </p>
          </div>
        </Card>

        <Card className="flex flex-col sm:flex-row gap-6 items-center p-8">
          <div className="w-16 h-16 shrink-0 rounded-full bg-accent/20 flex items-center justify-center">
            <Target className="text-accent" size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold mb-2">3. Place your guess</h3>
            <p className="text-white/70 text-lg">
              The other players discuss the clue and move the marker to where they think it belongs. The closer they are to the hidden target, the more points they score!
            </p>
          </div>
        </Card>
      </div>

      <Button size="xl" onClick={() => navigate('/play')} className="px-12">
        GOT IT, LET'S PLAY
      </Button>
    </motion.div>
  );
};
