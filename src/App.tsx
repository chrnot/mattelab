import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFrogGame } from './hooks/useFrogGame';
import { Phase, ResultEntry } from './types';
import FrogBoard from './components/FrogBoard';
import ResultTable from './components/ResultTable';
import FormulaBuilder from './components/FormulaBuilder';
import TeacherView from './components/TeacherView';
import { ChevronRight, LayoutGrid, BrainCircuit, Target, GraduationCap } from 'lucide-react';

const App: React.FC = () => {
  const [phase, setPhase] = useState<Phase>(Phase.EXPLORATION);
  const [frogCount, setFrogCount] = useState(1);
  const [results, setResults] = useState<ResultEntry[]>([]);
  const [prediction, setPrediction] = useState<string>('');
  const [showPredictionInput, setShowPredictionInput] = useState(false);

  const { state, move, undo, reset, autoMove } = useFrogGame(frogCount);

  // Handle solving a level
  useEffect(() => {
    if (state.isSolved) {
      const minMoves = frogCount * (frogCount + 2);
      if (state.moves === minMoves) {
        // Only add if not already there
        if (!results.find(r => r.frogCount === frogCount)) {
          setResults(prev => [...prev, { frogCount, minMoves }]);
        }
      }
    }
  }, [state.isSolved, state.moves, frogCount, results]);

  // Handle phase transitions
  useEffect(() => {
    if (results.length === 4 && phase === Phase.EXPLORATION) {
      setShowPredictionInput(true);
      setPhase(Phase.PREDICTION);
    }
  }, [results.length, phase]);

  const nextLevel = () => {
    if (frogCount < 4) {
      const nextCount = frogCount + 1;
      setFrogCount(nextCount);
      reset(nextCount);
    }
  };

  const handlePredictionSubmit = () => {
    if (prediction === '35') {
      setShowPredictionInput(false);
      setFrogCount(5);
      reset(5);
    } else {
      alert("Inte riktigt! Titta på mönstret i tabellen igen. Hur mycket ökar hoppen varje gång?");
    }
  };

  const skipToAbstract = () => {
    setPhase(Phase.ABSTRACT_LEAP);
    setFrogCount(50);
    reset(50);
  };

  const goToGeneralization = () => {
    setPhase(Phase.GENERALIZATION);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans selection:bg-amber-200">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-8 py-6 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center text-white">
            <LayoutGrid size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-serif font-medium tracking-tight italic">Grodhopp</h1>
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-stone-400">Digitalt Laboratorium</span>
          </div>
        </div>

        <nav className="flex items-center space-x-8">
          {[
            { id: Phase.EXPLORATION, icon: Target, label: 'Utforska' },
            { id: Phase.PREDICTION, icon: BrainCircuit, label: 'Mönster' },
            { id: Phase.ABSTRACT_LEAP, icon: ChevronRight, label: 'Stora tal' },
            { id: Phase.GENERALIZATION, icon: GraduationCap, label: 'Algebra' },
          ].map((p) => (
            <div
              key={p.id}
              className={`flex items-center space-x-2 transition-colors ${
                phase === p.id ? 'text-stone-900' : 'text-stone-400'
              }`}
            >
              <p.icon size={18} />
              <span className="text-xs font-bold uppercase tracking-widest">{p.label}</span>
              {phase === p.id && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute bottom-0 h-0.5 bg-stone-800"
                />
              )}
            </div>
          ))}
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Game Area */}
        <div className="lg:col-span-8 space-y-8">
          <AnimatePresence mode="wait">
            {phase === Phase.GENERALIZATION ? (
              <motion.div
                key="generalization"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <FormulaBuilder onSuccess={() => console.log('Solved!')} />
              </motion.div>
            ) : phase === Phase.ABSTRACT_LEAP ? (
              <motion.div
                key="abstract"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="p-12 bg-stone-800 text-white rounded-3xl shadow-2xl flex flex-col items-center text-center space-y-8">
                  <h2 className="text-4xl font-serif italic">50 grodor i varje familj</h2>
                  <p className="text-stone-400 max-w-md leading-relaxed">
                    Att klicka 2600 gånger skulle ta väldigt lång tid. 
                    Det är dags att tänka som en matematiker och hitta en genväg.
                  </p>
                  <div className="w-full h-1 bg-stone-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-amber-400"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                  <button
                    onClick={goToGeneralization}
                    className="px-12 py-4 bg-white text-stone-900 rounded-xl font-bold hover:bg-stone-100 transition-all transform hover:scale-105"
                  >
                    Gå till Algebra
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="game"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h2 className="text-3xl font-serif italic text-stone-800">
                      Nivå: {frogCount} + {frogCount} grodor
                    </h2>
                    <p className="text-stone-500 text-sm">
                      Flytta de röda grodorna till höger och de gröna till vänster.
                    </p>
                  </div>
                  
                  {state.isSolved && frogCount < 5 && (
                    <motion.button
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={nextLevel}
                      className="px-6 py-3 bg-stone-800 text-white rounded-xl font-bold flex items-center space-x-2 hover:bg-stone-900 transition-all"
                    >
                      <span>Nästa nivå</span>
                      <ChevronRight size={18} />
                    </motion.button>
                  )}

                  {frogCount === 5 && state.isSolved && (
                    <motion.button
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      onClick={skipToAbstract}
                      className="px-6 py-3 bg-stone-800 text-white rounded-xl font-bold flex items-center space-x-2 hover:bg-stone-900 transition-all"
                    >
                      <span>Det abstrakta språnget</span>
                      <ChevronRight size={18} />
                    </motion.button>
                  )}
                </div>

                <FrogBoard
                  board={state.board}
                  onMove={move}
                  onUndo={undo}
                  onReset={() => reset()}
                  onAutoMove={autoMove}
                  moves={state.moves}
                  isLocked={state.isLocked}
                  isSolved={state.isSolved}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Table & Prediction */}
        <div className="lg:col-span-4 space-y-8">
          <ResultTable results={results} currentFrogCount={frogCount} />

          {showPredictionInput && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-amber-50 rounded-3xl border-2 border-amber-200 shadow-sm space-y-6"
            >
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-mono uppercase tracking-widest text-amber-600">Mönsterspaning</h3>
                <h4 className="text-xl font-serif font-medium italic text-amber-900">
                  Hur många hopp tror du krävs för 5 grodor?
                </h4>
              </div>

              <div className="flex space-x-2">
                <input
                  type="number"
                  value={prediction}
                  onChange={(e) => setPrediction(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-amber-200 bg-white font-mono text-lg focus:border-amber-400 outline-none"
                  placeholder="Gissa..."
                />
                <button
                  onClick={handlePredictionSubmit}
                  className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors"
                >
                  Testa
                </button>
              </div>
              
              <p className="text-xs text-amber-700 italic leading-relaxed">
                Titta på differensen i tabellen. Ökningen följer ett tydligt mönster: 5, 7, 9... vad kommer härnäst?
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <TeacherView />
    </div>
  );
};

export default App;
