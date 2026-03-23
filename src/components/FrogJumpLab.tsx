import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFrogGame } from '../hooks/useFrogGame';
import { Phase, ResultEntry } from '../types';
import FrogBoard from './FrogBoard';
import ResultTable from './ResultTable';
import FormulaBuilder from './FormulaBuilder';
import { ChevronRight, BrainCircuit, Target, GraduationCap } from 'lucide-react';

const FrogJumpLab: React.FC = () => {
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
    <div className="flex flex-col h-full">
      <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between sticky top-0 z-30">
        <nav className="flex items-center space-x-8">
          {[
            { id: Phase.EXPLORATION, icon: Target, label: 'Utforska' },
            { id: Phase.PREDICTION, icon: BrainCircuit, label: 'Mönster' },
            { id: Phase.ABSTRACT_LEAP, icon: ChevronRight, label: 'Stora tal' },
            { id: Phase.GENERALIZATION, icon: GraduationCap, label: 'Algebra' },
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
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-800"
                />
              )}
            </div>
          ))}
        </nav>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Game Area */}
          <div className="lg:col-span-8 space-y-12 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {phase === Phase.GENERALIZATION ? (
                <motion.div
                  key="generalization"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="w-full"
                >
                  <FormulaBuilder onSuccess={() => console.log('Solved!')} />
                </motion.div>
              ) : phase === Phase.ABSTRACT_LEAP ? (
                <motion.div
                  key="abstract"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="w-full"
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
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12 w-full flex flex-col items-center"
                >
                  <div className="text-center space-y-2">
                    <h2 className="text-4xl font-serif italic text-stone-800">
                      Nivå: {frogCount} + {frogCount} grodor
                    </h2>
                    <p className="text-stone-500">
                      Flytta de röda grodorna till höger och de gröna till vänster.
                    </p>
                  </div>

                  <div className="w-full flex justify-center">
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
                  </div>
                  
                  {state.isSolved && (
                    <div className="flex justify-center">
                      {frogCount < 5 ? (
                        <motion.button
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          onClick={nextLevel}
                          className="px-8 py-4 bg-stone-800 text-white rounded-2xl font-bold flex items-center space-x-3 hover:bg-stone-900 transition-all shadow-xl shadow-stone-800/20"
                        >
                          <span className="text-lg">Nästa nivå</span>
                          <ChevronRight size={24} />
                        </motion.button>
                      ) : (
                        <motion.button
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          onClick={skipToAbstract}
                          className="px-8 py-4 bg-stone-800 text-white rounded-2xl font-bold flex items-center space-x-3 hover:bg-stone-900 transition-all shadow-xl shadow-stone-800/20"
                        >
                          <span className="text-lg">Det abstrakta språnget</span>
                          <ChevronRight size={24} />
                        </motion.button>
                      )}
                    </div>
                  )}
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
        </div>
      </main>
    </div>
  );
};

export default FrogJumpLab;
