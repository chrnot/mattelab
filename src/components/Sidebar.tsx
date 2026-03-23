import React, { useState, useEffect } from 'react';
import { Lab } from '../types';
import { DraftingCompass, CircleDot, Square, ChevronDown, ChevronRight, Menu, Shapes, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentLab: Lab;
  onSelectLab: (lab: Lab) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentLab, onSelectLab }) => {
  const [isExpanded, setIsExpanded] = useState(currentLab !== Lab.HOME);
  const [isLabsOpen, setIsLabsOpen] = useState(true);

  useEffect(() => {
    if (currentLab === Lab.HOME) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  }, [currentLab]);

  const labs = [
    { id: Lab.HOME, label: 'Hem', icon: Home },
    { id: Lab.FROG_JUMP, label: 'Grodhopp', icon: CircleDot },
    { id: Lab.MAGIC_SQUARE, label: 'Magiska Kvadrater', icon: Square },
    { id: Lab.GEOBOARD, label: 'Geobräde', icon: Shapes },
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: isExpanded ? 280 : 80 }}
      className="bg-white border-r border-stone-200 flex flex-col h-screen sticky top-0 z-50 shadow-sm"
    >
      {/* Header / Logo */}
      <div className="p-6 flex items-center justify-between border-b border-stone-100">
        <div 
          className="flex items-center space-x-3 cursor-pointer overflow-hidden"
          onClick={() => onSelectLab(Lab.HOME)}
        >
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-amber-500/20">
            <DraftingCompass size={20} />
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="font-serif font-bold text-lg text-stone-900 italic whitespace-nowrap leading-tight">Mattelab</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 whitespace-nowrap">Utforska matematiken</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <AnimatePresence>
          {isLabsOpen || !isExpanded ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-1"
            >
              {isExpanded && (
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 px-4 mb-4 mt-2">Laborationer</p>
              )}
              {labs.map((lab) => (
                <button
                  key={lab.id}
                  onClick={() => onSelectLab(lab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                    currentLab === lab.id
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                      : 'hover:bg-stone-50 text-stone-500 hover:text-stone-900'
                  }`}
                  title={!isExpanded ? lab.label : ''}
                >
                  <lab.icon size={20} className={currentLab === lab.id ? 'text-white' : 'text-stone-400 group-hover:text-stone-600'} />
                  {isExpanded && (
                    <span className="font-bold text-xs uppercase tracking-widest whitespace-nowrap">{lab.label}</span>
                  )}
                  {isExpanded && currentLab === lab.id && (
                    <div className="ml-auto">
                      <ChevronRight size={14} />
                    </div>
                  )}
                </button>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </nav>
      
      {/* Footer Status */}
      <div className="p-4 border-t border-stone-100">
        <div className={`p-4 rounded-2xl transition-all ${isExpanded ? 'bg-stone-50 border border-stone-100' : 'bg-transparent border-none p-0 flex justify-center'}`}>
          {isExpanded ? (
            <>
              <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1 font-bold">Systemstatus</p>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <p className="text-[11px] text-stone-600 font-medium">Ansluten till lab-server</p>
              </div>
            </>
          ) : (
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
