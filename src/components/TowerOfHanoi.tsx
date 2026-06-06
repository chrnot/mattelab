import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  RotateCcw, 
  Trophy, 
  ChevronRight, 
  Hash, 
  Target, 
  Lightbulb, 
  Info,
  Layers,
  BookOpen
} from 'lucide-react';

interface Disk {
  size: number;
  color: string;
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
  const [showFormula, setShowFormula] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [results, setResults] = useState<{ diskCount: number; minMoves: number }[]>([]);

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

  useEffect(() => {
    if (isSolved && moves === minPossibleMoves) {
      if (!results.find(r => r.diskCount === diskCount)) {
        setResults(prev => [...prev, { diskCount, minMoves: minPossibleMoves }]);
      }
    }
  }, [isSolved, moves, diskCount, minPossibleMoves, results]);

  const executeMove = (sourceIdx: number, targetIdx: number): boolean => {
    if (isSolved) return false;
    if (sourceIdx === targetIdx) return false;
    if (rods[sourceIdx].length === 0) return false;

    const sourceDisk = rods[sourceIdx][rods[sourceIdx].length - 1];
    const targetRod = rods[targetIdx];
    const targetDisk = targetRod.length > 0 ? targetRod[targetRod.length - 1] : null;

    // Rule check: Cannot place larger disk on smaller disk
    if (!targetDisk || sourceDisk.size < targetDisk.size) {
      // Valid move
      const newRods = [...rods.map(r => [...r])];
      const disk = newRods[sourceIdx].pop()!;
      newRods[targetIdx].push(disk);
      setRods(newRods);
      setMoves(m => m + 1);
      setSelectedRod(null);

      // Check solve state (all disks on last rod)
      if (targetIdx === 2 && newRods[2].length === diskCount) {
        setIsSolved(true);
      }
      return true;
    }
    return false;
  };

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

      const success = executeMove(selectedRod, index);
      if (!success) {
        // Deselect if action was invalid
        setSelectedRod(null);
      }
    }
  };

  const handleDragEnd = (event: any, info: any, sourceRodIdx: number) => {
    setSelectedRod(null);
    
    const x = info.point.x;
    const y = info.point.y;
    
    // Find matching rod by bounding boxes
    const rodElements = document.querySelectorAll('[data-rod-index]');
    let targetRodIdx: number | null = null;
    
    for (let i = 0; i < rodElements.length; i++) {
      const el = rodElements[i];
      const rect = el.getBoundingClientRect();
      // Check if dropped within horizontal bounds of the rod container (+/- 28px margins for better target tracking)
      if (x >= rect.left - 28 && x <= rect.right + 28) {
        targetRodIdx = parseInt(el.getAttribute('data-rod-index') || '', 10);
        break;
      }
    }
    
    // Fallback using elementFromPoint
    if (targetRodIdx === null) {
      const element = document.elementFromPoint(x, y);
      const rodElement = element?.closest('[data-rod-index]');
      if (rodElement) {
        targetRodIdx = parseInt(rodElement.getAttribute('data-rod-index') || '', 10);
      }
    }
    
    if (targetRodIdx !== null && targetRodIdx !== sourceRodIdx) {
      executeMove(sourceRodIdx, targetRodIdx);
    }
  };

  return (
    <div className="hanoi-container min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center gap-8 font-sans select-none overflow-x-hidden">
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Tornet i Hanoi</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Algebra och Mönster</p>
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

      {/* Middle Section: Didaktiskt tips & Matematisk regel */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Didaktiskt tips & utmaning (Collapsible) */}
        <div className="bg-amber-50/60 border border-amber-200/80 rounded-[2rem] p-6 text-amber-900 flex flex-col shadow-sm hover:shadow transition-all">
          <button 
            onClick={() => setShowTips(!showTips)}
            className="flex items-center justify-between w-full text-left outline-none group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Lightbulb size={18} className="text-amber-600" />
              <h3 className="text-xs font-black text-amber-800 uppercase tracking-widest flex items-center gap-1.5">
                Didaktiskt tips & utmaning
              </h3>
            </div>
            <ChevronRight size={18} className={`text-amber-500 group-hover:text-amber-700 transition-transform ${showTips ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence initial={false}>
            {showTips && (
              <motion.div 
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-4 items-start pt-2 border-t border-amber-200/40">
                  <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold leading-relaxed mb-1">
                      Försök att klara spelet med 3, 4 och 5 skivor på rad. Skriv ner det minsta antalet drag du behöver för varje steg. 
                    </p>
                    <p className="text-[11px] text-amber-800 leading-relaxed italic">
                      Ser du mönstret i siffrorna som växer fram? Hur hänger ökningen ihop med skivornas antal?
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Matematisk regel (Collapsible) */}
        <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col transition-all">
          <button 
            onClick={() => setShowFormula(!showFormula)}
            className="flex items-center justify-between w-full text-left outline-none group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Info size={18} className="text-indigo-600" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Matematisk regel</h3>
            </div>
            <ChevronRight size={18} className={`text-slate-400 group-hover:text-slate-600 transition-transform ${showFormula ? 'rotate-90' : ''}`} />
          </button>

          <AnimatePresence initial={false}>
            {showFormula && (
              <motion.div 
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: 'auto', opacity: 1, marginTop: 16 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl mb-4 text-center">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Minimala drag f(n)</span>
                  <div className="text-2xl font-black text-indigo-600 font-mono mt-1">f(n) = 2ⁿ - 1</div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Där <strong className="font-bold text-slate-705">n</strong> motsvarar antalet skivor.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-slate-600 leading-relaxed font-serif">
                  <p>
                    Problemet belyser <strong className="font-black text-slate-800">exponentiell mönster-tillväxt</strong>. Varje ny skiva dubblerar (plus 1) antalet nödvändiga flyttar:
                  </p>
                  
                  <div className="bg-slate-50/55 border border-slate-100/60 p-3 rounded-xl font-mono text-[10px] text-slate-600 grid grid-cols-2 gap-x-4 gap-y-1.5 shadow-inner">
                    <div className="flex justify-between border-r border-slate-100 pr-3">
                      <span>3 skivor:</span>
                      <span>2³-1 = <strong className="text-slate-800 font-extrabold">7</strong></span>
                    </div>
                    <div className="flex justify-between pl-1">
                      <span>4 skivor:</span>
                      <span>2⁴-1 = <strong className="text-slate-800 font-extrabold">15</strong></span>
                    </div>
                    <div className="flex justify-between border-r border-slate-100 pr-3 pt-1 border-t border-slate-100/50">
                      <span>5 skivor:</span>
                      <span>2⁵-1 = <strong className="text-slate-800 font-extrabold">31</strong></span>
                    </div>
                    <div className="flex justify-between pl-1 pt-1 border-t border-slate-100/50">
                      <span>6 skivor:</span>
                      <span>2⁶-1 = <strong className="text-slate-800 font-extrabold">63</strong></span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Main Container: Game board on the left (or top), results on the right (or bottom) */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Main Game Stage */}
        <div className="lg:col-span-8 flex flex-col space-y-6 w-full">
          <div className="w-full bg-white rounded-[3rem] p-6 sm:p-10 border border-slate-200 shadow-2xl flex flex-col relative overflow-hidden min-h-[380px] sm:min-h-[500px]">
            <div className="flex justify-between items-start mb-8">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Hash size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gjorda Drag</span>
                </div>
                <span className="text-4xl font-black text-indigo-600 font-mono leading-none">{moves}</span>
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Optimala Drag</span>
                </div>
                <span className="text-4xl font-black text-slate-900 font-mono leading-none">{minPossibleMoves}</span>
              </div>
            </div>

            {/* Rods and Disks Container */}
            <div className="flex-1 flex justify-around items-end pb-8 sm:pb-12 relative min-h-[250px] sm:min-h-[360px] overflow-x-auto custom-scrollbar">
              {rods.map((rod, rodIdx) => (
                <div 
                  key={rodIdx} 
                  data-rod-index={rodIdx}
                  className="relative group cursor-pointer flex flex-col items-center px-1 sm:px-4 shrink-0"
                  onClick={() => handleRodClick(rodIdx)}
                >
                  {/* Inner Peg Assembly Wrapper */}
                  <div className="relative flex flex-col items-center pb-3 sm:pb-4">
                    {/* Rod Visual - Deep warm wood look with organic shadows */}
                    <div 
                      className={`bg-amber-800/85 rounded-t-full transition-all duration-300 shadow-inner z-0 ${
                        selectedRod === rodIdx 
                          ? 'bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]' 
                          : 'group-hover:bg-amber-700'
                      }`} 
                      style={{
                        width: 'var(--peg-width)',
                        height: 'var(--peg-height)',
                        boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.3), inset 2px 0 2px rgba(255,255,255,0.15)'
                      }}
                    />
                    
                    {/* 3D-Embossed Solid Base */}
                    <div 
                      className={`bg-amber-950 rounded-full mt-[-6px] transition-all duration-300 shadow-md z-10 ${
                        selectedRod === rodIdx 
                          ? 'bg-indigo-600 shadow-[0_4px_12px_rgba(99,102,241,0.45)]' 
                          : 'group-hover:bg-amber-900'
                      }`} 
                      style={{
                        width: 'var(--base-width)',
                        height: 'var(--base-height)',
                        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 3px 6px rgba(0,0,0,0.3)'
                      }}
                    />
                    
                    {/* Disks stack container - sits flush right on top of the base! */}
                    <div 
                      className="absolute flex flex-col-reverse items-center gap-1 z-20"
                      style={{
                        bottom: 'calc(var(--base-height) + 12px)'
                      }}
                    >
                      <AnimatePresence>
                        {rod.map((disk, diskIdx) => {
                          const isTopDisk = diskIdx === rod.length - 1;
                          return (
                            <motion.div
                              key={`${disk.size}-${diskIdx}`}
                              layoutId={`disk-${disk.size}`}
                              initial={{ scale: 0.8, opacity: 0, y: -20 }}
                              animate={{ 
                                scale: 1, 
                                opacity: 1, 
                                y: 0,
                                x: 0,
                                filter: (selectedRod === rodIdx && isTopDisk) ? 'brightness(1.1) drop-shadow(0 0 8px rgba(79, 70, 229, 0.4))' : 'none'
                              }}
                              exit={{ scale: 0.8, opacity: 0 }}
                              drag={isTopDisk && !isSolved}
                              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                              dragElastic={1.1}
                              dragSnapToOrigin={true}
                              onDragStart={() => setSelectedRod(rodIdx)}
                              onDragEnd={(e, info) => handleDragEnd(e, info, rodIdx)}
                              className={`${disk.color} rounded-full flex items-center justify-center text-white font-black text-[9px] sm:text-[10px] shadow-md relative transition-shadow duration-200 ${isTopDisk && !isSolved ? 'cursor-grab active:cursor-grabbing hover:brightness-105 active:brightness-110 shadow-md hover:shadow-lg' : 'cursor-default'}`}
                              style={{ 
                                width: `calc(var(--disk-base-size) + var(--disk-scale-step) * ${disk.size})`, 
                                height: 'var(--disk-height)',
                                touchAction: 'none' 
                              }}
                            >
                              {/* Realistiskt centrumhål för peggen */}
                              <div 
                                className="rounded-full bg-amber-900/40 shadow-inner flex items-center justify-center border border-black/15"
                                style={{
                                  width: 'calc(var(--peg-width) + 8px)',
                                  height: 'calc(var(--peg-width) + 8px)'
                                }}
                              >
                                <span className="text-[10px] font-black text-white/95 leading-none">{disk.size}</span>
                              </div>

                              {selectedRod === rodIdx && isTopDisk && (
                                <motion.div 
                                  layoutId="selection-halo"
                                  className="absolute -inset-1 border-2 border-indigo-400 rounded-full animate-pulse pointer-events-none" 
                                />
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Rod label shown outside the interaction zone */}
                  <span className="mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors group-hover:text-slate-600">Pinne {['A', 'B', 'C'][rodIdx]}</span>
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
        </div>

        {/* Right Side: Clean Result Table Card */}
        <div className="lg:col-span-4 w-full">
          <div className="bg-white border border-slate-200/90 rounded-[3rem] p-6 sm:p-8 shadow-xl flex flex-col space-y-5">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Resultattabell</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Spara dina framsteg på olika nivåer.</p>
            </div>
            
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Skivor (n)</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider">Minsta drag</th>
                    <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Ökning</th>
                  </tr>
                </thead>
                <tbody>
                  {[3, 4, 5, 6].map((n) => {
                    const result = results.find(r => r.diskCount === n);
                    const prevMinMoves = Math.pow(2, n - 1) - 1;
                    const currentMinMoves = Math.pow(2, n) - 1;
                    const diff = currentMinMoves - prevMinMoves;
                    const isCurrent = diskCount === n;

                    return (
                      <tr 
                        key={n} 
                        className={`border-b border-slate-50 transition-all last:border-b-0 ${
                          isCurrent ? 'bg-indigo-50/70 font-semibold text-indigo-900' : 'hover:bg-slate-50/30'
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-black text-slate-700">{n}</td>
                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">
                          {result ? result.minMoves : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-400 text-[11px] italic text-right">
                          {result ? `+${diff}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <p className="text-[10px] text-slate-400 italic leading-snug">
              * Tabellen fylls i automatiskt när du löser en nivå med minsta möjliga antal drag. Om du klarar spelet optimalt sparas ditt rekord här för att studera mönstret.
            </p>
          </div>
        </div>

      </div>

      <style>{`
        .hanoi-container {
          --peg-height: 140px;
          --peg-width: 8px;
          --base-width: 80px;
          --base-height: 12px;
          --disk-base-size: 26px;
          --disk-scale-step: 8px;
          --disk-height: 18px;
        }

        @media (min-width: 360px) {
          .hanoi-container {
            --peg-height: 160px;
            --peg-width: 10px;
            --base-width: 96px;
            --base-height: 14px;
            --disk-base-size: 32px;
            --disk-scale-step: 10px;
            --disk-height: 20px;
          }
        }

        @media (min-width: 480px) {
          .hanoi-container {
            --peg-height: 195px;
            --peg-width: 12px;
            --base-width: 120px;
            --base-height: 16px;
            --disk-base-size: 38px;
            --disk-scale-step: 14px;
            --disk-height: 24px;
          }
        }

        @media (min-width: 640px) {
          .hanoi-container {
            --peg-height: 220px;
            --peg-width: 13px;
            --base-width: 154px;
            --base-height: 18px;
            --disk-base-size: 46px;
            --disk-scale-step: 18px;
            --disk-height: 28px;
          }
        }

        @media (min-width: 768px) {
          .hanoi-container {
            --peg-height: 256px;
            --peg-width: 14px;
            --base-width: 192px;
            --base-height: 20px;
            --disk-base-size: 60px;
            --disk-scale-step: 24px;
            --disk-height: 32px;
          }
        }

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
