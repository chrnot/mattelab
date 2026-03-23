import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  RotateCcw, 
  Trash2, 
  Grid, 
  BookOpen, 
  Scissors, 
  TrendingUp, 
  Calculator,
  Plus,
  Save,
  Info,
  Shapes
} from 'lucide-react';
import { Stage, Layer, Circle, Line, Group } from 'react-konva';
import { Phase } from '../types';

interface Point {
  x: number;
  y: number;
}

interface Band {
  id: string;
  points: number[]; // Indices of spikes
  color: string;
  isClosed: boolean;
}

interface BookkeepingEntry {
  id: string;
  thumbnail: string;
  vertices: number;
  sides: number;
  area?: number;
  perimeter?: number;
  innerSpikes?: number;
  borderSpikes?: number;
}

const COLORS = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
];

const GeoboardLab: React.FC = () => {
  const [gridSize, setGridSize] = useState(5);
  const [phase, setPhase] = useState<Phase>(Phase.MODUL_1);
  const [bands, setBands] = useState<Band[]>([]);
  const [activeBandId, setActiveBandId] = useState<string | null>(null);
  const [hoveredSpikeId, setHoveredSpikeId] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showGridLines, setShowGridLines] = useState(false);
  const [bookkeeping, setBookkeeping] = useState<BookkeepingEntry[]>([]);
  
  // Canvas settings
  const canvasSize = 500;
  const padding = 50;
  const spacing = (canvasSize - 2 * padding) / (gridSize - 1);

  const spikes = Array.from({ length: gridSize * gridSize }, (_, i) => ({
    id: i,
    x: padding + (i % gridSize) * spacing,
    y: padding + Math.floor(i / gridSize) * spacing,
  }));

  const handleAddBand = () => {
    const id = Math.random().toString(36).substr(2, 9);
    // Start with a small triangle in the middle
    const mid = Math.floor(gridSize / 2) * gridSize + Math.floor(gridSize / 2);
    const newBand: Band = {
      id,
      points: [mid, mid + 1, mid + gridSize], 
      color: COLORS[bands.length % COLORS.length],
      isClosed: true,
    };
    setBands([...bands, newBand]);
    setActiveBandId(id);
    setIsDrawing(false);
  };

  const handleStartDrawing = () => {
    setIsDrawing(true);
    setActiveBandId(null);
  };

  const handleSpikeClick = (spikeId: number) => {
    if (isDrawing) {
      const id = Math.random().toString(36).substr(2, 9);
      const newBand: Band = {
        id,
        points: [spikeId],
        color: COLORS[bands.length % COLORS.length],
        isClosed: false,
      };
      setBands([...bands, newBand]);
      setActiveBandId(id);
      setIsDrawing(false);
      return;
    }

    if (activeBandId) {
      const newBands = [...bands];
      const bIdx = newBands.findIndex(b => b.id === activeBandId);
      if (bIdx === -1) return;

      const band = newBands[bIdx];
      if (!band.isClosed) {
        // If clicking the first point, close the band
        if (band.points[0] === spikeId && band.points.length >= 3) {
          band.isClosed = true;
        } else if (!band.points.includes(spikeId)) {
          band.points.push(spikeId);
        }
        setBands(newBands);
      } else {
        // If already closed, maybe select it?
        setActiveBandId(activeBandId);
      }
    }
  };

  const handleDeleteBand = (id: string) => {
    setBands(bands.filter(b => b.id !== id));
    if (activeBandId === id) setActiveBandId(null);
  };

  const handleDeleteVertex = (bandId: string, vertexIndex: number) => {
    const newBands = [...bands];
    const bIdx = newBands.findIndex(b => b.id === bandId);
    if (bIdx === -1) return;

    if (newBands[bIdx].points.length <= 3) {
      handleDeleteBand(bandId);
      return;
    }

    newBands[bIdx].points.splice(vertexIndex, 1);
    setBands(newBands);
  };

  const handleReset = () => {
    setBands([]);
    setActiveBandId(null);
    setBookkeeping([]);
  };

  const handleBookkeep = () => {
    if (!activeBandId) return;
    const activeBand = bands.find(b => b.id === activeBandId);
    if (!activeBand) return;

    const newEntry: BookkeepingEntry = {
      id: Math.random().toString(36).substr(2, 9),
      thumbnail: '', // Placeholder
      vertices: activeBand.points.length,
      sides: activeBand.points.length, 
      area: calculateArea(activeBand),
    };
    setBookkeeping([newEntry, ...bookkeeping]);
  };

  const handlePointDragMove = (bandId: string, pointIndex: number, pos: { x: number, y: number }) => {
    // Find nearest spike for visual feedback
    const nearest = spikes.reduce((prev, curr) => {
      const distPrev = Math.hypot(prev.x - pos.x, prev.y - pos.y);
      const distCurr = Math.hypot(curr.x - pos.x, curr.y - pos.y);
      return distCurr < distPrev ? curr : prev;
    });
    
    if (Math.hypot(nearest.x - pos.x, nearest.y - pos.y) < spacing / 2) {
      setHoveredSpikeId(nearest.id);
    } else {
      setHoveredSpikeId(null);
    }
  };

  const handlePointDragEnd = (bandId: string, pointIndex: number, pos: { x: number, y: number }) => {
    setHoveredSpikeId(null);
    // Snap to nearest spike
    const nearest = spikes.reduce((prev, curr) => {
      const distPrev = Math.hypot(prev.x - pos.x, prev.y - pos.y);
      const distCurr = Math.hypot(curr.x - pos.x, curr.y - pos.y);
      return distCurr < distPrev ? curr : prev;
    });
    
    const newBands = [...bands];
    const bIdx = newBands.findIndex(b => b.id === bandId);
    if (bIdx === -1) return;

    // Update point
    newBands[bIdx].points[pointIndex] = nearest.id;
    
    // Check for "Kossa-regeln" (self-intersection) - simplified: just check for duplicate points
    const uniquePoints = new Set(newBands[bIdx].points);
    if (uniquePoints.size !== newBands[bIdx].points.length) {
      // Handle overlap if needed
    }

    setBands(newBands);
  };

  const handleSegmentDragEnd = (bandId: string, segmentIndex: number, pos: { x: number, y: number }) => {
    setHoveredSpikeId(null);
    // Add a new point to the band at the nearest spike
    const nearest = spikes.reduce((prev, curr) => {
      const distPrev = Math.hypot(prev.x - pos.x, prev.y - pos.y);
      const distCurr = Math.hypot(curr.x - pos.x, curr.y - pos.y);
      return distCurr < distPrev ? curr : prev;
    });

    const newBands = [...bands];
    const bIdx = newBands.findIndex(b => b.id === bandId);
    if (bIdx === -1) return;

    const points = [...newBands[bIdx].points];
    points.splice(segmentIndex + 1, 0, nearest.id);
    newBands[bIdx].points = points;
    setBands(newBands);
  };

  const calculateArea = (band: Band) => {
    if (!band.isClosed || band.points.length < 3) return 0;
    // Shoelace formula
    let area = 0;
    for (let i = 0; i < band.points.length; i++) {
      const p1 = spikes[band.points[i]];
      const p2 = spikes[band.points[(i + 1) % band.points.length]];
      // Convert to grid coordinates (0,0 to gridSize-1, gridSize-1)
      const x1 = (p1.x - padding) / spacing;
      const y1 = (p1.y - padding) / spacing;
      const x2 = (p2.x - padding) / spacing;
      const y2 = (p2.y - padding) / spacing;
      area += (x1 * y2) - (x2 * y1);
    }
    return Math.abs(area) / 2;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Shapes size={20} />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-stone-900 italic">Geobräde-Labbet</h1>
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-stone-400">
              <span className={phase === Phase.MODUL_1 ? 'text-amber-500' : ''}>Form</span>
              <ChevronRight size={10} />
              <span className={phase === Phase.MODUL_2 ? 'text-amber-500' : ''}>Area</span>
              <ChevronRight size={10} />
              <span className={phase === Phase.MODUL_3 ? 'text-amber-500' : ''}>Mönster</span>
              <ChevronRight size={10} />
              <span className={phase === Phase.MODUL_4 ? 'text-amber-500' : ''}>Avancerat</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-stone-100 rounded-lg p-1">
            {[5, 10].map(size => (
              <button
                key={size}
                onClick={() => { setGridSize(size); handleReset(); }}
                className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${gridSize === size ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
              >
                {size}x{size}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-stone-200" />
          <button 
            onClick={() => setShowGridLines(!showGridLines)}
            className={`p-2 rounded-lg transition-colors ${showGridLines ? 'bg-amber-100 text-amber-600' : 'hover:bg-stone-100 text-stone-400'}`}
            title="Visa rutnät"
          >
            <Grid size={20} />
          </button>
          <button 
            onClick={handleReset}
            className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 transition-colors"
            title="Rensa brädet"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Geoboard */}
          <div className="lg:col-span-8 flex flex-col items-center space-y-8">
            <div className="relative bg-white p-12 rounded-[48px] shadow-2xl border border-stone-200">
              <Stage width={canvasSize} height={canvasSize}>
                <Layer>
                  {/* Grid Lines */}
                  {showGridLines && Array.from({ length: gridSize - 1 }).map((_, i) => (
                    <React.Fragment key={i}>
                      <Line 
                        points={[padding + (i + 1) * spacing, padding, padding + (i + 1) * spacing, canvasSize - padding]}
                        stroke="#f1f1f1"
                        strokeWidth={2}
                      />
                      <Line 
                        points={[padding, padding + (i + 1) * spacing, canvasSize - padding, padding + (i + 1) * spacing]}
                        stroke="#f1f1f1"
                        strokeWidth={2}
                      />
                    </React.Fragment>
                  ))}

                  {/* Bands */}
                  {bands.map((band) => {
                    const points = band.points.flatMap(idx => [spikes[idx].x, spikes[idx].y]);
                    const area = calculateArea(band);
                    
                    return (
                      <Group key={band.id}>
                        {/* Fill for closed figures */}
                        {band.isClosed && (
                          <Line
                            points={points}
                            fill={band.color}
                            opacity={0.1}
                            closed={true}
                          />
                        )}
                        
                        {/* The Band Line */}
                        <Line
                          points={points}
                          stroke={band.color}
                          strokeWidth={12}
                          lineCap="round"
                          lineJoin="round"
                          closed={band.isClosed}
                          opacity={activeBandId === band.id ? 1 : 0.4}
                          onClick={() => {
                            setActiveBandId(band.id);
                            setIsDrawing(false);
                          }}
                          shadowColor="black"
                          shadowBlur={activeBandId === band.id ? 10 : 0}
                          shadowOpacity={0.3}
                        />

                        {/* Mid-segment handles for adding points */}
                        {band.points.map((idx, i) => {
                          const nextIdx = band.points[(i + 1) % band.points.length];
                          if (!band.isClosed && i === band.points.length - 1) return null;
                          
                          const midX = (spikes[idx].x + spikes[nextIdx].x) / 2;
                          const midY = (spikes[idx].y + spikes[nextIdx].y) / 2;
                          
                          return (
                            <Circle
                              key={`mid-${i}`}
                              x={midX}
                              y={midY}
                              radius={activeBandId === band.id ? 6 : 0}
                              fill={band.color}
                              opacity={0.6}
                              draggable
                              onDragMove={(e) => handlePointDragMove(band.id, -1, e.target.position())}
                              onDragEnd={(e) => {
                                handleSegmentDragEnd(band.id, i, e.target.position());
                                e.target.position({ x: 0, y: 0 });
                              }}
                            />
                          );
                        })}

                        {/* Vertex handles */}
                        {band.points.map((idx, i) => (
                          <Circle
                            key={`vertex-${i}`}
                            x={spikes[idx].x}
                            y={spikes[idx].y}
                            radius={activeBandId === band.id ? 10 : 6}
                            fill="white"
                            stroke={band.color}
                            strokeWidth={3}
                            draggable
                            onDragMove={(e) => handlePointDragMove(band.id, i, e.target.position())}
                            onDragEnd={(e) => {
                              handlePointDragEnd(band.id, i, e.target.position());
                              e.target.position({ x: 0, y: 0 });
                            }}
                            onDblClick={() => handleDeleteVertex(band.id, i)}
                            shadowColor="black"
                            shadowBlur={activeBandId === band.id ? 4 : 0}
                            shadowOpacity={0.2}
                          />
                        ))}
                      </Group>
                    );
                  })}

                  {/* Spikes */}
                  {spikes.map((spike) => (
                    <Group key={spike.id}>
                      {/* Hover Effect */}
                      {hoveredSpikeId === spike.id && (
                        <Circle
                          x={spike.x}
                          y={spike.y}
                          radius={12}
                          fill={activeBandId ? bands.find(b => b.id === activeBandId)?.color : '#fbbf24'}
                          opacity={0.3}
                        />
                      )}
                      <Circle
                        x={spike.x}
                        y={spike.y}
                        radius={5}
                        fill="#292524"
                        shadowColor="black"
                        shadowBlur={2}
                        shadowOffset={{ x: 1, y: 1 }}
                        shadowOpacity={0.5}
                        onClick={() => handleSpikeClick(spike.id)}
                        onMouseEnter={() => !hoveredSpikeId && setHoveredSpikeId(spike.id)}
                        onMouseLeave={() => setHoveredSpikeId(null)}
                      />
                    </Group>
                  ))}
                </Layer>
              </Stage>

              {/* Controls Overlay */}
              <div className="absolute bottom-12 right-12 flex flex-col space-y-3">
                <AnimatePresence>
                  {activeBandId && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8, x: 20 }}
                      animate={{ opacity: 1, scale: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.8, x: 20 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteBand(activeBandId)}
                      className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20"
                      title="Ta bort band"
                    >
                      <Trash2 size={20} />
                    </motion.button>
                  )}
                </AnimatePresence>
                
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleAddBand}
                  className="w-16 h-16 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-amber-500/30 transition-transform"
                  title="Lägg till färdigt band"
                >
                  <Plus size={32} />
                </motion.button>

                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleStartDrawing}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${isDrawing ? 'bg-stone-800 text-white' : 'bg-white text-stone-600 border border-stone-200'}`}
                  title="Rita eget band"
                >
                  <Scissors size={20} />
                </motion.button>
              </div>

              {/* Drawing Indicator */}
              {isDrawing && (
                <div className="absolute top-12 right-12 bg-amber-500 text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse shadow-lg">
                  Klicka på en pinne för att börja rita
                </div>
              )}

              {/* Area Display for active band */}
              {activeBandId && (
                <div className="absolute top-12 left-12 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-stone-200 shadow-sm">
                  <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Area</p>
                  <p className="text-lg font-mono font-bold text-stone-800">
                    {calculateArea(bands.find(b => b.id === activeBandId)!) || 0}
                  </p>
                </div>
              )}
            </div>

            {/* Modul Selector */}
            <div className="flex bg-white p-2 rounded-3xl border border-stone-200 shadow-lg">
              {[
                { id: Phase.MODUL_1, label: 'Form', icon: BookOpen, color: 'text-blue-500' },
                { id: Phase.MODUL_2, label: 'Area', icon: Scissors, color: 'text-red-500' },
                { id: Phase.MODUL_3, label: 'Mönster', icon: TrendingUp, color: 'text-emerald-500' },
                { id: Phase.MODUL_4, label: 'Avancerat', icon: Calculator, color: 'text-violet-500' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPhase(m.id)}
                  className={`flex items-center space-x-3 px-8 py-4 rounded-2xl transition-all ${
                    phase === m.id 
                      ? 'bg-stone-800 text-white shadow-xl scale-105' 
                      : 'text-stone-400 hover:text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <m.icon size={20} className={phase === m.id ? 'text-white' : m.color} />
                  <span className="font-bold text-xs uppercase tracking-widest">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Tools & Bookkeeping */}
          <div className="lg:col-span-4 space-y-8">
            <AnimatePresence mode="wait">
              {phase === Phase.MODUL_1 && (
                <motion.div
                  key="modul1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-8 bg-white rounded-[32px] shadow-sm border border-stone-200 space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        <BookOpen size={18} />
                      </div>
                      <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400">Bokföring</h3>
                    </div>
                  </div>
                  
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Skapa figurer och dokumentera deras egenskaper. Kan du hitta ett samband?
                  </p>

                  <button 
                    onClick={handleBookkeep}
                    disabled={!activeBandId}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    <Save size={18} />
                    <span>Bokför figur</span>
                  </button>

                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {bookkeeping.length === 0 ? (
                      <div className="py-12 flex flex-col items-center text-center space-y-3 opacity-30">
                        <div className="w-12 h-12 border-2 border-dashed border-stone-300 rounded-xl" />
                        <p className="text-[10px] uppercase font-bold tracking-widest">Inga sparade figurer</p>
                      </div>
                    ) : (
                      bookkeeping.map(entry => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={entry.id} 
                          className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center space-y-0"
                        >
                          <div className="w-12 h-12 bg-white rounded-xl border border-stone-100 flex items-center justify-center text-stone-300">
                            <Shapes size={20} />
                          </div>
                          <div className="flex-1 px-4 grid grid-cols-2 gap-3">
                            <div>
                              <p className="text-[9px] uppercase text-stone-400 font-bold mb-1">Hörn</p>
                              <input 
                                type="number" 
                                defaultValue={entry.vertices}
                                className="w-full bg-white px-2 py-1 rounded-md border border-stone-200 font-mono text-xs outline-none focus:border-blue-400"
                              />
                            </div>
                            <div>
                              <p className="text-[9px] uppercase text-stone-400 font-bold mb-1">Sidor</p>
                              <input 
                                type="number" 
                                defaultValue={entry.sides}
                                className="w-full bg-white px-2 py-1 rounded-md border border-stone-200 font-mono text-xs outline-none focus:border-blue-400"
                              />
                            </div>
                          </div>
                          <button 
                            onClick={() => setBookkeeping(bookkeeping.filter(e => e.id !== entry.id))}
                            className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {phase === Phase.MODUL_2 && (
                <motion.div
                  key="modul2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-8 bg-white rounded-[32px] shadow-sm border border-stone-200 space-y-6"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                      <Scissors size={18} />
                    </div>
                    <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400">Klipp & Klistra</h3>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Undersök hur area bevaras genom att flytta delar av en figur.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center text-center space-y-4">
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 shadow-md">
                        <Scissors size={24} />
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-red-900 font-bold uppercase tracking-widest">Interaktion</p>
                        <p className="text-[11px] text-red-700 leading-relaxed">
                          1. Skapa en parallellogram.<br/>
                          2. Dra en "klipplinje" från ett hörn.<br/>
                          3. Den avklippta triangeln blir en separat figur.<br/>
                          4. Flytta triangeln till andra sidan för att bilda en rektangel.
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 italic text-[11px] text-stone-500 text-center">
                      "Visuell feedback: När figuren bildar en perfekt rektangel lyser den upp i grönt för att visa att arean är densamma."
                    </div>
                  </div>
                </motion.div>
              )}

              {phase === Phase.MODUL_3 && (
                <motion.div
                  key="modul3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-8 bg-white rounded-[32px] shadow-sm border border-stone-200 space-y-6"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
                      <TrendingUp size={18} />
                    </div>
                    <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400">Iterationer</h3>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Halvera kvadratens area genom att rita en ny kvadrat inuti.
                  </p>
                  
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-emerald-700">Steg 0</span>
                      <span className="text-xs font-mono font-bold text-emerald-900">Area: 16</span>
                    </div>
                    <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-emerald-500" />
                    </div>
                    <button className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition-all shadow-md">
                      Iterera nästa steg
                    </button>
                  </div>
                </motion.div>
              )}

              {phase === Phase.MODUL_4 && (
                <motion.div
                  key="modul4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-8 bg-white rounded-[32px] shadow-sm border border-stone-200 space-y-6"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center text-violet-600">
                      <Calculator size={18} />
                    </div>
                    <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400">Avancerat</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 space-y-2">
                      <p className="text-[10px] font-bold uppercase text-stone-400">Mätverktyg</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-stone-600">Sidolängd:</span>
                        <span className="text-sm font-mono font-bold text-stone-900">√5 ≈ 2.24</span>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-violet-50 rounded-2xl border border-violet-100 space-y-4">
                      <p className="text-xs text-violet-900 font-bold uppercase tracking-widest text-center">Picks Formel</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <p className="text-[9px] text-violet-400 font-bold uppercase">Inre (I)</p>
                          <p className="text-lg font-mono font-bold text-violet-900">4</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-violet-400 font-bold uppercase">Rand (B)</p>
                          <p className="text-lg font-mono font-bold text-violet-900">8</p>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-violet-200 text-center">
                        <p className="text-xs font-mono font-bold text-violet-900">A = 4 + 8/2 - 1 = 7</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Card */}
            <div className="p-8 bg-stone-800 text-white rounded-[32px] shadow-xl space-y-4 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Info size={80} />
              </div>
              <div className="flex items-center space-x-2 text-amber-400 relative z-10">
                <Info size={18} />
                <h4 className="text-xs font-mono uppercase tracking-widest">Pedagogiskt tips</h4>
              </div>
              <p className="text-sm text-stone-300 leading-relaxed relative z-10">
                {phase === Phase.MODUL_1 && "Låt eleverna upptäcka att figurer med samma area kan ha olika omkrets."}
                {phase === Phase.MODUL_2 && "Saxen hjälper eleverna att förstå att area är additiv – vi kan flytta delar utan att ändra totalen."}
                {phase === Phase.MODUL_3 && "Här möter eleverna kvadratrötter för första gången på ett naturligt sätt."}
                {phase === Phase.MODUL_4 && "Picks formel är en bro mellan diskret och kontinuerlig matematik."}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GeoboardLab;
