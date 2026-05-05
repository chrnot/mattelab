import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Settings, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  Users, 
  BarChart2, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Calculator,
  Binary,
  Layout,
  RefreshCw,
  Download,
  ArrowRightLeft
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Cell,
  LabelList,
  ReferenceLine
} from 'recharts';

// --- Types & Constants ---

type ViewMode = 'producer' | 'detective';
type KLAGMode = 'concrete' | 'logical' | 'algebraic' | 'graphical';
type ChartType = 'bar' | 'line' | 'pie';

interface DataSet {
  id: string;
  label: string;
  trueValue: number;
  currentValue: number; // Used for simulation/sampling
}

const INITIAL_POPULATION = [
  { id: '1', label: 'E-sport', value: 45 },
  { id: '2', label: 'Fotboll', value: 42 },
  { id: '3', label: 'Ridning', value: 12 },
  { id: '4', label: 'Schack', value: 8 }
];

// --- Components ---

const StatisticsExaminer: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>('producer');
  const [klag, setKlag] = useState<KLAGMode>('graphical');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [sampleSize, setSampleSize] = useState(1000);
  const [yAxisMin, setYAxisMin] = useState(0);
  const [isAuditing, setIsAuditing] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // Simulation Logic: Create a sample based on the true population proportions
  const sampledData = useMemo(() => {
    return INITIAL_POPULATION.map(item => {
      // Simple binomial simulation for sampling error
      // In a real app we'd use a more robust randomizer, but for UI we simulate 'shaky' small samples
      const noise = sampleSize < 50 ? (Math.random() - 0.5) * (50 / sampleSize) * 20 : 0;
      const sampledValue = Math.max(0, item.value + noise);
      return {
        ...item,
        displayValue: parseFloat(sampledValue.toFixed(1))
      };
    });
  }, [sampleSize]);

  // Calculations for Algebra Mode
  const mean = useMemo(() => sampledData.reduce((acc, curr) => acc + curr.displayValue, 0) / sampledData.length, [sampledData]);
  const sortedValues = [...sampledData].map(d => d.displayValue).sort((a, b) => a - b);
  const median = (sortedValues[1] + sortedValues[2]) / 2; // Simple median for 4 items

  const typvarde = useMemo(() => {
    let max = -1;
    let modeLabel = '';
    sampledData.forEach(item => {
      if (item.displayValue > max) {
        max = item.displayValue;
        modeLabel = item.label;
      }
    });
    return modeLabel;
  }, [sampledData]);

  // Probability check: Confidence score (simplified for education)
  const confidence = useMemo(() => {
    if (sampleSize > 500) return { label: 'Hög', color: 'text-emerald-500', icon: CheckCircle2, percent: 99 };
    if (sampleSize > 100) return { label: 'Medel', color: 'text-amber-500', icon: AlertCircle, percent: 85 };
    return { label: 'Låg', color: 'text-red-500', icon: AlertCircle, percent: 40 };
  }, [sampleSize]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center gap-6 font-sans select-none overflow-x-hidden">
      {/* Top Navigation */}
      <header className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center bg-white p-4 md:p-6 rounded-[2.5rem] border border-slate-200 shadow-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Statistik-Granskaren</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akademisk Nivå: Åk 8–9</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-[1.8rem] border border-slate-200">
          <button 
            onClick={() => setMode('producer')}
            className={`flex items-center gap-2 px-6 py-3 rounded-[1.4rem] text-xs font-black uppercase tracking-widest transition-all ${mode === 'producer' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Settings size={16} /> Producenten
          </button>
          <button 
            onClick={() => setMode('detective')}
            className={`flex items-center gap-2 px-6 py-3 rounded-[1.4rem] text-xs font-black uppercase tracking-widest transition-all ${mode === 'detective' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Eye size={16} /> Detektiven
          </button>
        </div>

        {/* KLAG Switcher */}
        <div className="hidden lg:flex gap-1">
          {(['graphical', 'algebraic', 'logical', 'concrete'] as KLAGMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setKlag(m)}
              className={`p-3 rounded-2xl border transition-all ${klag === m ? 'bg-indigo-50 border-indigo-200 text-indigo-600 shadow-inner' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'}`}
              title={m.toUpperCase()}
            >
              {m === 'graphical' && <BarChart2 size={20} />}
              {m === 'algebraic' && <Calculator size={20} />}
              {m === 'logical' && <Binary size={20} />}
              {m === 'concrete' && <Layout size={20} />}
            </button>
          ))}
        </div>
      </header>

      <main className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[700px]">
        {/* Sidebar Controls */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <section className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-2xl space-y-8">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Settings size={14} className="text-indigo-600" /> Manipulationsterminal
              </h3>
              
              <div className="space-y-6">
                {/* Y-Axis Trim */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Trimma Y-axel</label>
                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-indigo-600">Start: {yAxisMin}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="40" step="5"
                    value={yAxisMin} onChange={(e) => setYAxisMin(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                </div>

                {/* Sample Size */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Urvalsstorlek (n)</label>
                    <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-indigo-600">n = {sampleSize}</span>
                  </div>
                  <input 
                    type="range" min="3" max="1000" step="10"
                    value={sampleSize} onChange={(e) => setSampleSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
                    <span>Instabilt</span>
                    <span>Representativt</span>
                  </div>
                </div>

                {/* Chart Type Picker */}
                <div className="space-y-3 pt-2">
                   <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Visualiseringstyp</label>
                   <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => setChartType('bar')} className={`p-3 rounded-2xl border-2 transition-all flex justify-center ${chartType === 'bar' ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}><BarChart2 size={20} /></button>
                      <button onClick={() => setChartType('line')} className={`p-3 rounded-2xl border-2 transition-all flex justify-center ${chartType === 'line' ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}><LineChartIcon size={20} /></button>
                      <button onClick={() => setChartType('pie')} className={`p-3 rounded-2xl border-2 transition-all flex justify-center ${chartType === 'pie' ? 'bg-indigo-600 border-indigo-700 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400'}`}><PieChartIcon size={20} /></button>
                   </div>
                </div>
              </div>
            </div>

            {/* Probability Engine (Detective Mode Exclusive Content or subtle hint) */}
            <div className={`p-6 rounded-[2rem] border-2 transition-all ${mode === 'detective' ? 'bg-indigo-900 border-indigo-800 text-white' : 'bg-slate-50 border-slate-100/50 grayscale opacity-40'}`}>
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                <Calculator size={14} /> Beräkningsmotor
              </h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[11px] opacity-70">Sannolikhet för korrekthet:</span>
                    <div className={`flex items-center gap-1 font-black ${confidence.color}`}>
                       <confidence.icon size={14} /> {confidence.percent}%
                    </div>
                 </div>
                 <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full ${confidence.percent > 80 ? 'bg-emerald-500' : confidence.percent > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${confidence.percent}%` }}
                    />
                 </div>
                 <p className="text-[10px] italic leading-relaxed opacity-60">
                   Vid n={sampleSize} är osäkerheten ±{(100/Math.sqrt(sampleSize)).toFixed(1)}%. Risken för s.k. "Sampling Bias" är {sampleSize < 100 ? 'kritisk' : 'hanterbar'}.
                 </p>
              </div>
            </div>
          </section>

          {/* Mission Progress */}
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp size={80} /></div>
             <h4 className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-70">Aktuellt Uppdrag</h4>
             <p className="text-sm font-bold leading-relaxed mb-4">
               Skapa ett diagram där "E-sport" ser ut att vara dubbelt så populärt som det egentligen är, utan att ändra rådatan!
             </p>
             <div className="flex items-center gap-2 text-[10px] font-black uppercase bg-white/10 w-fit px-3 py-1 rounded-full">
                Steg 1 av 3 <ArrowRightLeft size={10} />
             </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-[3rem] p-8 border border-slate-200 shadow-2xl flex-1 flex flex-col relative overflow-hidden">
            {/* Header / Meta */}
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {mode === 'producer' ? 'Resultat: Medievisning' : 'Analys: Bakom Kulisserna'}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kategori: Fritidssysselsättning</span>
                    <div className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Läge: {klag.toUpperCase()}</span>
                  </div>
               </div>
               
               <div className="flex gap-2">
                  <button onClick={() => setShowStats(!showStats)} className={`p-4 rounded-3xl transition-all ${showStats ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                    <TrendingUp size={20} />
                  </button>
                  <button onClick={() => setIsAuditing(!isAuditing)} className={`px-6 py-4 rounded-3xl font-black text-xs uppercase tracking-widest transition-all ${isAuditing ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                    {isAuditing ? 'Dölj Sanning' : 'Visa Sanning'}
                  </button>
               </div>
            </div>

            {/* Visualizer Area */}
            <div className="flex-1 flex flex-col min-h-[400px]">
               <AnimatePresence mode="wait">
                  {klag === 'graphical' && (
                    <motion.div key="graph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
                       <ResponsiveContainer width="100%" height="100%">
                         {chartType === 'bar' ? (
                            <BarChart data={sampledData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                               <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }} />
                               <YAxis domain={[yAxisMin, (dataMax: number) => Math.max(dataMax + 10, 50)]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                               
                               {/* The "Truth" Overlay */}
                               {isAuditing && (
                                 <Bar dataKey="value" fill="#94a3b8" opacity={0.2} radius={[10, 10, 0, 0]} barSize={40} />
                               )}
                               
                               <Bar dataKey="displayValue" radius={[12, 12, 0, 0]} barSize={60}>
                                  {sampledData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#4f46e5' : '#818cf8'} />
                                  ))}
                                  <LabelList dataKey="displayValue" position="top" style={{ fontSize: 14, fontWeight: 900, fill: '#1e293b' }} />
                               </Bar>

                               {showStats && <ReferenceLine y={mean} stroke="#f43f5e" strokeDasharray="5 5" label={{ position: 'right', value: `Medel: ${mean.toFixed(1)}`, fill: '#f43f5e', fontSize: 10, fontWeight: 800 }} />}
                               {showStats && <ReferenceLine y={median} stroke="#f59e0b" strokeDasharray="5 5" label={{ position: 'left', value: `Median: ${median.toFixed(1)}`, fill: '#f59e0b', fontSize: 10, fontWeight: 800 }} />}
                            </BarChart>
                         ) : chartType === 'line' ? (
                            <LineChart data={sampledData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                               <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }} />
                               <YAxis domain={[yAxisMin, (dataMax: number) => Math.max(dataMax + 10, 50)]} />
                               <Line type="monotone" dataKey="displayValue" stroke="#4f46e5" strokeWidth={5} dot={{ r: 8, fill: '#4f46e5', strokeWidth: 0 }} />
                               {isAuditing && <Line type="monotone" dataKey="value" stroke="#94a3b8" strokeDasharray="10 10" strokeWidth={2} dot={false} />}
                            </LineChart>
                         ) : (
                            <PieChart>
                               <Pie data={sampledData} dataKey="displayValue" nameKey="label" cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5}>
                                  {sampledData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={['#4f46e5', '#6366f1', '#818cf8', '#a5b4fc'][index % 4]} />
                                  ))}
                               </Pie>
                            </PieChart>
                         )}
                       </ResponsiveContainer>
                    </motion.div>
                  )}

                  {klag === 'algebraic' && (
                    <motion.div key="algebra" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center items-center gap-8">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
                          <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center">
                             <span className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest text-center">Medelvärde (μ)</span>
                             <div className="text-3xl font-black text-indigo-600">{(mean).toFixed(1)}</div>
                             <div className="mt-2 text-[9px] font-mono text-slate-400 uppercase tracking-tighter">Σx / n</div>
                          </div>
                          <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center">
                             <span className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest text-center">Median (M)</span>
                             <div className="text-3xl font-black text-amber-500">{median.toFixed(1)}</div>
                             <div className="mt-2 text-[9px] font-mono text-slate-400 uppercase tracking-tighter">Mitten</div>
                          </div>
                          <div className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex flex-col items-center">
                             <span className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest text-center">Typvärde (T)</span>
                             <div className="text-2xl font-black text-emerald-500 truncate w-full text-center">{typvarde}</div>
                             <div className="mt-2 text-[9px] font-mono text-slate-400 uppercase tracking-tighter">Vanligast</div>
                          </div>
                       </div>
                       <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-3xl max-w-lg w-full">
                          <h5 className="text-xs font-black text-indigo-900 mb-2 uppercase">Lgr22 Koppling:</h5>
                          <p className="text-[11px] leading-relaxed text-indigo-700 font-medium">
                            I årskurs 8-9 ska vi förstå hur medelvärdet kan vara missvisande om vi har extremvärden. Med n={sampleSize} ser vi att variationen är {(100/Math.sqrt(sampleSize)).toFixed(1)}%.
                          </p>
                       </div>
                    </motion.div>
                  )}

                  {klag === 'concrete' && (
                     <motion.div key="concrete" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {sampledData.map((item, idx) => (
                              <div key={idx} className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
                                 <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                       <Users size={18} className="text-indigo-600" />
                                    </div>
                                    <div>
                                       <h4 className="text-xs font-black text-slate-900 uppercase">{item.label}</h4>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase">Representerad grupp</p>
                                    </div>
                                 </div>
                                 <div className="flex flex-col items-end">
                                    <span className="text-lg font-black text-indigo-600">{((item.displayValue / sampledData.reduce((a,b) => a+b.displayValue, 0)) * sampleSize).toFixed(0)}</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Individer</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                        <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] text-white">
                           <div className="flex items-center gap-3 mb-4">
                              <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center"><Binary size={16} /></div>
                              <h4 className="text-xs font-black uppercase">Rådata-logg (n={sampleSize})</h4>
                           </div>
                           <div className="grid grid-cols-5 md:grid-cols-10 gap-1 opacity-40">
                              {Array.from({ length: Math.min(sampleSize, 50) }).map((_, i) => (
                                 <div key={i} className="aspect-square bg-white/20 rounded-sm" />
                              ))}
                              {sampleSize > 50 && <div className="flex items-center text-[10px] text-slate-500 pl-2">...</div>}
                           </div>
                           <p className="mt-4 text-[10px] italic text-slate-400 leading-relaxed">
                              Här visualiseras varje röst som en konkret punkt. Vid stora urval (n={sampleSize}) blir mönstret tydligare, men vid små urval ser vi slumpens stora inverkan.
                           </p>
                        </div>
                     </motion.div>
                  )}

                  {klag === 'logical' && (
                    <motion.div key="logic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-8">
                       <div className="bg-slate-900 text-white p-8 rounded-[3rem] font-mono text-xs leading-relaxed">
                          <p className="text-emerald-400 mb-2">// Analys av skalmanipulation</p>
                          <p><span className="text-indigo-400">const</span> yAxisMin = <span className="text-amber-400">{yAxisMin}</span>;</p>
                          <p><span className="text-indigo-400">const</span> visualDifference = (max - min) / (max - yAxisMin);</p>
                          <p className="text-slate-500 mt-4">/* Genom att öka yAxisMin förstärker vi det visuella avståndet mellan {sampledData[0].label} och {sampledData[2].label} med en faktor på <span className="text-white font-bold">{((sampledData[0].displayValue - sampledData[2].displayValue) / (sampledData[0].displayValue - yAxisMin) * 10).toFixed(1)}x</span> i det lokala koordinatsystemet. */</p>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                             <h4 className="flex items-center gap-2 text-xs font-black text-amber-900 mb-2 uppercase"><AlertCircle size={14} /> Logisk Fälla</h4>
                             <p className="text-[11px] text-amber-800 leading-relaxed font-medium">Om y-axeln inte börjar på 0, ser nollskillnad ut som en avgrund. Detta kallas för "Truncated Y-Axis".</p>
                          </div>
                          <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
                             <h4 className="flex items-center gap-2 text-xs font-black text-emerald-900 mb-2 uppercase"><CheckCircle2 size={14} /> Detektiven Tipsar</h4>
                             <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">Kolla alltid på axelvärdena innan du läser stapelns höjd. Verkligheten finns i siffrorna, inte i toppen av stapeln.</p>
                          </div>
                       </div>
                    </motion.div>
                  )}
               </AnimatePresence>
            </div>
          </div>

          {/* Action Footer */}
          <footer className="bg-white/60 backdrop-blur-md p-6 rounded-[3rem] border border-white flex justify-between items-center shadow-xl">
             <div className="flex items-center gap-6">
                <div className="flex flex-col">
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Data-status</span>
                   <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-xs font-black text-slate-700">Live-simulering aktiv</span>
                   </div>
                </div>
                <div className="h-10 w-[1px] bg-slate-200" />
                <button className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase hover:text-indigo-600 transition-all">
                   <RefreshCw size={14} /> Slumpa ny data
                </button>
             </div>
             
             <div className="flex gap-3">
                <button onClick={() => window.print()} className="p-4 bg-white border border-slate-200 rounded-3xl text-slate-500 hover:text-indigo-600 transition-all shadow-sm">
                   <Download size={20} />
                </button>
                <button className="px-10 py-4 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.1em] shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all">
                   Exportera Rapport
                </button>
             </div>
          </footer>
        </div>
      </main>

      {/* Accessibility / Tooltip Layer */}
      <div className="fixed bottom-10 right-10 z-50">
         <motion.button 
           whileHover={{ scale: 1.1 }}
           whileTap={{ scale: 0.9 }}
           className="w-14 h-14 bg-indigo-900 text-white rounded-full flex items-center justify-center shadow-2xl"
         >
           <HelpCircle size={24} />
         </motion.button>
      </div>
    </div>
  );
};

export default StatisticsExaminer;
