import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  RotateCcw, 
  Trophy, 
  ChevronRight, 
  Hash, 
  Target, 
  BarChart, 
  Lightbulb, 
  Info
} from 'lucide-react';

interface Disk {
  size: number;
  color: string;
}

interface ResultRecord {
  disks: number;
  minMoves: number;
  actualMoves: number;
}

const TOWER_COLORS = [
  'bg-indigo-500', 
  'bg-amber-500', 
  'bg-emerald-500', 
  'bg-rose-500', 
  'bg-cyan-500', 
  'bg-violet-500'
];

const TowerOfHanoi: React.FC = () => {
  const [diskCount, setDiskCount] = useState(3);
  const [rods, setRods] = useState<Disk[][]>([[], [], []]);
  const [selectedRod, setSelectedRod] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [isSolved, setIsSolved] = useState(false);
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);

  // Initialize game
  const initGame = (count: number) => {
    const initialDisks: Disk[] = [];
    for (let i = count; i >= 1; i--) {
      initialDisks.push({
        size: i,
        color: TOWER_COLORS[i - 1] || 'bg-slate-500'
      });
    }
    setRods([initialDisks, [], []]);
    setMoves(0);
    setIsSolved(false);
    setSelectedRod(null);
  };

  useEffect(() => {
    initGame(diskCount);
  }, [diskCount]);

  const minPossibleMoves = useMemo(() => Math.pow(2, diskCount) - 1, [diskCount]);

  const handleRodClick = (index: number) => {
    if (isSolved) return;

    if (selectedRod === null) {
      // Pick up disk if rod has disks
      if (rods[index].length > 0) {
        setSelectedRod(index);
      }
    } else {
      // Trying to place disk
      if (selectedRod === index) {
        // Deselect if same rod
        setSelectedRod(null);
        return;
      }

      const sourceDisk = rods[selectedRod][rods[selectedRod].length - 1];
      const targetRod = rods[index];
      const targetDisk = targetRod.length > 0 ? targetRod[targetRod.length - 1] : null;

      // Rule check: Cannot place larger disk on smaller disk
      if (!targetDisk || sourceDisk.size < targetDisk.size) {
        // Valid move
        const newRods = [...rods.map(r => [...r])];
        const disk = newRods[selectedRod].pop()!;
        newRods[index].push(disk);
        setRods(newRods);
        setMoves(m => m + 1);
        setSelectedRod(null);

        // Check solve state (all disks on last rod)
        if (index === 2 && newRods[2].length === diskCount) {
          setIsSolved(true);
          // Add to results
          setResults(prev => {
            const existing = prev.find(r => r.disks === diskCount);
            if (existing) {
              // Update if better score or just keep history? Let's add new records
              return [...prev, { disks: diskCount, minMoves: minPossibleMoves, actualMoves: moves + 1 }];
            }
            return [...prev, { disks: diskCount, minMoves: minPossibleMoves, actualMoves: moves + 1 }];
          });
        }
      } else {
        // Invalid move - shake rod or something?
        setSelectedRod(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center gap-8 font-sans select-none overflow-x-hidden">
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <History size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Tornet i Hanoi</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Algebra och Mönster: Åk 8–9</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <span className="text-[10px] font-black text-slate-400 uppercase px-3">Skivor:</span>
          {[3, 4, 5, 6].map(n => (
            <button
              key={n}
              onClick={() => {
                setDiskCount(n);
                initGame(n);
              }}
              className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${diskCount === n ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {n}
            </button>
          ))}
        </div>

        <button 
          onClick={() => initGame(diskCount)}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
        >
          <RotateCcw size={16} /> Återställ
        </button>
      </header>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Game Stage */}
        <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 border border-slate-200 shadow-2xl flex flex-col relative overflow-hidden min-h-[500px]">
          <div className="flex justify-between items-start mb-12">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Hash size={14} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gjorda Drag</span>
              </div>
              <span className="text-4xl font-black text-indigo-600">{moves}</span>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-slate-400" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimala Drag</span>
              </div>
              <span className="text-4xl font-black text-slate-900">{minPossibleMoves}</span>
            </div>
          </div>

          {/* Rods and Disks container */}
          <div className="flex-1 flex justify-around items-end pb-12 relative">
            {rods.map((rod, rodIdx) => (
              <div 
                key={rodIdx} 
                className="relative group cursor-pointer flex flex-col items-center"
                onClick={() => handleRodClick(rodIdx)}
              >
                {/* Rod Visual */}
                <div className={`w-3 h-64 bg-slate-200 rounded-t-full transition-colors ${selectedRod === rodIdx ? 'bg-indigo-200' : 'group-hover:bg-slate-300'}`} />
                <div className={`w-32 h-2 bg-slate-300 rounded-full mt-[-2px] transition-colors ${selectedRod === rodIdx ? 'bg-indigo-300' : 'group-hover:bg-slate-400'}`} />
                
                {/* Disks */}
                <div className="absolute bottom-2 flex flex-col-reverse items-center gap-1">
                  <AnimatePresence>
                    {rod.map((disk, diskIdx) => (
                      <motion.div
                        key={`${disk.size}-${diskIdx}`}
                        layoutId={`disk-${disk.size}`}
                        initial={{ scale: 0.8, opacity: 0, y: -20 }}
                        animate={{ 
                          scale: 1, 
                          opacity: 1, 
                          y: 0,
                          x: 0,
                          filter: (selectedRod === rodIdx && diskIdx === rod.length - 1) ? 'brightness(1.1) drop-shadow(0 0 8px rgba(79, 70, 229, 0.4))' : 'none'
                        }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className={`${disk.color} rounded-full h-8 flex items-center justify-center text-white font-black text-[10px] shadow-sm relative`}
                        style={{ width: `${60 + disk.size * 25}px` }}
                      >
                        {disk.size}
                        {selectedRod === rodIdx && diskIdx === rod.length - 1 && (
                          <motion.div 
                            layoutId="selection-halo"
                            className="absolute -inset-1 border-2 border-indigo-400 rounded-full animate-pulse" 
                          />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Rod label */}
                <span className="mt-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Pinne {['A', 'B', 'C'][rodIdx]}</span>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {isSolved && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mb-6 border-4 border-emerald-50 shadow-xl">
                  <Trophy size={40} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Snyggt! Du klarade det!</h2>
                <p className="text-slate-500 font-medium max-w-sm mb-8">
                  {moves === minPossibleMoves 
                    ? "Perfekt! Du hittade den matematiska genvägen och använde det minsta antalet drag!"
                    : `Du klarade det på ${moves} drag. Kan du hitta ett sätt att pressa ner det till ${minPossibleMoves}?`}
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => initGame(diskCount)}
                    className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all hover:-translate-y-1"
                  >
                    Spela Igen
                  </button>
                  <button 
                    onClick={() => {
                        const next = Math.min(6, diskCount + 1);
                        setDiskCount(next);
                        initGame(next);
                    }}
                    disabled={diskCount === 6}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:translate-y-0"
                  >
                    Nästa Nivå <ChevronRight size={16} className="inline ml-1" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar: Data & Analysis */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <BarChart size={20} className="text-indigo-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Statistik-logg</h3>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-[200px]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-tighter border-b border-slate-100 pb-2">
                    <th className="text-left py-2 font-black">Skivor ($n$)</th>
                    <th className="text-center py-2 font-black">Optimalt ($2^n-1$)</th>
                    <th className="text-right py-2 font-black">Dina Drag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">Inga sparade försök</td>
                    </tr>
                  ) : (
                    results.map((res, i) => (
                      <motion.tr 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={i} 
                        className="text-xs group"
                      >
                        <td className="py-3 font-black text-slate-900">{res.disks}</td>
                        <td className="py-3 text-center font-bold text-indigo-600 bg-indigo-50/50 rounded-lg">{res.minMoves}</td>
                        <td className={`py-3 text-right font-black ${res.actualMoves === res.minMoves ? 'text-emerald-500' : 'text-slate-500'}`}>
                          {res.actualMoves}
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <button 
              onClick={() => setShowFormulaInfo(!showFormulaInfo)}
              className="mt-6 p-4 bg-indigo-50 rounded-2xl flex items-center justify-between group hover:bg-indigo-100 transition-all border border-indigo-100"
            >
              <div className="flex items-center gap-3">
                <Lightbulb size={16} className="text-indigo-600" />
                <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Visa Matematisk Regel</span>
              </div>
              <ChevronRight size={16} className={`text-indigo-600 transition-transform ${showFormulaInfo ? 'rotate-90' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showFormulaInfo && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 p-4 bg-slate-900 rounded-2xl text-white font-mono text-[10px] leading-relaxed">
                    <p className="text-indigo-400 mb-2">// Den rekursiva formeln</p>
                    <p>f(n) = 2^n - 1</p>
                    <p className="text-slate-500 mt-2">Där n är antal skivor.</p>
                    <div className="mt-4 pt-4 border-t border-white/10 opacity-70">
                      För varje ny skiva som läggs till så dubbleras (plus ett) antalet drag. Detta kallas för exponentiell ökning.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <div className="bg-amber-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><Info size={80} /></div>
            <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-70">Didaktiskt tips</h4>
            <p className="text-sm font-bold leading-relaxed">
              Försök att klara 3, 4 och 5 skivor. Skriv ner det minsta antalet drag du behöver. Ser du mönstret i siffrorna?
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default TowerOfHanoi;
