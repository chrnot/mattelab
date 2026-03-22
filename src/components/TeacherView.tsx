import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Info, HelpCircle } from 'lucide-react';

const TeacherView: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all flex items-center space-x-2 ${
          isOpen ? 'bg-stone-800 text-white' : 'bg-white text-stone-800 border border-stone-200'
        }`}
      >
        {isOpen ? <EyeOff size={24} /> : <Eye size={24} />}
        <span className="font-bold text-sm uppercase tracking-widest">Lärarvy</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-96 p-8 bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
          >
            <div className="flex flex-col space-y-6">
              <div className="flex items-center space-x-3 text-amber-600">
                <Info size={24} />
                <h3 className="text-xl font-serif font-medium italic">Grodtricket</h3>
              </div>

              <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
                <p>
                  Det kritiska ögonblicket är det <span className="font-bold text-stone-800">tredje draget</span>. 
                  Efter att ha flyttat den första röda grodan och hoppat över den med en grön groda, 
                  måste man flytta <span className="font-bold text-stone-800 italic">nästa gröna groda</span> till den tomma platsen.
                </p>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 italic">
                  "Flytta aldrig två grodor av samma färg intill varandra, om de inte redan är på sina slutplatser."
                </div>
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-800 uppercase text-xs tracking-widest">Diskussionsunderlag:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Hur ser vi att n(n+2) är samma som n² + 2n?</li>
                    <li>Varför ökar antalet hopp med 5, 7, 9...?</li>
                    <li>Vad händer om vi har olika antal grodor i familjerna?</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-center space-x-2 text-stone-400">
                  <HelpCircle size={16} />
                  <span className="text-xs uppercase tracking-widest">Facit: h = n² + 2n</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherView;
