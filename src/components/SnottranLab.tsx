import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  RotateCcw, 
  HelpCircle, 
  BookOpen, 
  Undo2, 
  FlipHorizontal,
  Lightbulb,
  Award,
  CircleDot,
  Calculator,
  Grid
} from 'lucide-react';

interface LeftItem {
  id: string;
  label: string | React.ReactNode;
  value: any;
  shapeType?: string; // used for custom rendering
}

interface RightItem {
  id: string;
  label: string;
  value: any;
}

interface SnottranExercise {
  id: string;
  name: string;
  description: string;
  operationLabel: string;
  leftItems: LeftItem[];
  rightItems: RightItem[];
  checkMatch: (left: any, right: any) => boolean;
}

// Preset types
type SnottranPresetId = 'multiplication' | 'tiokamrater' | 'geometri' | 'division';

const SnottranLab: React.FC = () => {
  const [presetId, setPresetId] = useState<SnottranPresetId>('multiplication');
  const [multiplicand, setMultiplicand] = useState<number>(6); // Default 6's table
  
  // Exercise states
  const [exercise, setExercise] = useState<SnottranExercise | null>(null);
  const [connections, setConnections] = useState<Record<number, number>>({}); // maps leftIndex -> rightIndex
  const [history, setHistory] = useState<Record<number, number>[]>([{}]);
  const [activeStep, setActiveStep] = useState<number>(0); // Current left index to drag from
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [showGuideLines, setShowGuideLines] = useState<boolean>(true);

  // Drag states
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });
  const [hoveredRightIdx, setHoveredRightIdx] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Dimensions
  const boardWidth = 340;
  const boardHeight = 620;
  const waveLength = 22;
  const waveAmp = 5;

  // Render SVG of a shape for geometry preset
  const renderShapeIcon = (shapeType: string) => {
    switch (shapeType) {
      case 'kvadrat':
        return <div className="w-6 h-6 border-2 border-stone-800 bg-amber-100 rounded-sm" />;
      case 'triangel':
        return (
          <svg className="w-6 h-6 text-stone-800 fill-amber-100" viewBox="0 0 24 24">
            <polygon points="12,3 2,21 22,21" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'cirkel':
        return <div className="w-6 h-6 border-2 border-stone-800 bg-amber-100 rounded-full" />;
      case 'rektangel':
        return <div className="w-8 h-5 border-2 border-stone-800 bg-amber-100 rounded-sm" />;
      case 'oval':
        return <div className="w-8 h-5 border-2 border-stone-800 bg-amber-100 rounded-full" />;
      case 'pentagon':
        return (
          <svg className="w-6 h-6 text-stone-800 fill-amber-100" viewBox="0 0 24 24">
            <polygon points="12,2 22,9 18,21 6,21 2,9" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'hexagon':
        return (
          <svg className="w-6 h-6 text-stone-800 fill-amber-100" viewBox="0 0 24 24">
            <polygon points="12,2 21,7 21,17 12,22 3,17 3,7" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'romb':
        return (
          <svg className="w-6 h-6 text-stone-800 fill-amber-100" viewBox="0 0 24 24">
            <polygon points="12,2 21,12 12,22 3,12" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'trapets':
        return (
          <svg className="w-7 h-5 text-stone-800 fill-amber-100" viewBox="0 0 24 24">
            <polygon points="6,2 18,2 23,22 1,22" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      case 'parallellogram':
        return (
          <svg className="w-8 h-5 text-stone-800 fill-amber-100" viewBox="0 0 24 24">
            <polygon points="8,2 24,2 16,22 0,22" stroke="currentColor" strokeWidth="2" />
          </svg>
        );
      default:
        return <div className="w-6 h-6 border bg-amber-100" />;
    }
  };

  // Helper shuffle
  const shuffle = <T,>(arr: T[]): T[] => {
    return [...arr].sort(() => Math.random() - 0.5);
  };

  // Build the state for an exercise
  const initializeExercise = () => {
    setIsFlipped(false);
    setConnections({});
    setHistory([{}]);
    setActiveStep(0);

    if (presetId === 'multiplication') {
      const sourceNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const shuffledLeft = shuffle(sourceNumbers);
      const shuffledRight = shuffle(sourceNumbers);

      const leftItems: LeftItem[] = shuffledLeft.map(n => ({
        id: `left-${n}`,
        label: `${n}`,
        value: n
      }));

      const rightItems: RightItem[] = shuffledRight.map(n => ({
        id: `right-${n * multiplicand}`,
        label: `${n * multiplicand}`,
        value: n * multiplicand
      }));

      setExercise({
        id: 'multiplication',
        name: `${multiplicand}:ans Multiplikation`,
        description: `Träna på ${multiplicand}-tabellens produkter. Dra det röda garnet från talet till vänster till dess rätta produkt till höger.`,
        operationLabel: `× ${multiplicand}`,
        leftItems,
        rightItems,
        checkMatch: (l, r) => l * multiplicand === r
      });
    } else if (presetId === 'tiokamrater') {
      const sourceNumbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const shuffledLeft = shuffle(sourceNumbers);
      const shuffledRight = shuffle(sourceNumbers);

      const leftItems: LeftItem[] = shuffledLeft.map(n => ({
        id: `left-${n}`,
        label: `${n}`,
        value: n
      }));

      const rightItems: RightItem[] = shuffledRight.map(n => ({
        id: `right-${n}`,
        label: `${n}`,
        value: n
      }));

      setExercise({
        id: 'tiokamrater',
        name: 'Tiokamrater',
        description: 'Vilka två tal bildar tillsammans 10? Koppla ihop tiokamraterna genom att dra garnet från vänster till höger.',
        operationLabel: '+ __ = 10',
        leftItems,
        rightItems,
        checkMatch: (l, r) => l + r === 10
      });
    } else if (presetId === 'division') {
      const divisors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      const shuffledLeft = shuffle(divisors);
      const shuffledRight = shuffle(divisors);

      const leftItems: LeftItem[] = shuffledLeft.map(q => ({
        id: `left-${q * 3}`,
        label: `${q * 3}`,
        value: q * 3
      }));

      const rightItems: RightItem[] = shuffledRight.map(q => ({
        id: `right-${q}`,
        label: `${q}`,
        value: q
      }));

      setExercise({
        id: 'division',
        name: 'Division med 3',
        description: 'Hitta kvoten för varje tal delat med 3. Dra garnet från talet till vänster till det svar som motsvarar talet dividerat med 3.',
        operationLabel: '÷ 3',
        leftItems,
        rightItems,
        checkMatch: (l, r) => l / 3 === r
      });
    } else if (presetId === 'geometri') {
      const shapes = [
        { key: 'kvadrat', label: 'Kvadrat' },
        { key: 'triangel', label: 'Triangel' },
        { key: 'cirkel', label: 'Cirkel' },
        { key: 'rektangel', label: 'Rektangel' },
        { key: 'oval', label: 'Oval' },
        { key: 'pentagon', label: 'Pentagon' },
        { key: 'hexagon', label: 'Hexagon' },
        { key: 'romb', label: 'Romb' },
        { key: 'trapets', label: 'Trapets' },
        { key: 'parallellogram', label: 'Parallellogram' }
      ];

      const shuffledLeft = shuffle(shapes);
      const shuffledRight = shuffle(shapes);

      const leftItems: LeftItem[] = shuffledLeft.map(item => ({
        id: `left-${item.key}`,
        label: renderShapeIcon(item.key),
        value: item.key,
        shapeType: item.key
      }));

      const rightItems: RightItem[] = shuffledRight.map(item => ({
        id: `right-${item.key}`,
        label: item.label,
        value: item.key
      }));

      setExercise({
        id: 'geometri',
        name: 'Figurer & Formers namn',
        description: 'Koppla ihop den geometriska figuren till vänster med dess rätta namn till höger.',
        operationLabel: 'Geometri',
        leftItems,
        rightItems,
        checkMatch: (l, r) => l === r
      });
    }
  };

  // Re-run setup on preset or multiplicand change
  useEffect(() => {
    initializeExercise();
  }, [presetId, multiplicand]);

  // Calculations for coordinate positions
  const N = exercise ? exercise.leftItems.length : 11;
  const startY = 45;
  const usableHeight = 530;

  const leftNotches = useMemo(() => {
    return Array.from({ length: N }).map((_, i) => ({
      x: 35, // margin on left
      y: startY + i * (usableHeight / (N - 1))
    }));
  }, [N]);

  const rightNotches = useMemo(() => {
    return Array.from({ length: N }).map((_, i) => ({
      x: boardWidth - 35, // margin on right
      y: startY + i * (usableHeight / (N - 1))
    }));
  }, [N]);

  // Position for final anchor at bottom center
  const bottomAnchor = { x: boardWidth / 2, y: boardHeight - 20 };

  // Generate math representation for the scallops
  const scallopedPath = useMemo(() => {
    let d = `M ${waveAmp + 15} 12`;
    // Top boundary slightly curved
    d += ` Q ${boardWidth / 2} 4, ${boardWidth - waveAmp - 15} 12`;
    
    // Right boundary (wavy/serrated edges)
    for (let y = 12; y <= boardHeight - 12; y += 4) {
      const x = boardWidth - 15 - waveAmp + Math.sin(y / waveLength) * waveAmp;
      d += ` L ${x} ${y}`;
    }

    // Bottom boundary slightly curved
    d += ` Q ${boardWidth / 2} ${boardHeight - 4}, ${waveAmp + 15} ${boardHeight - 12}`;
    
    // Left boundary (wavy/serrated edges)
    for (let y = boardHeight - 12; y >= 12; y -= 4) {
      const x = 15 + waveAmp + Math.sin(y / waveLength) * waveAmp;
      d += ` L ${x} ${y}`;
    }

    d += " Z";
    return d;
  }, []);

  // Retrieve correct right notch index for a given left notch index i
  const getCorrectRightIdx = (leftIdx: number): number => {
    if (!exercise) return -1;
    const leftItem = exercise.leftItems[leftIdx];
    return exercise.rightItems.findIndex(r => exercise.checkMatch(leftItem.value, r.value));
  };

  // Handle pointer coordinate extraction
  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isFlipped || !exercise) return;
    if (activeStep >= N) return; // already completed all connections

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Get touch coordinates within viewBox (340 x 620)
    const x = ((e.clientX - rect.left) / rect.width) * boardWidth;
    const y = ((e.clientY - rect.top) / rect.height) * boardHeight;

    // Find if down index fits active step
    const startPoint = leftNotches[activeStep];
    const dist = Math.hypot(x - startPoint.x, y - startPoint.y);

    // Dynamic drag activation (allows tapping anywhere close to start, or anywhere inside board for flow)
    if (dist < 45 || activeStep >= 0) {
      // Begin drawing thread!
      setIsDragging(true);
      setPointerPos({ x, y });
      svgRef.current?.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * boardWidth;
    const y = ((e.clientY - rect.top) / rect.height) * boardHeight;
    setPointerPos({ x, y });

    // Track active hovering right notch
    let closestIdx = -1;
    let minDist = 40; // max interaction threshold for snapping/halo highlight
    rightNotches.forEach((notch, idx) => {
      const d = Math.hypot(x - notch.x, y - notch.y);
      if (d < minDist) {
        minDist = d;
        closestIdx = idx;
      }
    });

    setHoveredRightIdx(closestIdx !== -1 ? closestIdx : null);
  };

  const handlePointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    setHoveredRightIdx(null);
    svgRef.current?.releasePointerCapture(e.pointerId);

    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = ((e.clientX - rect.left) / rect.width) * boardWidth;
    const y = ((e.clientY - rect.top) / rect.height) * boardHeight;

    // Determine closest right notch
    let closestIdx = -1;
    let minDist = 9999;
    rightNotches.forEach((notch, idx) => {
      const d = Math.hypot(x - notch.x, y - notch.y);
      if (d < minDist) {
        minDist = d;
        closestIdx = idx;
      }
    });

    // Check if we snap to the closest notch
    if (closestIdx !== -1 && minDist < 90) {
      const newConnections = { ...connections, [activeStep]: closestIdx };
      setConnections(newConnections);
      
      // Save in history for undo stack
      setHistory(prev => [...prev, newConnections]);

      // Move to next step
      setActiveStep(prev => prev + 1);
    }
  };

  // Undo utility
  const handleUndo = () => {
    if (isFlipped) return;
    if (activeStep === 0) return;

    const newHistory = history.slice(0, -1);
    if (newHistory.length > 0) {
      setHistory(newHistory);
      setConnections(newHistory[newHistory.length - 1]);
      setActiveStep(prev => prev - 1);
    }
  };

  // Reset current challenge
  const handleReset = () => {
    setConnections({});
    setHistory([{}]);
    setActiveStep(0);
    setIsFlipped(false);
  };

  // Check if everything has been correctly paired for celebration modal/status
  const isOptimalSolve = useMemo(() => {
    if (!exercise) return false;
    if (Object.keys(connections).length < N) return false;
    
    return Object.entries(connections).every(([leftIdx, rightIdx]) => {
      const idx = parseInt(leftIdx, 10);
      return rightIdx === getCorrectRightIdx(idx);
    });
  }, [connections, exercise, N]);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 flex flex-col items-center gap-8 font-sans select-none overflow-x-hidden">
      
      {/* Upper Module Info Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
            <Sparkles size={22} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Den Digitala Snottran</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taluppfattning & Mönster</p>
          </div>
        </div>

        {/* Dynamic Preset Switcher */}
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setPresetId('multiplication')}
            className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer ${presetId === 'multiplication' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100/80 text-slate-500 hover:bg-slate-200/80'}`}
          >
            Multiplikation
          </button>
          <button
            onClick={() => setPresetId('tiokamrater')}
            className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer ${presetId === 'tiokamrater' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100/80 text-slate-500 hover:bg-slate-200/80'}`}
          >
            Tiokamrater
          </button>
          <button
            onClick={() => setPresetId('division')}
            className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer ${presetId === 'division' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100/80 text-slate-500 hover:bg-slate-200/80'}`}
          >
            Division
          </button>
          <button
            onClick={() => setPresetId('geometri')}
            className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all cursor-pointer ${presetId === 'geometri' ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100/80 text-slate-500 hover:bg-slate-200/80'}`}
          >
            Geometri
          </button>
        </div>
      </header>

      {/* Main Play Area */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left column: Controls and descriptions */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          {/* Active Preset Intro details */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-md">
            <h2 className="text-lg font-black text-slate-900 mb-2">{exercise?.name}</h2>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">{exercise?.description}</p>
            
            {/* Custom Multiplicand details shown only when in multiplication mode */}
            {presetId === 'multiplication' && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-2">Välj tabell</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMultiplicand(num)}
                      className={`py-1.5 focus:outline-none font-bold text-xs rounded-lg transition-all ${multiplicand === num ? 'bg-rose-500 text-white font-black scale-105' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/60'}`}
                    >
                      ×{num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Task Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/50 text-center">
                <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Status</span>
                <span className="text-xl font-mono font-black text-slate-800">
                  {activeStep} <span className="text-xs text-slate-400">av</span> {N}
                </span>
              </div>
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/50 text-center">
                <span className="block text-[9px] font-black uppercase text-slate-400 tracking-wider mb-1">Läge</span>
                <span className={`text-xs font-black uppercase tracking-wider ${isFlipped ? 'text-amber-600 font-bold' : 'text-indigo-600 font-bold'}`}>
                  {isFlipped ? "Baksida (Facit)" : "Laborerar"}
                </span>
              </div>
            </div>

            {/* Practical Action Buttons */}
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  onClick={handleUndo}
                  disabled={activeStep === 0 || isFlipped}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:hover:bg-slate-100 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Undo2 size={14} /> Ångra drag
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw size={14} /> Nollställ
                </button>
              </div>

              {/* Flip Button */}
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className={`py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer ${
                  activeStep === N 
                    ? 'bg-amber-500 text-white hover:bg-amber-600 hover:-translate-y-0.5 active:translate-y-0 animate-bounce' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <FlipHorizontal size={16} /> 
                {isFlipped ? "Visa Framsida" : "Vänd på snottran (Facit)"}
              </button>
            </div>
          </div>

          {/* Didactic Instruction Bubble */}
          <div className="bg-rose-50/60 border border-rose-100 rounded-[2.5rem] p-6 text-rose-950/90 flex flex-col shadow-xs">
            <h3 className="text-xs font-black uppercase tracking-widest text-rose-800 mb-2 flex items-center gap-2">
              <BookOpen size={16} /> Didaktisk själv-check
            </h3>
            <p className="text-[11px] leading-relaxed mb-3">
              I en fysisk snottra döljer vi facit på baksidan medan vi trär det röda garnet genom skårorna. 
            </p>
            <p className="text-[11px] leading-relaxed italic text-rose-800/80">
              Vrid och vänd på snottran när du är klar! Symmetrin på baksidan avslöjar direkt om din logik och dina beräkningar stämmer, utan behov av röda kryss eller pilar.
            </p>
            
            {/* Toggle guides during Facit check */}
            {isFlipped && (
              <div className="mt-4 pt-3 border-t border-rose-200/50 flex items-center justify-between">
                <span className="text-[10px] font-bold text-rose-900 uppercase">Visa hjälplinjer på baksidan</span>
                <button
                  onClick={() => setShowGuideLines(!showGuideLines)}
                  className={`w-10 h-6 rounded-full p-0.5 transition-all outline-none ${showGuideLines ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-all ${showGuideLines ? 'translate-x-4' : 'translate-x-0'}`} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column: The interactive 3D Snottran layout */}
        <div className="md:col-span-8 flex justify-center items-center py-4 relative">
          
          <div className="perspective-container relative">
            
            {/* 3D Rotator card */}
            <div className={`snottran-card-rotator ${isFlipped ? 'rotated' : ''}`}>
              
              {/* front side */}
              <div className="snottran-card-face card-front">
                <div className="absolute inset-0 bg-transparent rounded-[3rem] p-4 flex flex-col justify-between items-center overflow-hidden">
                  
                  {/* Textured SVG wrapper covering entire card area */}
                  <svg 
                    ref={svgRef}
                    viewBox={`0 0 ${boardWidth} ${boardHeight}`} 
                    className="absolute inset-0 w-full h-full select-none"
                    style={{ filter: "drop-shadow(0 15px 35px rgba(0,0,0,0.15))" }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  >
                    {/* Definitions for patterns and marble textures */}
                    <defs>
                      <linearGradient id="paperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#fbfbfa" />
                        <stop offset="40%" stopColor="#f5f5f0" />
                        <stop offset="100%" stopColor="#e9e8de" />
                      </linearGradient>
                      
                      <radialGradient id="marblePattern" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#e3dfd3" stopOpacity="0.4" />
                        <stop offset="70%" stopColor="#ded9c3" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#c5bea8" stopOpacity="0" />
                      </radialGradient>

                      {/* Wood peg aesthetics */}
                      <linearGradient id="woodPeg" x1="0" y1="0" x2="100%" y2="0">
                        <stop offset="0%" stopColor="#78350f" />
                        <stop offset="50%" stopColor="#b45309" />
                        <stop offset="100%" stopColor="#78350f" />
                      </linearGradient>

                      <filter id="yarnShadow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="1" dy="3" stdDeviation="1.5" floodOpacity="0.3" />
                      </filter>
                    </defs>

                    {/* Scalloped edge cardboard shape */}
                    <path 
                      d={scallopedPath} 
                      fill="url(#paperGrad)" 
                      stroke="#d4ceb8" 
                      strokeWidth="2.5" 
                    />

                    {/* Fine Marbled overlays to mimic authentic patterned crafts paper */}
                    <path 
                      d={scallopedPath} 
                      fill="url(#marblePattern)" 
                    />

                    {/* Left & Right Notch channels cut out from the paper edges */}
                    {leftNotches.map((notch, idx) => (
                      <g key={`l-notch-${idx}`}>
                        {/* Cut Shadow circle */}
                        <circle cx={notch.x - 17} cy={notch.y} r="10" fill="#2d2219" opacity="0.12" />
                        {/* Sliced cardboard notch */}
                        <path 
                          d={`M ${notch.x - 18} ${notch.y - 7} L ${notch.x} ${notch.y} L ${notch.x - 18} ${notch.y + 7} Z`} 
                          fill="#d3caa7" 
                          stroke="#a89a71"
                          strokeWidth="1.5" 
                        />
                        {/* Interactive circle indicator - highlights when current */}
                        <circle 
                          cx={notch.x} 
                          cy={notch.y} 
                          r="6" 
                          fill={idx === activeStep && !isFlipped ? '#f43f5e' : '#78350f'} 
                          className={idx === activeStep && !isFlipped ? "animate-pulse" : ""}
                        />
                        {idx === activeStep && !isFlipped && (
                          <circle cx={notch.x} cy={notch.y} r="12" stroke="#f43f5e" strokeWidth="2" fill="none" className="animate-ping" opacity="0.6" style={{ transformOrigin: `${notch.x}px ${notch.y}px` }} />
                        )}
                      </g>
                    ))}

                    {rightNotches.map((notch, idx) => {
                      const isHovered = hoveredRightIdx === idx;
                      return (
                        <g key={`r-notch-${idx}`}>
                          <circle cx={notch.x + 17} cy={notch.y} r="10" fill="#2d2219" opacity="0.12" />
                          <path 
                            d={`M ${notch.x + 18} ${notch.y - 7} L ${notch.x} ${notch.y} L ${notch.x + 18} ${notch.y + 7} Z`} 
                            fill="#d3caa7" 
                            stroke="#a89a71"
                            strokeWidth="1.5" 
                          />
                          <circle 
                            cx={notch.x} 
                            cy={notch.y} 
                            r={isHovered ? "8" : "6"} 
                            fill={isHovered ? '#10b981' : '#78350f'} 
                            style={{ transition: 'all 0.15s' }}
                          />
                          {isHovered && (
                            <circle cx={notch.x} cy={notch.y} r="14" stroke="#10b981" strokeWidth="2" fill="none" className="animate-pulse" />
                          )}
                        </g>
                      );
                    })}

                    {/* Final Bottom anchoring notch */}
                    <g>
                      <path 
                        d={`M ${bottomAnchor.x - 8} ${bottomAnchor.y + 12} L ${bottomAnchor.x} ${bottomAnchor.y} L ${bottomAnchor.x + 8} ${bottomAnchor.y + 12} Z`} 
                        fill="#d3caa7" 
                        stroke="#a89a71"
                        strokeWidth="1.5" 
                      />
                      <circle cx={bottomAnchor.x} cy={bottomAnchor.y} r="7" fill="#78350f" />
                    </g>


                    {/* ---------------- DRAWING THE YARN STRING ---------------- */}
                    {/* Back threads shown faintly translucent on front for logical guidance */}
                    {Array.from({ length: N }).map((_, idx) => {
                      const rightIdx = connections[idx];
                      if (rightIdx === undefined || idx + 1 >= N) return null;
                      
                      const start = rightNotches[rightIdx];
                      const end = leftNotches[idx + 1];

                      return (
                        <line 
                          key={`back-shadow-thread-${idx}`}
                          x1={start.x}
                          y1={start.y}
                          x2={end.x}
                          y2={end.y}
                          stroke="#e11d48"
                          strokeWidth="2.5"
                          strokeDasharray="4,6"
                          opacity="0.25"
                        />
                      );
                    })}

                    {/* Front solid threads */}
                    {Object.entries(connections).map(([leftIdx, rightIdx]) => {
                      const idx = parseInt(leftIdx, 10);
                      const start = leftNotches[idx];
                      const end = rightNotches[rightIdx];

                      return (
                        <g key={`front-thread-${idx}`}>
                          {/* Rich shadow for physical lifting effect */}
                          <line 
                            x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                            stroke="#000000" strokeWidth="5" opacity="0.12"
                            filter="url(#yarnShadow)"
                          />
                          {/* Solid woolen thread */}
                          <line 
                            x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                            stroke="#e11d48" strokeWidth="4.5"
                            strokeLinecap="round"
                          />
                          {/* Inner yarn sheen highlighting craft details */}
                          <line 
                            x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                            stroke="#fda4af" strokeWidth="1" strokeDasharray="5,15" opacity="0.8"
                            strokeLinecap="round"
                          />
                        </g>
                      );
                    })}

                    {/* Dragging thread */}
                    {isDragging && activeStep < N && (
                      <g>
                        {/* Shadow */}
                        <line 
                          x1={leftNotches[activeStep].x} y1={leftNotches[activeStep].y}
                          x2={pointerPos.x} y2={pointerPos.y}
                          stroke="#000000" strokeWidth="5.5" opacity="0.1"
                          filter="url(#yarnShadow)"
                        />
                        {/* Thick Red yarn */}
                        <line 
                          x1={leftNotches[activeStep].x} y1={leftNotches[activeStep].y}
                          x2={pointerPos.x} y2={pointerPos.y}
                          stroke="#f43f5e" strokeWidth="4.5"
                          strokeLinecap="round"
                        />
                        {/* Wool shiny detail */}
                        <line 
                          x1={leftNotches[activeStep].x} y1={leftNotches[activeStep].y}
                          x2={pointerPos.x} y2={pointerPos.y}
                          stroke="#ffe4e6" strokeWidth="1" strokeDasharray="3,10" opacity="0.9"
                          strokeLinecap="round"
                        />
                        {/* Loose end tip bubble */}
                        <circle cx={pointerPos.x} cy={pointerPos.y} r="5" fill="#e11d48" />
                      </g>
                    )}

                    {/* Final step anchor tail line when all 13 are fully connected */}
                    {activeStep === N && Object.keys(connections).length === N && (
                      <g>
                        <line 
                          x1={rightNotches[connections[N - 1]].x} y1={rightNotches[connections[N - 1]].y}
                          x2={bottomAnchor.x} y2={bottomAnchor.y}
                          stroke="#000000" strokeWidth="4" opacity="0.1"
                        />
                        <line 
                          x1={rightNotches[connections[N - 1]].x} y1={rightNotches[connections[N - 1]].y}
                          x2={bottomAnchor.x} y2={bottomAnchor.y}
                          stroke="#e11d48" strokeWidth="4.5"
                          strokeLinecap="round"
                        />
                      </g>
                    )}
                  </svg>

                  {/* HTML Layers overlaying SVG for labels and center task display */}
                  {/* Left Side Labels: centered vertically and matching coordinates exactly */}
                  <div className="absolute left-10 inset-y-0 w-20 pointer-events-none flex flex-col justify-between" style={{ padding: `${startY - 14}px 0` }}>
                    {exercise?.leftItems.map((item, idx) => (
                      <div 
                        key={item.id} 
                        className={`h-7 flex items-center justify-start text-stone-800 font-bold transition-all ${idx === activeStep && !isFlipped ? 'scale-110 text-rose-600 font-extrabold font-mono' : 'text-stone-700 font-mono text-sm'}`}
                      >
                        {item.shapeType ? (
                          <div className="flex items-center justify-center p-0.5" title={item.id}>
                            {item.label}
                          </div>
                        ) : (
                          <span className="bg-white/80 backdrop-blur-[1px] px-2 py-0.5 rounded-lg border border-slate-200/50 shadow-xs">{item.label}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Central Operation Display Bubble */}
                  <div 
                    className="absolute z-10 p-3 bg-amber-500 text-white rounded-3xl flex flex-col items-center justify-center shadow-lg border-2 border-amber-400 pointer-events-none"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      minWidth: '76px',
                    }}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest text-amber-100 opacity-90 leading-tight">Beräkna</span>
                    <span className="text-sm font-black tracking-tight mt-0.5 leading-none">{exercise?.operationLabel}</span>
                  </div>

                  {/* Right Side Labels matching RightNotches */}
                  <div className="absolute right-10 inset-y-0 w-24 pointer-events-none flex flex-col justify-between text-right" style={{ padding: `${startY - 14}px 0` }}>
                    {exercise?.rightItems.map((item, idx) => (
                      <div 
                        key={item.id}
                        className={`h-7 flex items-center justify-end text-stone-700 font-bold font-mono text-xs transition-all ${hoveredRightIdx === idx ? 'scale-110 text-emerald-600 font-black' : ''}`}
                      >
                        <span className="bg-white/80 backdrop-blur-[1px] px-2 py-0.5 rounded-lg border border-slate-200/50 shadow-xs leading-none">{item.label}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>


              {/* BACK SIDE (FACIT-VÄNDEN) */}
              <div className="snottran-card-face card-back">
                <div className="absolute inset-0 bg-transparent rounded-[3rem] p-4 flex flex-col justify-between items-center overflow-hidden">
                  
                  {/* Textured SVG wrapper covering entire card area */}
                  <svg 
                    viewBox={`0 0 ${boardWidth} ${boardHeight}`} 
                    className="absolute inset-0 w-full h-full select-none"
                    style={{ filter: "drop-shadow(0 15px 35px rgba(0,0,0,0.15))" }}
                  >
                    {/* Definitions */}
                    <defs>
                      <linearGradient id="backPaperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f4f4f2" />
                        <stop offset="50%" stopColor="#ebeae2" />
                        <stop offset="100%" stopColor="#deddd3" />
                      </linearGradient>

                      {/* Green glow for correct overlays */}
                      <filter id="correctGlow" x="-10%" y="-10%" width="120%" height="120%">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10b981" floodOpacity="0.8" />
                      </filter>
                    </defs>

                    {/* Cardboard backing shape */}
                    <path 
                      d={scallopedPath} 
                      fill="url(#backPaperGrad)" 
                      stroke="#d1caa7" 
                      strokeWidth="2.5" 
                    />

                    {/* Small wood knot aesthetics to give standard craft-room wood backing */}
                    <circle cx="200" cy="180" r="14" fill="#a89a71" opacity="0.1" />
                    <circle cx="120" cy="420" r="8" fill="#a89a71" opacity="0.08" />

                    {/* Back side notches (horizontal mirror of front) */}
                    {/* Back-Left notches (which are front-right notches) */}
                    {rightNotches.map((notch, idx) => {
                      const backX = boardWidth - notch.x; 
                      return (
                        <g key={`back-notch-l-${idx}`}>
                          <circle cx={backX - 17} cy={notch.y} r="10" fill="#2d2219" opacity="0.12" />
                          <circle cx={backX} cy={notch.y} r="6" fill="#78350f" />
                        </g>
                      );
                    })}

                    {/* Back-Right notches (which are front-left notches) */}
                    {leftNotches.map((notch, idx) => {
                      const backX = boardWidth - notch.x;
                      return (
                        <g key={`back-notch-r-${idx}`}>
                          <circle cx={backX + 17} cy={notch.y} r="10" fill="#2d2219" opacity="0.12" />
                          <circle cx={backX} cy={notch.y} r="6" fill="#78350f" />
                        </g>
                      );
                    })}

                    {/* Back anchoring slot */}
                    <circle cx={boardWidth / 2} cy={bottomAnchor.y} r="7" fill="#78350f" />


                    {/* ---------------- DRAWING CORRECT FACIT-RÄNDER (THE GROOVES) ---------------- */}
                    {/* These are printed lines/channels on the physical back representing success patterns */}
                    {showGuideLines && Array.from({ length: N }).map((_, idx) => {
                      // Correct path for back is from:
                      // Right side (which is front's RIGHT connection for idx)
                      // to Left side (front left index is idx + 1)
                      const correctRightIdx = getCorrectRightIdx(idx);
                      if (correctRightIdx === -1) return null;

                      // Source on back (mirrored front's right notch at correctRightIdx)
                      const startX = boardWidth - rightNotches[correctRightIdx].x;
                      const startYCoord = rightNotches[correctRightIdx].y;

                      // Target on back (mirrored front's left notch at idx + 1)
                      // If it is the last item, it anchors to the bottom notch!
                      const hasNext = idx + 1 < N;
                      const endX = hasNext ? (boardWidth - leftNotches[idx + 1].x) : bottomAnchor.x;
                      const endYCoord = hasNext ? leftNotches[idx + 1].y : bottomAnchor.y;

                      return (
                        <g key={`groove-track-${idx}`}>
                          {/* Sunk groove channel */}
                          <line 
                            x1={startX} y1={startYCoord} x2={endX} y2={endYCoord}
                            stroke="#e2dfd2" strokeWidth="8" strokeLinecap="round"
                          />
                          <line 
                            x1={startX} y1={startYCoord} x2={endX} y2={endYCoord}
                            stroke="#cbd5e1" strokeWidth="3" strokeDasharray="3,3" strokeLinecap="round"
                          />
                        </g>
                      );
                    })}


                    {/* ---------------- DRAWING THE USER'S THREADS ON THE BACK ---------------- */}
                    {/* The thread goes from connectedRight[idx] to leftNotches[idx+1] representation */}
                    {Array.from({ length: N }).map((_, idx) => {
                      const rightIdx = connections[idx];
                      if (rightIdx === undefined) return null;

                      const correctRightIdx = getCorrectRightIdx(idx);
                      const isCorrect = rightIdx === correctRightIdx;

                      // Source on back (mirrored front's right notch connectedRight[idx])
                      const startX = boardWidth - rightNotches[rightIdx].x;
                      const startYCoord = rightNotches[rightIdx].y;

                      // Target on back (mirrored front's left notch idx + 1)
                      const hasNext = idx + 1 < N;
                      const endX = hasNext ? (boardWidth - leftNotches[idx + 1].x) : bottomAnchor.x;
                      const endYCoord = hasNext ? leftNotches[idx + 1].y : bottomAnchor.y;

                      return (
                        <g key={`back-user-thread-${idx}`}>
                          {/* Thread Drop Shadow */}
                          <line 
                            x1={startX} y1={startYCoord} x2={endX} y2={endYCoord}
                            stroke="#000000" strokeWidth="5.5" opacity="0.14"
                            filter="url(#yarnShadow)"
                          />
                          {/* Colored string: emerald-green if correct (matches groove), raw red if wrong! */}
                          <line 
                            x1={startX} y1={startYCoord} x2={endX} y2={endYCoord}
                            stroke={isCorrect ? "#10b981" : "#ef4444"} 
                            strokeWidth="4.5"
                            strokeLinecap="round"
                            filter={isCorrect ? "url(#correctGlow)" : "none"}
                          />
                          {/* Texture fiber line */}
                          <line 
                            x1={startX} y1={startYCoord} x2={endX} y2={endYCoord}
                            stroke={isCorrect ? "#68d391" : "#fca5a5"} 
                            strokeWidth="1" strokeDasharray="4,12" opacity="0.85"
                            strokeLinecap="round"
                          />
                        </g>
                      );
                    })}

                  </svg>

                  {/* Aesthetic stamp labels for back of wooden toy look */}
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center select-none text-center">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Självrättande Facit</span>
                    <span className="text-[9px] font-semibold text-stone-400/80 mt-1 italic">Gröna snören ligger i fas med mönstret</span>
                  </div>

                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none text-center border-t border-stone-200/50 pt-2 w-32">
                    <span className="text-[12px] font-bold font-serif italic text-stone-500">NCM Klassiker</span>
                  </div>

                </div>
              </div>

            </div>

          </div>

          {/* Celebratory absolute modal overlay when game is perfect! */}
          <AnimatePresence>
            {isOptimalSolve && isFlipped && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-x-4 md:inset-x-12 bottom-12 bg-white/95 backdrop-blur-md rounded-[2.5rem] border border-emerald-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl z-40"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                    <Award size={24} />
                  </div>
                  <div className="text-center sm:text-left">
                    <h4 className="text-sm font-black text-slate-900 leading-tight">Fantastiskt! Snottran är helt rätt!</h4>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">Dina garn-dragningar matchar baksidans facit-ränder perfekt.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-wider shadow-sm cursor-pointer"
                  >
                    Kör Igen
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

      </div>

      {/* Embedded scope 3D cardboard styles */}
      <style>{`
        .perspective-container {
          perspective: 1200px;
          width: ${boardWidth}px;
          height: ${boardHeight}px;
        }

        .snottran-card-rotator {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .snottran-card-rotator.rotated {
          transform: rotateY(180deg);
        }

        .snottran-card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          border-radius: 3rem;
        }

        .card-front {
          z-index: 2;
          transform: rotateY(0deg);
        }

        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>

    </div>
  );
};

export default SnottranLab;
