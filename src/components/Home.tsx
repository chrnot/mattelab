import React from 'react';
import { motion } from 'motion/react';

const Home: React.FC = () => {
  return (
    <div className="flex-1 h-full relative overflow-hidden bg-stone-50">
      {/* Background Image */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop" 
          alt="Mattelab Background" 
          className="w-full h-full object-cover opacity-20"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white/80 to-stone-100/50" />
      </motion.div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="max-w-4xl space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-7xl font-serif font-bold text-stone-900 italic tracking-tight">
              Mattelab
            </h1>
            <p className="text-xl font-bold uppercase tracking-[0.4em] text-stone-400">
              Utforska matematiken
            </p>
          </div>
          
          <div className="w-24 h-1 bg-amber-500 mx-auto rounded-full" />
          
          <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed font-medium">
            Välkommen till en interaktiv miljö där matematik blir levande. 
            Välj en laboration i menyn till vänster för att börja utforska.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
