import React, { useState, useEffect } from 'react';
import { Lab } from '../types';
import { 
  DraftingCompass, 
  CircleDot, 
  Square, 
  ChevronDown, 
  ChevronRight, 
  Menu, 
  Shapes, 
  Home,
  Hash,
  Calculator,
  BarChart,
  TrendingUp,
  Lightbulb,
  IceCream,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  currentLab: Lab;
  onSelectLab: (lab: Lab) => void;
  isTeacherViewOpen: boolean;
  onToggleTeacherView: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  currentLab, 
  onSelectLab, 
  isTeacherViewOpen, 
  onToggleTeacherView 
}) => {
  const [isExpanded, setIsExpanded] = useState(currentLab !== Lab.HOME);
  const [openCategories, setOpenCategories] = useState<string[]>([]);

  useEffect(() => {
    if (currentLab === Lab.HOME) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
      // Automatically open the category containing the current lab
      const category = categories.find(cat => cat.labs.some(lab => lab.id === currentLab));
      if (category && !openCategories.includes(category.id)) {
        setOpenCategories(prev => [...prev, category.id]);
      }
    }
  }, [currentLab]);

  const toggleCategory = (categoryId: string) => {
    if (!isExpanded) {
      setIsExpanded(true);
      setOpenCategories([categoryId]);
      return;
    }
    setOpenCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const categories = [
    {
      id: 'tal',
      label: 'Taluppfattning',
      icon: Hash,
      labs: [
        { id: Lab.DECIMAL_CALCULATOR, label: 'Decimaltal på räknaren', icon: Calculator },
        { id: Lab.SMART_CALCULATOR, label: 'Den Smarta Räknaren', icon: Lightbulb }
      ]
    },
    {
      id: 'alg',
      label: 'Algebra',
      icon: Calculator,
      labs: []
    },
    {
      id: 'geo',
      label: 'Geometri',
      icon: Shapes,
      labs: [
        { id: Lab.GEOBOARD, label: 'Geobräde', icon: Shapes }
      ]
    },
    {
      id: 'stat',
      label: 'Sannolikhet och statistik',
      icon: BarChart,
      labs: []
    },
    {
      id: 'samband',
      label: 'Samband och förändring',
      icon: TrendingUp,
      labs: [
        { id: Lab.FROG_JUMP, label: 'Grodhopp', icon: CircleDot }
      ]
    },
    {
      id: 'problem',
      label: 'Problemlösning',
      icon: Lightbulb,
      labs: [
        { id: Lab.MAGIC_SQUARE, label: 'Magiska Kvadrater', icon: Square },
        { id: Lab.ICE_CREAM, label: 'Glass-labbet', icon: IceCream },
        { id: Lab.RICH_PROBLEM_LAB, label: 'Det Rika Problemlabbet', icon: Lightbulb }
      ]
    }
  ];

  return (
    <motion.div 
      initial={false}
      animate={{ width: isExpanded ? 300 : 80 }}
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
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {/* Home Button */}
        <button
          onClick={() => onSelectLab(Lab.HOME)}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group mb-4 ${
            currentLab === Lab.HOME
              ? 'bg-stone-900 text-white shadow-md'
              : 'hover:bg-stone-50 text-stone-500 hover:text-stone-900'
          }`}
          title={!isExpanded ? 'Hem' : ''}
        >
          <Home size={20} className={currentLab === Lab.HOME ? 'text-white' : 'text-stone-400 group-hover:text-stone-600'} />
          {isExpanded && (
            <span className="font-bold text-xs uppercase tracking-widest whitespace-nowrap">Hem</span>
          )}
        </button>

        <div className="space-y-1">
          {isExpanded && (
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400 px-4 mb-4 mt-2">Kategorier</p>
          )}
          
          {categories.map((category) => {
            const isOpen = openCategories.includes(category.id);
            const hasActiveLab = category.labs.some(lab => lab.id === currentLab);

            return (
              <div key={category.id} className="space-y-1">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
                    isOpen && isExpanded ? 'bg-stone-50 text-stone-900' : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
                  } ${hasActiveLab && !isOpen ? 'border-l-4 border-amber-500 rounded-l-none' : ''}`}
                  title={!isExpanded ? category.label : ''}
                >
                  <category.icon size={20} className={isOpen || hasActiveLab ? 'text-amber-500' : 'text-stone-400 group-hover:text-stone-600'} />
                  {isExpanded && (
                    <span className="font-bold text-[11px] uppercase tracking-wider whitespace-nowrap flex-1 text-left">{category.label}</span>
                  )}
                  {isExpanded && (
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={14} className="text-stone-400" />
                    </motion.div>
                  )}
                </button>

                <AnimatePresence>
                  {isOpen && isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="pl-4 space-y-1 overflow-hidden"
                    >
                      {category.labs.length > 0 ? (
                        category.labs.map((lab) => (
                          <button
                            key={lab.id}
                            onClick={() => onSelectLab(lab.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all group ${
                              currentLab === lab.id
                                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                                : 'hover:bg-stone-50 text-stone-500 hover:text-stone-900'
                            }`}
                          >
                            <lab.icon size={16} className={currentLab === lab.id ? 'text-white' : 'text-stone-400 group-hover:text-stone-600'} />
                            <span className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">{lab.label}</span>
                          </button>
                        ))
                      ) : (
                        <p className="text-[9px] text-stone-400 italic px-4 py-2">Inga laborationer ännu</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </nav>
      
      {/* Footer Status & Teacher View */}
      <div className="p-4 border-t border-stone-100 space-y-2">
        {currentLab !== Lab.HOME && (
          <button
            onClick={onToggleTeacherView}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all group ${
              isTeacherViewOpen
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-stone-50 text-stone-500 hover:text-stone-900 border border-stone-100'
            }`}
            title={!isExpanded ? 'Lärarvy' : ''}
          >
            {isTeacherViewOpen ? <EyeOff size={20} /> : <Eye size={20} />}
            {isExpanded && (
              <span className="font-bold text-[10px] uppercase tracking-widest whitespace-nowrap">Lärarvy</span>
            )}
          </button>
        )}

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
