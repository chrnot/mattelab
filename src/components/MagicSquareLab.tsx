import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phase } from '../types';
import { Target, BrainCircuit, ChevronRight, GraduationCap, Info, HelpCircle } from 'lucide-react';

const MagicSquareLab: React.FC = () => {
  const [phase, setPhase] = useState<Phase>(Phase.EXPLORATION);
  const [grid, setGrid] = useState<(number | null)[]>(Array(9).fill(null));
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [showTarget, setShowTarget] = useState(true);
  const [targetSum, setTargetSum] = useState(15);
  const [prediction, setPrediction] = useState<string>('');
  const [isSolved, setIsSolved] = useState(false);
  const [customStart, setCustomStart] = useState<number>(10);
  const [gridSize, setGridSize] = useState<3 | 4>(3);

  // Calculate sums
  const getRowSum = (row: number) => {
    const start = row * gridSize;
    let sum = 0;
    for (let i = 0; i < gridSize; i++) sum += (grid[start + i] || 0);
    return sum;
  };

  const getColSum = (col: number) => {
    let sum = 0;
    for (let i = 0; i < gridSize; i++) sum += (grid[col + i * gridSize] || 0);
    return sum;
  };

  const getDiag1Sum = () => {
    let sum = 0;
    for (let i = 0; i < gridSize; i++) sum += (grid[i * (gridSize + 1)] || 0);
    return sum;
  };

  const getDiag2Sum = () => {
    let sum = 0;
    for (let i = 0; i < gridSize; i++) sum += (grid[(i + 1) * (gridSize - 1)] || 0);
    return sum;
  };

  const checkSolved = () => {
    const sums = [];
    for (let i = 0; i < gridSize; i++) {
      sums.push(getRowSum(i));
      sums.push(getColSum(i));
    }
    sums.push(getDiag1Sum());
    sums.push(getDiag2Sum());

    const allMatch = sums.every(s => s === targetSum) && grid.every(n => n !== null);
    if (allMatch && !isSolved) {
      setIsSolved(true);
    }
  };

  useEffect(() => {
    checkSolved();
  }, [grid, targetSum, gridSize]);

  const handleCellClick = (index: number) => {
    if (isSolved && phase === Phase.EXPLORATION) return;

    const newGrid = [...grid];
    const currentVal = newGrid[index];

    if (selectedNumber !== null) {
      if (currentVal !== null) {
        setAvailableNumbers(prev => [...prev, currentVal].sort((a, b) => a - b));
      }
      newGrid[index] = selectedNumber;
      setAvailableNumbers(prev => prev.filter(n => n !== selectedNumber));
      setSelectedNumber(null);
    } else if (currentVal !== null) {
      newGrid[index] = null;
      setAvailableNumbers(prev => [...prev, currentVal].sort((a, b) => a - b));
    }
    setGrid(newGrid);
  };

  const reset = () => {
    setGrid(Array(gridSize * gridSize).fill(null));
    const nums = phase === Phase.EXPLORATION ? [1,2,3,4,5,6,7,8,9] :
                 phase === Phase.PREDICTION ? [2,4,6,8,10,12,14,16,18] :
                 phase === Phase.GENERALIZATION ? Array.from({length: 9}, (_, i) => customStart + i) :
                 Array.from({length: 16}, (_, i) => i + 1);
    setAvailableNumbers(nums);
    setIsSolved(false);
  };

  const startNextPhase = () => {
    if (phase === Phase.EXPLORATION) {
      setPhase(Phase.PREDICTION);
      setAvailableNumbers([2, 4, 6, 8, 10, 12, 14, 16, 18]);
      setGrid(Array(9).fill(null));
      setIsSolved(false);
      setTargetSum(30);
    } else if (phase === Phase.PREDICTION) {
      setPhase(Phase.GENERALIZATION);
      const nums = Array.from({length: 9}, (_, i) => 10 + i);
      setAvailableNumbers(nums);
      setGrid(Array(9).fill(null));
      setIsSolved(false);
      setTargetSum(3 * (10 + 4)); // Middle number is 10+4=14
    } else if (phase === Phase.GENERALIZATION) {
      setPhase(Phase.CHALLENGE);
      setGridSize(4);
      setGrid(Array(16).fill(null));
      setAvailableNumbers(Array.from({length: 16}, (_, i) => i + 1));
      setTargetSum(34);
      setIsSolved(false);
    }
  };

  const handleCustomStartChange = (val: number) => {
    setCustomStart(val);
    const nums = Array.from({length: 9}, (_, i) => val + i);
    setAvailableNumbers(nums);
    setGrid(Array(9).fill(null));
    setIsSolved(false);
    setTargetSum(3 * (val + 4));
  };

  return (
    <div className="flex flex-col h-full">
      <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <nav className="flex items-center space-x-8">
          {[
            { id: Phase.EXPLORATION, icon: Target, label: 'Utforska' },
            { id: Phase.PREDICTION, icon: BrainCircuit, label: 'Förutsägelse' },
            { id: Phase.GENERALIZATION, icon: ChevronRight, label: 'Generalisering' },
            { id: Phase.CHALLENGE, icon: GraduationCap, label: 'Utmaning' },
          ].map((p) => (
            <div
              key={p.id}
              className={`flex items-center space-x-2 transition-colors relative py-2 ${
                phase === p.id ? 'text-stone-900' : 'text-stone-400'
              }`}
            >
              <p.icon size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">{p.label}</span>
              {phase === p.id && (
                <motion.div
                  layoutId="magic-nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-800"
                />
              )}
            </div>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowTarget(!showTarget)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border ${
              showTarget ? 'bg-stone-800 text-white border-stone-800' : 'bg-white text-stone-400 border-stone-200'
            }`}
          >
            {showTarget ? 'Dölj målsiffra' : 'Visa målsiffra'}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Grid Area */}
          <div className="lg:col-span-8 space-y-12 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {phase === Phase.PREDICTION ? (
                <motion.div
                  key="prediction"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8 w-full"
                >
                  <div className="p-8 bg-white rounded-3xl shadow-sm border border-stone-200 space-y-8">
                    <div className="flex flex-col space-y-2 text-center">
                      <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400">Fas 2: Förutsägelsen</h3>
                      <h2 className="text-3xl font-serif italic text-stone-800">Ny talföljd: 2, 4, 6, 8, 10, 12, 14, 16, 18</h2>
                    </div>
                    
                    <div className="p-8 bg-amber-50 rounded-2xl border border-amber-100 space-y-8">
                      <p className="text-amber-900 font-medium text-center text-lg">Vad tror du den magiska summan blir den här gången?</p>
                      
                      {/* Strategy Visualization */}
                      <div className="flex flex-col space-y-8 py-4">
                        <div className="flex justify-between items-center px-4 relative h-16">
                          {[2, 4, 6, 8, 10, 12, 14, 16, 18].map((n, i) => (
                            <div key={i} className="relative z-10">
                              <div className="w-10 h-10 rounded-full bg-white border-2 border-amber-200 flex items-center justify-center font-mono font-bold text-amber-800 shadow-sm">
                                {n}
                              </div>
                              {/* Arcs for strategy - pairing 1st with 9th, 2nd with 8th, etc. */}
                              {i < 4 && (
                                <div 
                                  className="absolute top-0 left-1/2 border-t-2 border-amber-300 rounded-t-full pointer-events-none" 
                                  style={{ 
                                    width: `${(8 - i * 2) * (100 / 9) * 0.8}vw`, 
                                    height: `${(4 - i) * 12}px`,
                                    left: '50%',
                                    transform: 'translateY(-100%)',
                                    maxWidth: '300px'
                                  }} 
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-amber-600 italic text-center">
                          Strategi: Para ihop talen från ytterkanterna inåt. Varje par blir 20. <br/>
                          (2+18) + (4+16) + (6+14) + (8+12) + 10 = 90. <br/>
                          Dela totalen med 3 för att få den magiska summan: 90 / 3 = 30.
                        </p>
                      </div>

                      <div className="flex space-x-4 max-w-md mx-auto">
                        <input 
                          type="number"
                          value={prediction}
                          onChange={(e) => setPrediction(e.target.value)}
                          className="flex-1 px-6 py-4 rounded-xl border-2 border-amber-200 bg-white font-mono text-xl outline-none focus:border-amber-400"
                          placeholder="Din gissning..."
                        />
                        <button 
                          onClick={() => {
                            if (prediction === '30') {
                              setPhase(Phase.EXPLORATION); 
                              setPrediction('');
                            } else {
                              alert("Inte riktigt! Prova att addera alla tal och dela med 3.");
                            }
                          }}
                          className="px-8 py-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                        >
                          Verifiera
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : phase === Phase.GENERALIZATION && grid.every(n => n === null) ? (
                <motion.div
                  key="generalization"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8 w-full"
                >
                  <div className="p-8 bg-white rounded-3xl shadow-sm border border-stone-200 space-y-8">
                    <div className="flex flex-col space-y-2 text-center">
                      <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400">Fas 3: Generalisering</h3>
                      <h2 className="text-3xl font-serif italic text-stone-800">Välj din egen start-siffra</h2>
                    </div>
                    
                    <div className="p-8 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-8 max-w-2xl mx-auto w-full">
                      <p className="text-indigo-900 font-medium text-center">Välj ett tal att börja din talföljd med:</p>
                      
                      <div className="flex space-x-4 max-w-xs mx-auto">
                        <input 
                          type="number"
                          value={customStart}
                          onChange={(e) => handleCustomStartChange(parseInt(e.target.value) || 0)}
                          className="flex-1 px-6 py-4 rounded-xl border-2 border-indigo-200 bg-white font-mono text-xl outline-none focus:border-indigo-400"
                        />
                        <button 
                          onClick={() => setPhase(Phase.EXPLORATION)}
                          className="px-8 py-4 bg-indigo-500 text-white rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20"
                        >
                          Börja
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="text-xs text-indigo-600 uppercase tracking-widest font-bold text-center">Din talföljd:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {Array.from({length: 9}, (_, i) => customStart + i).map(n => (
                            <div key={n} className="px-4 py-2 bg-white rounded-xl border border-indigo-100 font-mono text-sm text-indigo-800 shadow-sm">
                              {n}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-12 w-full flex flex-col items-center"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-4xl font-serif italic text-stone-800">
                      {phase === Phase.CHALLENGE ? '4x4 Utmaning' : 'Bygg din kvadrat'}
                    </h2>
                    <p className="text-stone-500">Placera brickorna så att alla summor stämmer.</p>
                  </div>

                  {/* Magic Square Grid */}
                  <div className="relative p-12 bg-stone-200 rounded-3xl shadow-inner border border-stone-300 flex items-center justify-center">
                    {/* Diagonal Sums */}
                    <div className="absolute top-0 left-0 -translate-x-4 -translate-y-4">
                      <SumBadge value={getDiag2Sum()} target={targetSum} showTarget={showTarget} label="D2" />
                    </div>
                    <div className="absolute top-0 right-0 translate-x-4 -translate-y-4">
                      <SumBadge value={getDiag1Sum()} target={targetSum} showTarget={showTarget} label="D1" />
                    </div>

                    <div className={`grid gap-4 ${gridSize === 3 ? 'grid-cols-3' : 'grid-cols-4'}`}>
                      {grid.map((val, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleCellClick(i)}
                          className={`${gridSize === 3 ? 'w-24 h-24 text-3xl' : 'w-16 h-16 text-xl'} rounded-2xl flex items-center justify-center font-mono font-bold transition-all shadow-sm border-2 ${
                            val !== null 
                              ? 'bg-white border-stone-100 text-stone-800' 
                              : 'bg-stone-100/50 border-dashed border-stone-300 text-stone-300'
                          }`}
                        >
                          {val}
                        </motion.button>
                      ))}
                    </div>

                    {/* Row Sums */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 space-y-4 flex flex-col">
                      {Array.from({length: gridSize}, (_, r) => (
                        <SumBadge key={r} value={getRowSum(r)} target={targetSum} showTarget={showTarget} />
                      ))}
                    </div>

                    {/* Col Sums */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-16 space-x-4 flex">
                      {Array.from({length: gridSize}, (_, c) => (
                        <SumBadge key={c} value={getColSum(c)} target={targetSum} showTarget={showTarget} />
                      ))}
                    </div>
                  </div>

                  {isSolved && (
                    <div className="flex justify-center">
                      <motion.button
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        onClick={startNextPhase}
                        className="px-8 py-4 bg-stone-800 text-white rounded-2xl font-bold flex items-center space-x-3 hover:bg-stone-900 transition-all shadow-xl shadow-stone-800/20"
                      >
                        <span className="text-lg">Nästa fas</span>
                        <ChevronRight size={24} />
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Available Numbers & Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 bg-white rounded-3xl shadow-sm border border-stone-200 space-y-6">
              <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400">Tillgängliga brickor</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                {availableNumbers.map(n => (
                  <motion.button
                    key={n}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedNumber(n === selectedNumber ? null : n)}
                    className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-mono font-bold shadow-md transition-all border-2 ${
                      selectedNumber === n 
                        ? 'bg-amber-500 border-amber-600 text-white scale-110 ring-4 ring-amber-100' 
                        : 'bg-stone-800 border-stone-900 text-white hover:bg-stone-700'
                    }`}
                  >
                    {n}
                  </motion.button>
                ))}
              </div>
              {availableNumbers.length === 0 && (
                <p className="text-xs text-stone-400 italic text-center">Alla brickor är utlagda.</p>
              )}
              <button 
                onClick={reset}
                className="w-full py-3 rounded-xl border border-stone-200 text-stone-400 text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors"
              >
                Rensa kvadraten
              </button>
            </div>

            {/* Pattern Scanner (Fas 1 Success) */}
            {isSolved && phase === Phase.EXPLORATION && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-8 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-6"
              >
                <div className="flex items-center space-x-3 text-emerald-700">
                  <Info size={24} />
                  <h3 className="text-xl font-serif font-medium italic">Mönster-skanner</h3>
                </div>
                <ul className="space-y-4 text-emerald-900 text-sm">
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                    <p>Vilket tal hamnade i mitten? (Tips: Det är alltid 5 i den klassiska kvadraten)</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                    <p>Titta på motsatta tal (t.ex. 4 och 6). Vad blir deras summa?</p>
                  </li>
                  <li className="flex items-start space-x-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                    <p>Var ligger de jämna talen? (Ofta i hörnen!)</p>
                  </li>
                </ul>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const SumBadge: React.FC<{ value: number, target: number, showTarget: boolean, label?: string }> = ({ value, target, showTarget, label }) => {
  const isCorrect = value === target;
  const isEmpty = value === 0;

  return (
    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all border-2 ${
      isEmpty ? 'bg-stone-100 border-stone-200 text-stone-300' :
      isCorrect ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg scale-110' :
      'bg-white border-stone-200 text-stone-400'
    }`}>
      {label && <span className="text-[8px] uppercase font-bold opacity-50">{label}</span>}
      <span className="text-sm font-mono font-bold">{value}</span>
      {showTarget && !isCorrect && !isEmpty && (
        <span className="text-[8px] font-bold text-rose-400">/{target}</span>
      )}
    </div>
  );
};

export default MagicSquareLab;
