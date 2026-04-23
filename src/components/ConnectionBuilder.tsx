import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Table as TableIcon, 
  LineChart, 
  Sigma, 
  Layout, 
  RefreshCcw,
  HelpingHand,
  CheckCircle2,
  Circle,
  Triangle,
  Square,
  Pentagon,
  Hexagon
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart as ReLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';

// --- Types ---

type Phase = 1 | 2 | 3;

interface DataPoint {
  n: number;
  sum: number;
  isPrediction?: boolean;
}

// --- Components ---

const ConnectionBuilder: React.FC = () => {
  const [phase, setPhase] = useState<Phase>(1);
  const [sides, setSides] = useState<number>(3);
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([
    { n: 3, sum: 180 }
  ]);
  const [activeTab, setActiveTab] = useState<'table' | 'graph' | 'formula'>('table');
  const [prediction, setPrediction] = useState<{[key: number]: string}>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [isFormulaComplete, setIsFormulaComplete] = useState(false);

  // Derived values
  const angleSum = (sides - 2) * 180;
  
  // Progression Logic
  useEffect(() => {
    if (phase === 1 && !dataPoints.find(d => d.n === sides)) {
        // Automatically add observed points in phase 1
        setDataPoints(prev => {
            if (prev.find(p => p.n === sides)) return prev;
            return [...prev, { n: sides, sum: angleSum }].sort((a, b) => a.n - b.n);
        });
    }
  }, [sides, phase, angleSum, dataPoints]);

  const handleNextPhase = () => {
    if (phase < 3) setPhase((p) => (p + 1) as Phase);
  };

  const handlePrevPhase = () => {
    if (phase > 1) setPhase((p) => (p - 1) as Phase);
  };

  const handleReset = () => {
    setSides(3);
    setPhase(1);
    setDataPoints([{ n: 3, sum: 180 }]);
    setPrediction({});
    setShowExplanation(false);
    setIsFormulaComplete(false);
    setActiveTab('table');
  };

  // --- Sub-components ---

  const PolygonSandbox = () => {
    const radius = 120;
    const center = 150;
    
    // Generate vertices for a regular polygon
    const vertices = useMemo(() => {
      const points: [number, number][] = [];
      for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
        points.push([
          center + radius * Math.cos(angle),
          center + radius * Math.sin(angle)
        ]);
      }
      return points;
    }, [sides]);

    // Triangle split lines for Phase 3
    const splitLines = useMemo(() => {
        if (phase !== 3 || !showExplanation) return [];
        const lines: [number, number, number, number][] = [];
        const startPoint = vertices[0];
        // Connect vertex 0 to all other vertices except its neighbors
        for (let i = 2; i < sides - 1; i++) {
            lines.push([startPoint[0], startPoint[1], vertices[i][0], vertices[i][1]]);
        }
        return lines;
    }, [phase, showExplanation, vertices, sides]);

    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-50/50 rounded-2xl border border-dashed border-gray-300 overflow-hidden p-8">
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-gray-500">Konkret Yta</span>
          <h3 className="text-lg font-medium text-gray-900">{sides} hörn</h3>
        </div>

        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:text-red-600 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm group"
          >
            <RefreshCcw className="w-3.5 h-3.5 transition-transform group-hover:rotate-180 duration-500" />
            Nollställ
          </button>
        </div>

        <svg viewBox="0 0 300 300" className="w-full max-w-[400px] h-auto drop-shadow-xl">
          {/* Main Polygon */}
          <motion.path
            d={`M ${vertices.map(p => `${p[0]},${p[1]}`).join(' L ')} Z`}
            fill="rgba(59, 130, 246, 0.1)"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinejoin="round"
            initial={false}
            animate={{ d: `M ${vertices.map(p => `${p[0]},${p[1]}`).join(' L ')} Z` }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          />

          {/* Vertices */}
          {vertices.map((p, i) => (
            <motion.circle
              key={i}
              cx={p[0]}
              cy={p[1]}
              r="6"
              fill="#fff"
              stroke="#3b82f6"
              strokeWidth="2"
              initial={false}
              animate={{ cx: p[0], cy: p[1] }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            />
          ))}

          {/* Triangle Split (Phase 3) */}
          <AnimatePresence>
            {splitLines.map((line, i) => (
              <motion.line
                key={i}
                x1={line[0]}
                y1={line[1]}
                x2={line[2]}
                y2={line[3]}
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="4 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              />
            ))}
          </AnimatePresence>
        </svg>

        <div className="mt-8 flex items-center gap-4">
          <button 
            onClick={() => setSides(prev => Math.max(3, prev - 1))}
            className="p-2 rounded-full bg-white shadow-sm border hover:bg-gray-50 transition-colors"
            disabled={sides <= 3}
          >
            <RefreshCcw className="w-4 h-4 text-gray-400 rotate-180" />
          </button>
          
          <div className="flex gap-1 px-4 py-2 bg-white rounded-full shadow-inner border border-gray-100">
            {[3, 4, 5, 6, 7, 8].map(n => (
              <button
                key={n}
                onClick={() => setSides(n)}
                disabled={phase === 2 && n > 6 && !prediction[n]}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  sides === n 
                    ? 'bg-blue-600 text-white scale-110 shadow-lg' 
                    : n > 6 && phase === 1 ? 'opacity-30' : 'text-gray-400 hover:text-blue-500'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setSides(prev => Math.min(8, prev + 1))}
            className="p-2 rounded-full bg-white shadow-sm border hover:bg-gray-50 transition-colors"
            disabled={sides >= 8 || (phase === 2 && sides >= 6)}
          >
            <RefreshCcw className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {phase === 3 && (
            <div className="mt-4">
                <button 
                    onClick={() => setShowExplanation(!showExplanation)}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                        showExplanation ? 'bg-red-500 text-white ring-4 ring-red-100' : 'bg-white text-blue-600 border'
                    }`}
                >
                    {showExplanation ? 'Dölj förklaring' : 'Visa Triangel-bevis'}
                </button>
            </div>
        )}
      </div>
    );
  };

  const Sidebar = () => {
    return (
      <div className="w-full flex flex-col bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden h-full">
        {/* Tabs */}
        <div className="flex items-center border-bottom bg-gray-50 p-1">
          <button 
            onClick={() => setActiveTab('table')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
          >
            <TableIcon className="w-4 h-4" />
            Tabell
          </button>
          <button 
            onClick={() => setActiveTab('graph')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'graph' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
          >
            <LineChart className="w-4 h-4" />
            Graf
          </button>
          <button 
            onClick={() => setActiveTab('formula')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'formula' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
          >
            <Sigma className="w-4 h-4" />
            Formel
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'table' && (
              <motion.div 
                key="table"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-2 text-center border-b pb-2">
                  <span className="text-[10px] font-mono uppercase text-gray-400">Antal hörn (n)</span>
                  <span className="text-[10px] font-mono uppercase text-gray-400">Vinkelsumma (S)</span>
                </div>
                {[3, 4, 5, 6, 7, 8].map(n => {
                  const data = dataPoints.find(d => d.n === n);
                  const isPredicting = phase === 2 && n > 6 && !data;
                  
                  return (
                    <div key={n} className={`grid grid-cols-2 gap-2 py-3 px-4 rounded-xl items-center transition-all ${sides === n ? 'bg-blue-50 border-blue-100' : ''}`}>
                      <span className="font-mono text-lg font-bold text-gray-700">{n}</span>
                      {data ? (
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-lg font-bold text-blue-600">{data.sum}°</span>
                            {data.isPrediction && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                        </div>
                      ) : isPredicting ? (
                        <div className="flex gap-1">
                          <input 
                            type="number"
                            placeholder="?"
                            className="w-full bg-yellow-50 border border-yellow-200 rounded-lg px-2 py-1 text-center font-mono focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            value={prediction[n] || ''}
                            onChange={(e) => setPrediction(prev => ({...prev, [n]: e.target.value}))}
                          />
                          <button 
                            onClick={() => {
                                if (parseInt(prediction[n]) === (n - 2) * 180) {
                                    setDataPoints(prev => [...prev, { n, sum: (n - 2) * 180, isPrediction: true }].sort((a,b) => a.n - b.n));
                                } else {
                                    alert('Nära! Testa att rita mönstret eller titta på ökningen från 6 hörn.');
                                }
                            }}
                            className="bg-yellow-400 text-white rounded-lg p-1"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-300 font-mono italic">Väntar...</span>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'graph' && (
              <motion.div 
                key="graph"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="h-full min-h-[300px]"
              >
                <ResponsiveContainer width="100%" height={300}>
                  <ReLineChart data={dataPoints}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis 
                      dataKey="n" 
                      domain={[3, 8]} 
                      type="number" 
                      label={{ value: 'Hörn', position: 'insideBottom', offset: -10, fontSize: 10 }}
                    />
                    <YAxis 
                      label={{ value: 'Grader', angle: -90, position: 'insideLeft', fontSize: 10 }}
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Line 
                        type="monotone" 
                        dataKey="sum" 
                        stroke="#3b82f6" 
                        strokeWidth={3} 
                        dot={{ r: 6, fill: '#fff', stroke: '#3b82f6', strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: '#3b82f6' }}
                    />
                  </ReLineChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {activeTab === 'formula' && (
              <motion.div 
                key="formula"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8 flex flex-col items-center py-8"
              >
                <div className="text-center space-y-2">
                    <h4 className="text-sm font-bold text-gray-500 uppercase">Formel-pusslet</h4>
                    <p className="text-xs text-gray-400">Bygg sambandet för S</p>
                </div>

                <div className="bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-300 w-full flex flex-col items-center gap-6">
                    <div className="flex items-center gap-3 font-mono text-3xl font-bold">
                        <span className="text-blue-600">S</span>
                        <span>=</span>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-inner border min-w-[120px] justify-center">
                            {isFormulaComplete ? (
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-green-600">(n - 2)</motion.span>
                            ) : (
                                <span className="text-gray-200">? - ?</span>
                            )}
                        </div>
                        <span>×</span>
                        <span className="text-orange-500">180°</span>
                    </div>

                    {!isFormulaComplete && (
                        <div className="flex gap-2">
                            {['(n - 1)', '(n - 2)', '(n - 3)'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => {
                                        if (f === '(n - 2)') setIsFormulaComplete(true);
                                    }}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm"
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {phase === 3 && isFormulaComplete && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-blue-50 p-4 rounded-xl flex gap-3 items-start"
                    >
                        <HelpingHand className="w-5 h-5 text-blue-500 shrink-0 mt-1" />
                        <div>
                            <p className="text-sm font-medium text-blue-900 leading-relaxed">
                                Ser du mönstret? Varje polygon kan delas in i <span className="underline font-bold">antal hörn - 2</span> trianglar. Varje triangel är 180°.
                            </p>
                        </div>
                    </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
            <div className={`p-4 rounded-xl flex items-center gap-3 ${phase === 3 ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                <div className="font-mono font-bold">
                    S = {angleSum}°
                </div>
            </div>
            
            <button 
                onClick={() => {
                    alert(`${sides} hörn ger ${angleSum}°. Vill du veta varför? Klicka på 'Formel' fliken!`);
                }}
                className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-colors"
            >
                <HelpingHand className="w-4 h-4" />
                Ledtråd
            </button>
        </div>
      </div>
    );
  };

  const Timeline = () => {
    const steps = [
      { id: 1, label: 'Det Konkreta', icon: <Circle className="w-4 h-4" color="#3b82f6" /> },
      { id: 2, label: 'Mönsterspaning', icon: <RefreshCcw className="w-4 h-4" color="#eab308" /> },
      { id: 3, label: 'Algebraiskt Språng', icon: <Sigma className="w-4 h-4" color="#ef4444" /> }
    ];

    return (
      <div className="w-full max-w-4xl px-8 py-6 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white flex justify-between items-center">
        <div className="flex gap-8 items-center">
          {steps.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${phase >= s.id ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-400'}`}>
                  {phase > s.id ? <CheckCircle2 className="w-6 h-6" /> : s.icon}
                </div>
                <div className="flex flex-col">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${phase === s.id ? 'text-blue-600' : 'text-gray-400'}`}>
                        Fas {s.id}
                    </span>
                    <span className={`text-[13px] font-bold ${phase === s.id ? 'text-gray-900' : 'text-gray-400'}`}>
                        {s.label}
                    </span>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-8 h-[2px] rounded-full ${phase > s.id ? 'bg-blue-600' : 'bg-gray-100'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="flex gap-2">
            <button 
                onClick={handlePrevPhase}
                disabled={phase === 1}
                className="p-3 rounded-full hover:bg-gray-50 border disabled:opacity-30 transition-all"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
                onClick={handleNextPhase}
                disabled={phase === 3}
                className="flex items-center gap-2 pl-6 pr-4 py-3 bg-blue-600 text-white rounded-full font-bold text-sm shadow-xl hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-30"
            >
                Nästa steg
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 flex flex-col items-center gap-8 font-sans">
      <header className="w-full max-w-6xl flex justify-between items-center">
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-md">2. Algebra</span>
                <span className="px-2 py-1 bg-gray-200 text-gray-600 text-[10px] font-bold uppercase rounded-md">Problemlösning</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Sambands-Byggaren</h1>
        </div>
        <div className="bg-white px-4 py-2 rounded-full border shadow-sm flex items-center gap-3">
            <HelpingHand className="w-5 h-5 text-blue-500" />
            <p className="text-xs font-medium text-gray-500 max-w-[200px]">Utforska polygoners vinkelsumma genom att bygga och mäta.</p>
        </div>
      </header>

      <main className="w-full max-w-6xl h-[600px] grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-7 h-full">
          <PolygonSandbox />
        </div>
        <div className="md:col-span-5 h-full">
          <Sidebar />
        </div>
      </main>

      <footer className="w-full flex justify-center sticky bottom-8">
        <Timeline />
      </footer>
    </div>
  );
};

export default ConnectionBuilder;
