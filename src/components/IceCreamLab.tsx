import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  IceCream, 
  ChevronRight, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Check, 
  Info,
  Settings2,
  List,
  Lightbulb
} from 'lucide-react';

interface Flavor {
  id: string;
  name: string;
  color: string;
  letter: string;
}

const FLAVORS: Flavor[] = [
  { id: 'strawberry', name: 'Jordgubb', color: 'bg-pink-400', letter: 'J' },
  { id: 'chocolate', name: 'Choklad', color: 'bg-amber-900', letter: 'C' },
  { id: 'vanilla', name: 'Vanilj', color: 'bg-yellow-50', letter: 'V' },
  { id: 'blueberry', name: 'Blåbär', color: 'bg-indigo-600', letter: 'B' },
];

interface Combination {
  id: string;
  flavors: Flavor[];
}

const IceCreamLab: React.FC = () => {
  const [currentCone, setCurrentCone] = useState<Flavor[]>([]);
  const [savedCombinations, setSavedCombinations] = useState<Combination[]>([]);
  const [allowSameFlavor, setAllowSameFlavor] = useState(false);
  const [orderMatters, setOrderMatters] = useState(false);
  const [showKLAG, setShowKLAG] = useState(false);

  const addFlavor = (flavor: Flavor) => {
    if (currentCone.length >= 2) return;
    
    if (!allowSameFlavor && currentCone.some(f => f.id === flavor.id)) {
      return;
    }

    setCurrentCone([...currentCone, flavor]);
  };

  const removeLastFlavor = () => {
    setCurrentCone(currentCone.slice(0, -1));
  };

  const saveCombination = () => {
    if (currentCone.length < 2) return;

    // Check if already exists based on rules
    const exists = savedCombinations.some(combo => {
      if (orderMatters) {
        return combo.flavors[0].id === currentCone[0].id && combo.flavors[1].id === currentCone[1].id;
      } else {
        const ids1 = combo.flavors.map(f => f.id).sort();
        const ids2 = currentCone.map(f => f.id).sort();
        return ids1[0] === ids2[0] && ids1[1] === ids2[1];
      }
    });

    if (!exists) {
      setSavedCombinations([
        { id: Math.random().toString(36).substr(2, 9), flavors: [...currentCone] },
        ...savedCombinations
      ]);
    }
    setCurrentCone([]);
  };

  const clearAll = () => {
    setSavedCombinations([]);
    setCurrentCone([]);
  };

  const removeCombination = (id: string) => {
    setSavedCombinations(savedCombinations.filter(c => c.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-pink-500/20">
            <IceCream size={20} />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-stone-900 italic">Glass-labbet</h1>
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-stone-400">
              <span>Problemlösning</span>
              <ChevronRight size={10} />
              <span className="text-pink-500">Kombinatorik</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4 bg-stone-100 p-1 rounded-xl">
            <button 
              onClick={() => setAllowSameFlavor(!allowSameFlavor)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center space-x-2 ${allowSameFlavor ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <Settings2 size={14} />
              <span>Samma smak</span>
            </button>
            <button 
              onClick={() => setOrderMatters(!orderMatters)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all flex items-center space-x-2 ${orderMatters ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <Settings2 size={14} />
              <span>Ordning spelar roll</span>
            </button>
          </div>
          
          <button 
            onClick={clearAll}
            className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 transition-colors"
            title="Nollställ allt"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-8 flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
          
          {/* Left Side: Glassbar & Construction */}
          <div className="lg:col-span-8 flex flex-col space-y-8 overflow-hidden">
            
            {/* Glassbar */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-stone-200">
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-6">Välj smaker</h3>
              <div className="grid grid-cols-4 gap-6">
                {FLAVORS.map(flavor => (
                  <button
                    key={flavor.id}
                    onClick={() => addFlavor(flavor)}
                    disabled={currentCone.length >= 2 || (!allowSameFlavor && currentCone.some(f => f.id === flavor.id))}
                    className={`group relative flex flex-col items-center p-4 rounded-2xl transition-all ${
                      currentCone.length >= 2 || (!allowSameFlavor && currentCone.some(f => f.id === flavor.id))
                        ? 'opacity-40 grayscale cursor-not-allowed'
                        : 'hover:bg-stone-50 hover:shadow-md'
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full shadow-inner mb-3 transition-transform group-hover:scale-110 ${flavor.color}`} />
                    <span className="text-xs font-bold text-stone-700 uppercase tracking-wider">{flavor.name}</span>
                    <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center text-[10px] font-bold text-stone-400 border border-stone-100">
                      {flavor.letter}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Construction Area */}
            <div className="flex-1 bg-white p-8 rounded-[32px] shadow-sm border border-stone-200 flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-8 left-8 flex items-center space-x-2 text-stone-400">
                <Info size={16} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Bygg din glass</span>
              </div>

              <div className="relative w-48 h-80 flex flex-col items-center justify-end pb-12">
                {/* Cone */}
                <div className="w-32 h-40 bg-orange-200 rounded-b-full relative overflow-hidden border-x-4 border-b-4 border-orange-300 shadow-inner">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 11px), repeating-linear-gradient(-45deg, transparent, transparent 10px, #000 10px, #000 11px)' }} />
                </div>

                {/* Scoops */}
                <div className="absolute bottom-40 w-full flex flex-col-reverse items-center">
                  <AnimatePresence>
                    {currentCone.map((flavor, index) => (
                      <motion.div
                        key={index}
                        initial={{ y: -100, opacity: 0, scale: 0.5 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 50, opacity: 0, scale: 0.5 }}
                        className={`w-36 h-36 rounded-full shadow-lg -mb-12 relative z-10 ${flavor.color}`}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="flex items-center space-x-4 mt-8">
                <button
                  onClick={removeLastFlavor}
                  disabled={currentCone.length === 0}
                  className="p-4 bg-stone-100 text-stone-400 rounded-2xl hover:bg-stone-200 disabled:opacity-30 transition-all"
                >
                  <Trash2 size={20} />
                </button>
                <button
                  onClick={saveCombination}
                  disabled={currentCone.length < 2}
                  className="px-8 py-4 bg-pink-500 text-white rounded-2xl font-bold uppercase tracking-widest flex items-center space-x-3 shadow-lg shadow-pink-500/20 hover:bg-pink-600 disabled:opacity-30 transition-all"
                >
                  <Check size={20} />
                  <span>Spara kombination</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side: Saved Combinations */}
          <div className="lg:col-span-4 flex flex-col space-y-6 overflow-hidden">
            <div className="bg-stone-900 p-8 rounded-[32px] shadow-xl flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <List size={18} className="text-pink-400" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Hittade ({savedCombinations.length})</h3>
                </div>
                <button 
                  onClick={() => setShowKLAG(!showKLAG)}
                  className="text-[10px] font-bold uppercase tracking-widest text-stone-500 hover:text-white transition-colors"
                >
                  {showKLAG ? 'Visa lista' : 'Visa KLAG'}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                  {showKLAG ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      <div className="p-4 bg-stone-800 rounded-2xl border border-stone-700">
                        <h4 className="text-[10px] font-bold text-pink-400 uppercase mb-2">Algebraiskt</h4>
                        <div className="flex flex-wrap gap-2">
                          {savedCombinations.map(c => (
                            <span key={c.id} className="font-mono text-white text-sm bg-stone-700 px-2 py-1 rounded">
                              {c.flavors[0].letter}{c.flavors[1].letter}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-stone-800 rounded-2xl border border-stone-700">
                        <h4 className="text-[10px] font-bold text-emerald-400 uppercase mb-2">Logiskt</h4>
                        <p className="text-[11px] text-stone-400 leading-relaxed italic">
                          "Om vi har 4 smaker och väljer 2 olika utan ordning, får vi 3 + 2 + 1 = 6 sätt."
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    savedCombinations.map((combo) => (
                      <motion.div
                        key={combo.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-stone-800 p-4 rounded-2xl flex items-center justify-between group border border-stone-700/50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex -space-x-2">
                            {combo.flavors.map((f, i) => (
                              <div key={i} className={`w-8 h-8 rounded-full border-2 border-stone-800 shadow-sm ${f.color}`} />
                            ))}
                          </div>
                          <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
                            {combo.flavors[0].name} + {combo.flavors[1].name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeCombination(combo.id)}
                          className="p-2 text-stone-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
                
                {savedCombinations.length === 0 && !showKLAG && (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-20">
                    <IceCream size={48} className="text-stone-400" />
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Inga sparade ännu</p>
                  </div>
                )}
              </div>
            </div>

            {/* Hint Box */}
            <div className="bg-white p-6 rounded-[32px] border border-stone-200 shadow-sm">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-500">
                  <Lightbulb size={20} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest">Matematisk utmaning</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed">
                    Kim ska köpa lösglass. Det finns fyra smaker. Kim vill ha två kulor. På hur många sätt kan Kim välja?
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IceCreamLab;
