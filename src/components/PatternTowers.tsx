import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Trophy, 
  ArrowRight, 
  Layers, 
  HelpCircle, 
  History, 
  Calculator,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Lock,
  Compass,
  Coins
} from 'lucide-react';

// --- Types & Data Models ---

interface PatternDef {
  id: string;
  name: string;
  formulaDisplay: string; // "2n + 1"
  formulaTerms: string[]; // for interactive creation helper
  targets: number[]; // target cube counts for index 0,1,2 of towers
  constant: number; // e.g. 1 in "2n + 1"
  multiplier: number; // e.g. 2 in "2n + 1"
  question10: number; // expected result for n=10
  validFormulas: string[]; // alternative notations for verification
  description: string;
}

const PATTERNS: PatternDef[] = [
  {
    id: '2n_plus_1',
    name: "Tornen med udda antal",
    formulaDisplay: "2n + 1",
    formulaTerms: ["2", "n", "+", "1"],
    targets: [3, 5, 7], // Tower 1 = 3, Tower 2 = 5, Tower 3 = 7
    constant: 1,
    multiplier: 2,
    question10: 21,
    validFormulas: ["2n+1", "2*n+1", "1+2n", "n*2+1", "2n + 1", "1 + 2n"],
    description: "Varje torn har en blå botten-kloss (konstant) och ökar med två gula klossar för varje steg."
  },
  {
    id: '3n_plus_1',
    name: "Tornen med trippel-hopp",
    formulaDisplay: "3n + 1",
    formulaTerms: ["3", "n", "+", "1"],
    targets: [4, 7, 10], // Tower 1 = 4, Tower 2 = 7, Tower 3 = 10
    constant: 1,
    multiplier: 3,
    question10: 31,
    validFormulas: ["3n+1", "3*n+1", "1+3n", "n*3+1", "3n + 1", "1 + 3n"],
    description: "Tre kuber tillkommer varje steg. Hur snabbt växer tornen när lutningen ökar?"
  },
  {
    id: '2n_plus_2',
    name: "Dubbelbas-mönstret",
    formulaDisplay: "2n + 2",
    formulaTerms: ["2", "n", "+", "2"],
    targets: [4, 6, 8], // Tower 1 = 4, Tower 2 = 6, Tower 3 = 8
    constant: 2,
    multiplier: 2,
    question10: 22,
    validFormulas: ["2n+2", "2*n+2", "2+2n", "n*2+2", "2n + 2", "2 + 2n"],
    description: "Bottenplattan består av två klossar. Varje steg lägger till ännu ett par av kuber!"
  },
  {
    id: 'n_plus_3',
    name: "Det stadiga mönstret",
    formulaDisplay: "n + 3",
    formulaTerms: ["n", "+", "3"],
    targets: [4, 5, 6], // Tower 1 = 4, Tower 2 = 5, Tower 3 = 6
    constant: 3,
    multiplier: 1,
    question10: 13,
    validFormulas: ["n+3", "3+n", "1*n+3", "n + 3", "3 + n"],
    description: "Ett jämnt och lugnt mönstret med en stor blå bas klossar och bara en ny kloss per torn."
  }
];

// Play Synth Sounds via Web Audio API (No files required!)
const playSound = (type: 'add' | 'remove' | 'success' | 'incorrect') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'add') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // E5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'remove') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'success') {
      // Little chord
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      freqs.forEach((f, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(f, ctx.currentTime + index * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + index * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.08 + 0.45);
        osc.start(ctx.currentTime + index * 0.08);
        osc.stop(ctx.currentTime + index * 0.08 + 0.5);
      });
    } else if (type === 'incorrect') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.setValueAtTime(160, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch (err) {
    // Fail silently if browser blocks AudioContext initialization
  }
};

const PatternTowers: React.FC = () => {
  // --- Game State hooks ---
  const [activePatternIdx, setActivePatternIdx] = useState<number>(0);
  const currentPattern = PATTERNS[activePatternIdx];

  // Height of Tower 1, Tower 2, Tower 3 (index 0 corresponds to Tower 1/n=1)
  const [towerHeights, setTowerHeights] = useState<number[]>([0, 0, 0]);
  const [showPatternColors, setShowPatternColors] = useState<boolean>(false);

  // Phases and Progress locks
  const [phase1Completed, setPhase1Completed] = useState<boolean>(false);
  
  // Phase 3 predictions state (Torn 4, 5, 10 heights)
  const [inputValT4, setInputValT4] = useState<string>('');
  const [inputValT5, setInputValT5] = useState<string>('');
  const [inputValT10, setInputValT10] = useState<string>('');
  
  // Algebra final step answers
  const [formulaInput, setFormulaInput] = useState<string>('');
  const [formulaCorrect, setFormulaCorrect] = useState<boolean>(false);
  const [successAnimationFinished, setSuccessAnimationFinished] = useState<boolean>(false);
  
  // Info Drawer/Modal support
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Clean-slate state reset on pattern toggles
  useEffect(() => {
    setTowerHeights([0, 0, 0]);
    setShowPatternColors(false);
    setPhase1Completed(false);
    setInputValT4('');
    setInputValT5('');
    setInputValT10('');
    setFormulaInput('');
    setFormulaCorrect(false);
    setSuccessAnimationFinished(false);
  }, [activePatternIdx]);

  // --- Calculations for validations ---

  const isTower1Match = towerHeights[0] === currentPattern.targets[0];
  const isTower2Match = towerHeights[1] === currentPattern.targets[1];
  const isTower3Match = towerHeights[2] === currentPattern.targets[2];

  const nowUnlockedPhase3 = isTower1Match && isTower2Match && isTower3Match;

  // Sync completion flow & notify with sounds
  useEffect(() => {
    if (nowUnlockedPhase3 && !phase1Completed) {
      setPhase1Completed(true);
      playSound('success');
    }
  }, [nowUnlockedPhase3, phase1Completed]);

  // Handle tower additions / subtractions
  const adjustTowerHeight = (towerIdx: number, change: number) => {
    if (phase1Completed && nowUnlockedPhase3) {
      // Block Bygghallen changes if already completed the initial phase to preserve algebraic focus
      return;
    }

    setTowerHeights(prev => {
      const copy = [...prev];
      const newHeight = Math.max(0, Math.min(12, copy[towerIdx] + change));
      if (newHeight !== copy[towerIdx]) {
        playSound(change > 0 ? 'add' : 'remove');
      }
      copy[towerIdx] = newHeight;
      return copy;
    });
  };

  // Check custom predictions in the algebraic phase
  const isT4Correct = useMemo(() => {
    const expected = currentPattern.multiplier * 4 + currentPattern.constant;
    return parseInt(inputValT4) === expected;
  }, [inputValT4, currentPattern]);

  const isT5Correct = useMemo(() => {
    const expected = currentPattern.multiplier * 5 + currentPattern.constant;
    return parseInt(inputValT5) === expected;
  }, [inputValT5, currentPattern]);

  const isT10Correct = useMemo(() => {
    return parseInt(inputValT10) === currentPattern.question10;
  }, [inputValT10, currentPattern]);

  // Check algebraic formula pattern matching Swedish naming as well
  const checkFormulaText = (value: string) => {
    const cleaned = value.toLowerCase().replace(/\s+/g, '');
    const isMatched = currentPattern.validFormulas.some(formula => {
      const testCleaned = formula.toLowerCase().replace(/\s+/g, '');
      return cleaned === testCleaned;
    });

    if (isMatched && !formulaCorrect) {
      playSound('success');
      setFormulaCorrect(true);
    }
    setFormulaInput(value);
  };

  // Generate tactical colors representing "Konstanten" vs "Lutningen/Förändringen"
  const getCubeColor = (towerIdx: number, cubeIdx: number) => {
    if (!showPatternColors) {
      return 'bg-amber-600 border-amber-700 shadow-amber-600/10'; // default wood colored block
    }

    const n = towerIdx + 1; // n-index (Tower 1, Tower 2, Tower 3)
    const constantVal = currentPattern.constant;
    const changeCountForThisTower = currentPattern.multiplier * n;

    if (cubeIdx < constantVal) {
      // Bottom static baseline: The Constant (Blå!)
      return 'bg-sky-500 border-sky-600 shadow-sky-400/20';
    } else if (cubeIdx < constantVal + changeCountForThisTower) {
      // The growing stepping parts: The Change (Gul!)
      return 'bg-amber-400 border-amber-500 shadow-amber-300/20';
    } else {
      // Overflow blocks that exceeds actual formula count: Slate
      return 'bg-slate-300 border-slate-400 shadow-stone-200/20';
    }
  };

  // Interactive Equation building assistants
  const handleTileClick = (val: string) => {
    if (formulaCorrect) return;
    const revised = formulaInput + val;
    checkFormulaText(revised);
  };

  const handleClearFormula = () => {
    setFormulaInput('');
    setFormulaCorrect(false);
  };

  // --- SVG 3D Isometric Stacking Engine ---

  const drawTactileCube = (towerX: number, columnY: number, blockColor: string, isTopCube: boolean) => {
    // Render isometric cubes in coordinates using pure SVG polygons
    // X, Y coordinates represents 3D projection parameters
    const size = 60;
    const h = size * 0.45; // Height/flat scale
    const offsetZ = columnY * size * 0.72; // stack gap

    const cx = towerX;
    const cy = 250 - offsetZ;

    // Define Shading gradients using direct Tailwind attributes/inline strokes
    const isBlue = blockColor.includes('sky');
    const isYellow = blockColor.includes('amber-400');
    const isNeutral = blockColor.includes('slate-300');

    // Set colors according to didactical types
    const faceColors = isBlue 
      ? { top: '#38bdf8', left: '#0284c7', right: '#0369a1' } // Sky block shades
      : isYellow
      ? { top: '#fbbf24', left: '#d97706', right: '#b45309' } // Amber block shades
      : isNeutral
      ? { top: '#cbd5e1', left: '#64748b', right: '#475569' } // Excess neutral shades
      : { top: '#d97706', left: '#92400e', right: '#78350f' }; // Standard natural wood block shades

    // Corner relative vectors
    const pointsTop = `${cx},${cy - h} ${cx + size},${cy - h/2} ${cx},${cy} ${cx - size},${cy - h/2}`;
    const pointsLeft = `${cx - size},${cy - h/2} ${cx},${cy} ${cx},${cy + size} ${cx - size},${cy + size - h/2}`;
    const pointsRight = `${cx + size},${cy - h/2} ${cx},${cy} ${cx},${cy + size} ${cx + size},${cy + size - h/2}`;

    return (
      <g key={`cube-${towerX}-${columnY}`} className="transition-all duration-300 transform scale-95">
        {/* Shadow floor projection bottom shadow (only for first cube) */}
        {columnY === 0 && (
          <ellipse cx={cx} cy={cy + size + 8} rx={size * 0.8} ry={8} fill="rgba(0,0,0,0.06)" />
        )}

        {/* Isometric face: LEFT */}
        <polygon points={pointsLeft} fill={faceColors.left} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

        {/* Isometric face: RIGHT */}
        <polygon points={pointsRight} fill={faceColors.right} stroke="rgba(255,255,255,0.12)" strokeWidth={1} />

        {/* Isometric face: TOP */}
        <polygon points={pointsTop} fill={faceColors.top} stroke="rgba(255,255,255,0.15)" strokeWidth={1} />

        {/* Center tactile peg on top face - characteristic to centikubes! */}
        <ellipse cx={cx} cy={cy - h/2} rx={size * 0.22} ry={h * 0.22} fill="rgba(0,0,0,0.15)" />
        <ellipse cx={cx} cy={cy - h/2 - 4} rx={size * 0.22} ry={h * 0.22} fill={faceColors.top} stroke="rgba(0,0,0,0.1)" strokeWidth={0.5} />

        {/* Floating Index label index indicators */}
        <text
          x={cx}
          y={cy + size*0.4}
          textAnchor="middle"
          fill="rgba(255, 255, 255, 0.44)"
          fontSize={10}
          fontWeight="black"
          className="pointer-events-none select-none font-mono"
        >
          {columnY + 1}
        </text>

        {/* Connecting cylinder representation for non-top cubes */}
        {!isTopCube && (
          <g opacity={0.65}>
            <rect x={cx - size*0.08} y={cy - h/2 - 20} width={size*0.16} height={20} fill={faceColors.top} />
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8 flex flex-col items-center gap-6 font-sans select-none overflow-x-hidden">
      
      {/* Header Container */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center bg-white p-4 md:p-6 rounded-[2.5rem] border border-stone-200/80 shadow-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-500 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-sky-500/10">
            <Layers size={24} />
          </div>
          <div>
            <h1 className="text-xl font-serif font-black text-stone-900 tracking-tight">Mönster-Tornen</h1>
            <p className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1">
              <span>Algebra & Mönster</span>
              <span className="text-stone-300">•</span>
              <span className="text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded text-[9px]">Åk 4–9</span>
            </p>
          </div>
        </div>

        {/* Pattern Chooser dropdown */}
        <div className="flex items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200/50 w-full md:w-auto">
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-wider pl-3 hidden lg:inline">Regel:</span>
          <select 
            value={activePatternIdx}
            onChange={(e) => setActivePatternIdx(Number(e.target.value))}
            className="bg-white text-stone-900 border border-stone-200/80 font-bold text-xs py-2 px-4 rounded-xl shadow-xs outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
          >
            {PATTERNS.map((pat, idx) => (
              <option key={pat.id} value={idx}>{pat.name} ({pat.formulaDisplay})</option>
            ))}
          </select>
        </div>

        {/* Secondary help triggers */}
        <div className="flex gap-2">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-3 bg-stone-100 text-stone-600 hover:text-stone-950 hover:bg-stone-200 rounded-xl transition-all"
            title="Lektionsguide"
          >
            <HelpCircle size={18} />
          </button>
          <button
            onClick={() => {
              setTowerHeights([0,0,0]);
              setInputValT4('');
              setInputValT5('');
              setInputValT10('');
              setFormulaInput('');
              setFormulaCorrect(false);
            }}
            className="flex items-center gap-1.5 px-4 py-3 bg-stone-900 text-white hover:bg-stone-800 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
          >
            <RefreshCw size={14} /> Starta om
          </button>
        </div>
      </header>

      {/* Main Grid Workdesk */}
      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
        
        {/* LEFT COMPONENT: Bygghallen (The Concrete Layout) */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] border border-stone-200/80 shadow-md p-6 flex flex-col relative overflow-hidden">
          
          <div className="flex justify-between items-start mb-4 z-10">
            <div>
              <h2 className="text-lg font-serif font-bold text-stone-900 tracking-tight flex items-center gap-1.5">
                <span>Bygghallen</span>
                <span className="text-[10px] bg-stone-100 border border-stone-200 p-1.5 rounded-lg text-stone-500 uppercase tracking-widest font-mono font-bold">Det konkreta</span>
              </h2>
              <p className="text-[11px] text-stone-500 mt-1 max-w-md">
                Klicka på knapparna över eller under tornen för att stapla centikuber. Matcha de tre första stegen i tabellen!
              </p>
            </div>

            {/* Toggle Pattern Colors */}
            <button
              onClick={() => {
                setShowPatternColors(!showPatternColors);
                playSound('add');
              }}
              className={`flex items-center gap-1.5 py-2 px-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${showPatternColors ? 'bg-sky-500 border-sky-600 text-white shadow-md' : 'bg-stone-50 border-stone-200 text-stone-600'}`}
            >
              <Layers size={12} />
              {showPatternColors ? "Dölj mönsterfärg" : "Visa mönsterfärg"}
            </button>
          </div>

          {/* Interactive Stacking Columns */}
          <div className="flex-1 bg-stone-50/50 border border-stone-200/40 rounded-3xl p-6 min-h-[380px] flex flex-col justify-between relative shadow-inner">
            
            {/* Visual Guide Hint for Phase 1 */}
            {!phase1Completed && (
              <div className="mx-auto bg-amber-500/10 border border-amber-500/20 text-amber-900 text-center rounded-xl p-3 text-[11px] font-medium leading-relaxed max-w-xl animate-pulse">
                📌 <span className="font-bold">Uppdrag:</span> Bygg tornen så höga som de ska vara i mönstret. 
                Torn 1 = <strong className="font-extrabold">{currentPattern.targets[0]}</strong>, 
                Torn 2 = <strong className="font-extrabold">{currentPattern.targets[1]}</strong> och 
                Torn 3 = <strong className="font-extrabold">{currentPattern.targets[2]}</strong> kuber!
              </div>
            )}

            {/* Canvas/Tower rendering base */}
            <div className="flex-1 grid grid-cols-3 items-end gap-1 mb-8 pt-8">
              {towerHeights.map((height, towerIdx) => {
                const target = currentPattern.targets[towerIdx];
                const isMatch = height === target;

                return (
                  <div key={towerIdx} className="flex flex-col items-center h-full justify-end relative group">
                    
                    {/* Tower Label Column */}
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-10 pointer-events-none">
                      <span className="text-[10px] font-black font-mono bg-stone-900 text-white px-2 py-0.5 rounded-full mb-1">
                        Torn {towerIdx + 1}
                      </span>
                      <div className="flex gap-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${isMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 border text-stone-500'}`}>
                          H = {height} / {target}
                        </span>
                      </div>
                    </div>

                    {/* Stacking Workspace (SVG Based for accuracy depth) */}
                    <svg className="w-full h-[280px]" viewBox="0 0 200 280" overflow="visible">
                      {/* Target faint bounding indicators */}
                      {!phase1Completed && (
                        <g opacity={0.12} stroke="#000000" strokeWidth={1} strokeDasharray="3 3">
                          {Array.from({ length: target }).map((_, idx) => (
                            <rect 
                              key={`target-outline-${idx}`}
                              x={100 - 32} 
                              y={250 - idx * 60 * 0.72} 
                              width={64} 
                              height={35} 
                              fill="none" 
                            />
                          ))}
                        </g>
                      )}

                      {/* Display placed cubes inside towers */}
                      {Array.from({ length: height }).map((_, idx) => {
                        const styleClass = getCubeColor(towerIdx, idx);
                        const isTop = idx === height - 1;
                        return drawTactileCube(100, idx, styleClass, isTop);
                      })}

                      {/* Clean pedestal bases */}
                      <g className="opacity-80">
                        <path d="M 60,250 L 140,250 L 150,265 L 50,265 Z" fill="#78716c" />
                        <rect x="50" y="265" width="100" height="8" fill="#44403c" rx={4} ry={4} />
                      </g>
                    </svg>

                    {/* Fast increment/decrement floating buttons panel only if not locked */}
                    <div className="flex items-center gap-1.5 mt-2 z-10">
                      <button
                        onClick={() => adjustTowerHeight(towerIdx, -1)}
                        disabled={height === 0 || phase1Completed}
                        className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-400 font-bold text-sm shadow-xs flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-90"
                      >
                        -
                      </button>
                      <button
                        onClick={() => adjustTowerHeight(towerIdx, 1)}
                        disabled={height >= 12 || phase1Completed}
                        className="w-8 h-8 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 hover:border-stone-400 font-bold text-sm shadow-xs flex items-center justify-center transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-90"
                      >
                        +
                      </button>
                    </div>

                    {/* Mini indicator showing success target matching */}
                    {isMatch ? (
                      <div className="absolute bottom-1 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-sm z-20">
                        <CheckCircle2 size={12} />
                      </div>
                    ) : null}

                  </div>
                );
              })}
            </div>

            {/* Didactical Pattern Legend (Fas 2 Colors) */}
            {showPatternColors && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 bg-sky-50/70 border border-sky-100 rounded-2xl flex flex-col sm:flex-row gap-4 text-xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-sky-500 border border-sky-600 rounded" />
                  <span className="text-stone-700 font-serif">
                    <strong>Konstanten ({currentPattern.constant}):</strong> Alltid den fasta botten ({currentPattern.constant} st kuber).
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-400 border border-amber-500 rounded" />
                  <span className="text-stone-700 font-serif">
                    <strong>Lutning/Förändring:</strong> Ökar med {currentPattern.multiplier} kuber för varje nytt torn ({currentPattern.multiplier} · n).
                  </span>
                </div>
              </motion.div>
            )}

          </div>

          {/* Locked state overlay when they complete phase 1 to start logic jumping */}
          {nowUnlockedPhase3 && (
            <div className="absolute right-6 bottom-6 flex items-center gap-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider py-1.5 px-3 rounded-xl shadow-lg shadow-emerald-500/10">
              <Lock size={12} /> Bygghallen Låst (Steg 3 Aktiv)
            </div>
          )}

        </div>

        {/* RIGHT COMPONENT: Datatabellen (The Logical / Math Layout) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Section 1: The real-time synced table */}
          <section className="bg-white rounded-[2.5rem] border border-stone-200/80 shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.15em] flex items-center gap-1.5">
                <Calculator size={14} className="text-sky-500" /> Datatabell
              </h3>
              <span className="text-[10px] bg-sky-50 border border-sky-200 px-2 py-1 rounded text-sky-700 uppercase tracking-widest font-mono font-bold">Det abstrakta</span>
            </div>

            {/* Synchronized Table Layout */}
            <div className="overflow-hidden border border-stone-200 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase text-[9px] font-mono tracking-wider">
                    <th className="py-2.5 px-4 w-1/3 text-center">Torn nummer (n)</th>
                    <th className="py-2.5 px-4 text-center">Antal kuber</th>
                    <th className="py-2.5 px-4 text-center w-1/4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-xs text-stone-700 font-medium">
                  {/* Tower 1 */}
                  <tr className={`transition-colors ${isTower1Match ? 'bg-emerald-50/40 text-stone-900' : 'bg-transparent'}`}>
                    <td className="py-2 px-4 text-center font-mono text-stone-400">1</td>
                    <td className="py-2 px-4 text-center font-bold font-serif text-sm">
                      {towerHeights[0] || '?'}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded uppercase font-mono ${isTower1Match ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400'}`}>
                        {isTower1Match ? "Klar" : "Bygg!"}
                      </span>
                    </td>
                  </tr>

                  {/* Tower 2 */}
                  <tr className={`transition-colors ${isTower2Match ? 'bg-emerald-50/40 text-stone-900' : 'bg-transparent'}`}>
                    <td className="py-2 px-4 text-center font-mono text-stone-400">2</td>
                    <td className="py-2 px-4 text-center font-bold font-serif text-sm">
                      {towerHeights[1] || '?'}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded uppercase font-mono ${isTower2Match ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400'}`}>
                        {isTower2Match ? "Klar" : "Bygg!"}
                      </span>
                    </td>
                  </tr>

                  {/* Tower 3 */}
                  <tr className={`transition-colors ${isTower3Match ? 'bg-emerald-50/40 text-stone-900' : 'bg-transparent'}`}>
                    <td className="py-2 px-4 text-center font-mono text-stone-400">3</td>
                    <td className="py-2 px-4 text-center font-bold font-serif text-sm">
                      {towerHeights[2] || '?'}
                    </td>
                    <td className="py-2 px-4 text-center">
                      <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded uppercase font-mono ${isTower3Match ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-400'}`}>
                        {isTower3Match ? "Klar" : "Bygg!"}
                      </span>
                    </td>
                  </tr>

                  {/* Extended algebraic leap progression fields (Unlocked in Stage 3) */}
                  {phase1Completed && (
                    <>
                      {/* Tower 4 Prediction */}
                      <tr className="bg-stone-50/30">
                        <td className="py-2 px-4 text-center font-mono text-stone-400">4</td>
                        <td className="py-2 px-4 text-center">
                          <input 
                            type="number"
                            placeholder="Hur många?"
                            value={inputValT4}
                            onChange={(e) => setInputValT4(e.target.value)}
                            className={`w-28 text-center text-xs font-bold p-1 rounded-md border text-stone-800 focus:outline-none focus:ring-1 focus:ring-sky-500 ${isT4Correct ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-stone-200'}`}
                          />
                        </td>
                        <td className="py-2 px-4 text-center">
                          {isT4Correct ? (
                            <span className="text-[9.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">RÄTT</span>
                          ) : inputValT4 !== '' ? (
                            <span className="text-[9.5px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded">TÄNK OM</span>
                          ) : (
                            <span className="text-[9.5px] text-stone-400">Gissa</span>
                          )}
                        </td>
                      </tr>

                      {/* Tower 5 Prediction */}
                      <tr className="bg-stone-50/30">
                        <td className="py-2 px-4 text-center font-mono text-stone-400">5</td>
                        <td className="py-2 px-4 text-center">
                          <input 
                            type="number"
                            placeholder="Hur många?"
                            value={inputValT5}
                            onChange={(e) => setInputValT5(e.target.value)}
                            className={`w-28 text-center text-xs font-bold p-1 rounded-md border text-stone-800 focus:outline-none focus:ring-1 focus:ring-sky-500 ${isT5Correct ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-stone-200'}`}
                          />
                        </td>
                        <td className="py-2 px-4 text-center">
                          {isT5Correct ? (
                            <span className="text-[9.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">RÄTT</span>
                          ) : inputValT5 !== '' ? (
                            <span className="text-[9.5px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded">TÄNK OM</span>
                          ) : (
                            <span className="text-[9.5px] text-stone-400">Gissa</span>
                          )}
                        </td>
                      </tr>

                      {/* Tower 10 Prediction */}
                      <tr className="bg-amber-50/20">
                        <td className="py-2 px-4 text-center font-mono text-amber-500 font-bold">10</td>
                        <td className="py-2 px-4 text-center">
                          <input 
                            type="number"
                            placeholder="Hur många?"
                            value={inputValT10}
                            onChange={(e) => setInputValT10(e.target.value)}
                            className={`w-28 text-center text-xs font-bold p-1 rounded-md border text-stone-800 focus:outline-none focus:ring-1 focus:ring-sky-500 ${isT10Correct ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-amber-300/60'}`}
                          />
                        </td>
                        <td className="py-2 px-4 text-center">
                          {isT10Correct ? (
                            <span className="text-[9.5px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">RÄTT</span>
                          ) : inputValT10 !== '' ? (
                            <span className="text-[9.5px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded">TÄNK OM</span>
                          ) : (
                            <span className="text-[9.5px] text-stone-400">Gissa</span>
                          )}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 2: Algebra high generalisation step */}
          <section className="bg-white rounded-[2.5rem] border border-stone-200/80 shadow-md p-6 flex-1 flex flex-col justify-between">
            <h3 className="text-xs font-black text-stone-400 uppercase tracking-[0.15em] mb-4 flex items-center gap-1.5">
              <TrendingUp size={14} className="text-sky-500" /> Det algebraiska språnget
            </h3>

            {phase1Completed ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[9.5px] bg-sky-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">Steg 1</span>
                  <h4 className="text-sm font-serif font-black text-stone-900 mt-1">Generalisera mönstret för alla tal!</h4>
                  <p className="text-[11px] text-stone-500 leading-relaxed mt-1">
                    Använd datatabellen eller färgkoderna för att förstå hur tornets höjd hänger ihop med dess nummer (<strong className="font-bold">n</strong>).
                  </p>
                </div>

                {/* Question 10 helper text */}
                {!isT10Correct ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10.5px] font-medium text-amber-900 leading-snug">
                    💡 <span className="font-bold">Tips:</span> Fyll först i torn nummer <strong className="font-mono">10</strong> i datatabellen ovan för att låsa upp formel-fältet!
                  </div>
                ) : (
                  <div className="space-y-4 pt-1 flex-1 flex flex-col justify-center">
                    <div>
                      <span className="text-[9.5px] bg-sky-600 text-white font-black px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">Steg 2</span>
                      <h4 className="text-sm font-serif font-black text-stone-900 mt-1">Skriv en regel (formel) för torn n:</h4>
                      <p className="text-[10px] text-stone-400 font-mono mt-0.5">Regel f(n) = ...</p>
                    </div>

                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Ex: 2n + 1"
                        value={formulaInput}
                        onChange={(e) => checkFormulaText(e.target.value)}
                        disabled={formulaCorrect}
                        className={`flex-1 p-3 rounded-xl border font-mono font-bold text-sm tracking-wide focus:outline-none text-center ${formulaCorrect ? 'bg-emerald-50 border-emerald-400 text-emerald-800' : 'bg-stone-50 border-stone-200 text-stone-700'}`}
                      />
                      <button
                        onClick={handleClearFormula}
                        disabled={formulaCorrect}
                        className="py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-500 rounded-xl transition-all disabled:opacity-30 disabled:pointer-events-none"
                        title="Rensa fält"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Interactive math symbol keyboard helper */}
                    {!formulaCorrect && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[9px] font-mono text-stone-400 uppercase tracking-widest text-center">Klicka på elementen för att skriva snabbt</p>
                        <div className="flex justify-center gap-1">
                          {currentPattern.formulaTerms.concat(["*", "n", "+", "2", "3"]).slice(0, 7).map((term, i) => (
                            <button
                              key={i}
                              onClick={() => handleTileClick(term)}
                              className="px-2.5 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200/80 rounded-lg text-[10.5px] font-mono font-black text-stone-700 shadow-2xs cursor-pointer"
                            >
                              {term}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {formulaCorrect && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200/50 rounded-xl flex items-center gap-2.5 text-emerald-900 font-serif text-[11px] leading-snug">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <div>
                          <strong className="font-bold">Formeln stämmer: f(n) = {formulaInput}!</strong>
                          <p className="text-[10px] text-emerald-700/80 italic mt-0.5">Bra jobbat! Du har framgångsrikt formulerat ett generellt algebraiskt samband.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-stone-400 space-y-3">
                <Lock size={28} className="text-stone-300 stroke-1" />
                <p className="text-xs font-serif italic max-w-xs leading-relaxed">
                  "Det algebraiska språnget låses upp när de tre första tornen står rätt i Bygghallen."
                </p>
              </div>
            )}
          </section>

        </div>
      </main>

      {/* SUCCESS OVERLAY MODAL */}
      <AnimatePresence>
        {formulaCorrect && !successAnimationFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] border border-stone-100 shadow-2xl p-8 max-w-md w-full text-center relative overflow-hidden"
            >
              {/* Confetti simulation graphic background */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <div className="absolute w-4 h-4 bg-sky-400 rotate-12 top-6 left-12 animate-bounce" />
                <div className="absolute w-3.5 h-3.5 bg-amber-400 rotate-45 top-12 right-12 animate-ping" />
                <div className="absolute w-5 h-5 bg-emerald-400 -rotate-12 bottom-12 left-16 animate-pulse" />
              </div>

              <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 mx-auto mb-4 border-4 border-emerald-50 shadow-md">
                <Trophy size={32} />
              </div>

              <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-full">Klarad</span>
              <h3 className="text-2xl font-serif font-black text-stone-900 mt-2">Mönstret Avkodat!</h3>
              
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/50 my-6">
                <p className="text-[10.5px] text-stone-500 uppercase tracking-wider font-mono font-bold">Löst mönster:</p>
                <h4 className="text-base font-serif font-bold text-stone-800 mt-1">{currentPattern.name}</h4>
                <div className="text-xl font-bold text-sky-600 font-mono mt-2">f(n) = {currentPattern.formulaDisplay}</div>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto mb-6">
                Snyggt räknat! Du har upptäckt hur mönstret ökar matematiskt och skrivit en helt korrekt formel för alla torn.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    const nextIdx = (activePatternIdx + 1) % PATTERNS.length;
                    setActivePatternIdx(nextIdx);
                    setSuccessAnimationFinished(true);
                  }}
                  className="w-full py-3 bg-sky-500 text-white hover:bg-sky-600 font-black uppercase text-xs tracking-wider rounded-xl transition-all shadow-md active:translate-y-px"
                >
                  Gå till nästa mönster
                </button>
                <button
                  onClick={() => setSuccessAnimationFinished(true)}
                  className="w-full py-2.5 bg-stone-100 text-stone-600 hover:bg-stone-200 font-bold uppercase text-[10px] tracking-wider rounded-xl transition-all"
                >
                  Utforska mönsterfärger
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DIDACTIC DIDACTICS MODAL */}
      <AnimatePresence>
        {isHelpOpen && (
          <div className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-[2rem] border border-stone-200 shadow-xl max-w-xl w-full p-6 relative"
            >
              <h3 className="text-xl font-serif font-black text-stone-900 mb-2 flex items-center gap-2">
                <Compass size={22} className="text-sky-500" /> Didaktisk handledning: Mönster-Tornen
              </h3>
              
              <div className="space-y-4 my-4 h-[350px] overflow-y-auto pr-2 text-stone-600 text-[11px] leading-relaxed">
                <div>
                  <h4 className="font-bold text-stone-900 uppercase tracking-wide text-[10px]">Introduktion:</h4>
                  <p className="mt-1">
                    Widgeten "Mönster-Tornen" är utformad för att underlätta övergången från det konkreta kloss-byggandet till det abstrakta formulerandet av algebraiska regler. Den lämpar sig utmärkt för pararbete i årskurs 4 till 9.
                  </p>
                </div>

                <div className="border-t border-stone-100 pt-3">
                  <h4 className="font-bold text-stone-900 uppercase tracking-wide text-[10px]">Didaktiskt flöde:</h4>
                  <ul className="list-disc pl-4 space-y-1.5 mt-1">
                    <li>
                      <strong>Efterapa mönstret:</strong> Eleverna bygger tornen fysiskt i Bygghallen. Samtidigt ifylls datatabellen automatisk. Detta visar kopplingen mellan en fysisk dimension (antal klossar) och ett siffervärde (vy-höjd).
                    </li>
                    <li>
                      <strong>Det didaktiska färg-lagret:</strong> Genom att slå på "Visa mönsterfärg" färgkodas klossarna. Den blå botten representerar termen $+C$ (konstanten). De gula klossarna representerar ökningen $M \cdot n$ (lutningen). Det hjälper eleverna se "Varför formeln ser ut som den gör".
                    </li>
                    <li>
                      <strong>Det algebraiska språnget:</strong> När bygghallen låses tvingas eleverna generalisera för torn nummer 4, 5, 10 och sedan formulera regeln $f(n)$.
                    </li>
                  </ul>
                </div>

                <div className="border-t border-stone-100 pt-3">
                  <h4 className="font-bold text-stone-900 uppercase tracking-wide text-[10px]">Lektions- och diskussionsfrågor att ställa:</h4>
                  <ul className="list-disc pl-4 space-y-1.5 mt-1">
                    <li>"Hur många fler gula klossar tillkommer det för varje nytt steg?"</li>
                    <li>"Om du bygger torn nummer 100, hur mycket av det tornet är gult och hur mycket är blått?"</li>
                    <li>"Skulle du kunna bygga mönstret på ett annat sätt så att en annan del är konstant?"</li>
                  </ul>
                </div>
              </div>

              <button
                onClick={() => setIsHelpOpen(false)}
                className="w-full mt-2 py-3 bg-stone-900 text-white font-black uppercase text-xs tracking-wider rounded-xl transition-all"
              >
                Jag förstår, låt mig bygga!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PatternTowers;
