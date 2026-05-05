import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart2, 
  ChevronRight, 
  ChevronLeft,
  Download,
  RotateCcw,
  Search,
  Newspaper,
  Eye,
  EyeOff,
  AlertTriangle,
  Users,
  CheckCircle2,
  Minimize2,
  Info
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Cell,
  LabelList
} from 'recharts';
import html2canvas from 'html2canvas';

// --- Constants ---

const LUNCH_OPTIONS = [
  { id: 'good', label: 'Supergott!', color: '#22c55e', description: 'Favoritmat' },
  { id: 'okay', label: 'Helt okej', color: '#eab308', description: 'Går att äta' },
  { id: 'bad', label: 'Blä!', color: '#ef4444', description: 'Inte gott alls' }
];

type DataType = 'good' | 'okay' | 'bad';

interface VoteItem {
  id: string;
  type: DataType;
}

const HEADLINES = [
  "SKOLLUNCHEN ÄR EN KATASTROF!",
  "ELEVERNA ÄLSKAR MATEN!",
  "STAX-NYTT: MATKRIS I SKOLAN",
  "REKORDMÅNGA NÖJDA ELEVER"
];

type Difficulty = 'beginner' | 'intermediate' | 'expert';

const LEVELS = [
  { 
    id: 'beginner' as Difficulty, 
    label: 'Nybörjare', 
    icon: Search,
    color: '#22c55e',
    mission: "Gör så att skillnaden mellan rösterna ser jättestor ut genom att 'klippa' y-axeln!" 
  },
  { 
    id: 'intermediate' as Difficulty, 
    label: 'Erfaren', 
    icon: Users,
    color: '#eab308',
    mission: "Använd både y-axeln och ett litet urval för att få en viss grupp att se mindre populär ut än den är." 
  },
  { 
    id: 'expert' as Difficulty, 
    label: 'Mästare', 
    icon: Newspaper,
    color: '#ef4444',
    mission: "Skapa en vinklad skandal-nyhet! Kombinera alla verktyg för att få rubriken att se helt sann ut." 
  }
];

// --- Components ---

const StatisticsDetective: React.FC = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('beginner');
  const [phase, setPhase] = useState<1 | 2 | 3>(1); // 1: Samla, 2: Vinkla, 3: Granska
  const [votes, setVotes] = useState<VoteItem[]>([]);
  const [yAxisMin, setYAxisMin] = useState<number>(0);
  const [sampleMode, setSampleMode] = useState<'all' | 'small'>('all');
  const [activeHeadline, setActiveHeadline] = useState(HEADLINES[0]);
  const [isAuditing, setIsAuditing] = useState(false);

  // Derived Data
  const currentLevel = LEVELS.find(l => l.id === difficulty)!;
  const displayedVotes = useMemo(() => {
    if (sampleMode === 'small' && votes.length > 5) {
      return votes.filter((_, i) => i % 2 === 0).slice(0, 5);
    }
    return votes;
  }, [votes, sampleMode]);

  const counts = useMemo(() => {
    return LUNCH_OPTIONS.map(opt => ({
      name: opt.label,
      type: opt.id,
      count: displayedVotes.filter(v => v.type === opt.id).length,
      fill: opt.color
    }));
  }, [displayedVotes]);

  const sourceCounts = useMemo(() => {
    return LUNCH_OPTIONS.map(opt => ({
      name: opt.label,
      type: opt.id,
      count: votes.filter(v => v.type === opt.id).length,
      fill: opt.color
    }));
  }, [votes]);

  const total = votes.length;

  const addVote = (type: DataType) => {
    const newVote: VoteItem = {
      id: Math.random().toString(36).substr(2, 9),
      type
    };
    setVotes(prev => [...prev, newVote]);
  };

  const resetData = () => {
    setVotes([]);
    setPhase(1);
    setYAxisMin(0);
    setSampleMode('all');
    setIsAuditing(false);
  };

  const exportAsImage = async () => {
    const element = document.getElementById('headline-area');
    if (element) {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `nyhet-vinklad-${new Date().getTime()}.png`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 p-4 md:p-8 flex flex-col items-center gap-6 font-sans select-none overflow-x-hidden">
      {/* Header */}
      <header className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm relative overflow-hidden gap-4">
        <div className="absolute top-0 left-0 w-2 h-full bg-amber-400" />
        <div className="flex flex-col gap-1 pl-4">
          <div className="flex items-center gap-2">
            <Search size={14} className="text-amber-600" />
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Kritiskt tänkande</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Statistik-Detektiven</h1>
        </div>
        
        {/* Difficulty Switcher */}
        <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200">
          {LEVELS.map(level => (
            <button
              key={level.id}
              onClick={() => {
                setDifficulty(level.id);
                resetData();
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${difficulty === level.id ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
              <level.icon size={14} style={{ color: difficulty === level.id ? level.color : undefined }} />
              <span className="hidden md:inline">{level.label}</span>
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={resetData}
            className="p-3 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-2xl transition-all"
          >
            <RotateCcw size={20} />
          </button>
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Röster totalt</span>
            <span className="text-xl font-mono font-bold text-stone-900">{total}</span>
          </div>
        </div>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
        {/* LEFT: Tools */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className={`bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-xl flex flex-col transition-opacity ${phase !== 1 ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Users size={16} /> 1. Samla röster
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-8">
              {LUNCH_OPTIONS.map(opt => (
                <button
                  key={opt.id}
                  onClick={() => addVote(opt.id as any)}
                  className="flex flex-col items-center gap-2 p-4 rounded-[2rem] hover:bg-white hover:scale-105 active:scale-95 transition-all group border-2 border-transparent hover:border-stone-100 shadow-sm"
                  style={{ backgroundColor: opt.color + '15' }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-inner" style={{ backgroundColor: opt.color, color: '#fff' }}>
                    <Users size={20} />
                  </div>
                  <span className="text-[10px] font-black text-stone-600 uppercase text-center leading-tight">{opt.label}</span>
                </button>
              ))}
            </div>
            <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
               <motion.div className="h-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${Math.min((total / 12) * 100, 100)}%` }} />
            </div>
          </div>

          <div className={`bg-amber-50 rounded-[2.5rem] p-8 border border-amber-200 shadow-xl flex flex-col transition-all ${phase === 1 ? 'opacity-30 grayscale pointer-events-none' : 'scale-105 z-10'}`}>
            <h3 className="text-xs font-black text-amber-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <AlertTriangle size={16} /> 2. Vinkla sanningen
            </h3>
            <div className="space-y-8">
               <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-amber-800 uppercase">Klipp Y-axeln</span>
                    <span className="px-2 py-0.5 bg-amber-200 text-amber-900 text-[10px] font-bold rounded">Börja på: {yAxisMin}</span>
                  </div>
                  <input type="range" min="0" max={Math.max(...counts.map(c => c.count)) - 1} value={yAxisMin} onChange={(e) => setYAxisMin(parseInt(e.target.value))} className="w-full h-2 bg-amber-200 rounded-lg appearance-none cursor-pointer accent-amber-600" />
               </div>

               {(difficulty === 'intermediate' || difficulty === 'expert') && (
                 <div className="flex flex-col gap-3">
                    <span className="text-[11px] font-bold text-amber-800 uppercase">Välj urval</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setSampleMode('all')} className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${sampleMode === 'all' ? 'bg-amber-600 text-white border-amber-700 shadow-inner' : 'bg-white text-amber-600 border-amber-200 hover:border-amber-400'}`}>Hela klassen ({total})</button>
                      <button onClick={() => setSampleMode('small')} className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border-2 transition-all ${sampleMode === 'small' ? 'bg-amber-600 text-white border-amber-700 shadow-inner' : 'bg-white text-amber-600 border-amber-200 hover:border-amber-400'}`}>Bara 5 elever</button>
                    </div>
                 </div>
               )}

               {difficulty === 'expert' && (
                 <div className="flex flex-col gap-3">
                    <span className="text-[11px] font-bold text-amber-800 uppercase">Välj rubrik</span>
                    <div className="flex flex-col gap-1.5">
                      {HEADLINES.map(h => (
                        <button key={h} onClick={() => setActiveHeadline(h)} className={`text-left px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${activeHeadline === h ? 'bg-amber-900 text-white border-amber-900' : 'bg-white/50 text-amber-800 border-amber-200 hover:border-amber-400'}`}>{h}</button>
                      ))}
                    </div>
                 </div>
               )}
            </div>
          </div>

          <div className="flex gap-2">
             <button onClick={() => setPhase(prev => Math.max(prev - 1, 1) as any)} disabled={phase === 1} className="p-4 bg-white border border-stone-200 rounded-[2rem] text-stone-400 hover:text-stone-900 disabled:opacity-30 transition-all font-bold"><ChevronLeft size={24} /></button>
             <button onClick={() => { if (phase === 2) setIsAuditing(true); setPhase(prev => Math.min(prev + 1, 3) as any); }} disabled={total < 12} className={`flex-1 h-[68px] rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl ${phase === 1 ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-stone-200' : 'bg-amber-500 text-white hover:bg-amber-600 shadow-amber-200'}`}>
               {phase === 1 ? 'Vinkla nyheten' : 'Granska sanningen'} <ChevronRight size={20} />
             </button>
          </div>
        </div>

        {/* RIGHT: Visualizer */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {!isAuditing ? (
              <motion.div key="news" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="bg-white rounded-[40px] border border-stone-200 shadow-2xl flex-1 flex flex-col overflow-hidden relative min-h-[500px]" id="headline-area">
                <div className="bg-stone-900 p-4 border-b-4 border-amber-400 flex justify-between items-center">
                   <div className="flex items-center gap-3">
                      <Newspaper className="text-amber-400" size={20} />
                      <span className="text-white font-black italic tracking-tighter text-sm uppercase">Headline NEWS</span>
                   </div>
                </div>
                <div className="p-10 flex-1 flex flex-col">
                   <div className="mb-10 text-center max-w-2xl mx-auto">
                      <motion.h2 key={activeHeadline} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight leading-[1.05] italic uppercase">{activeHeadline}</motion.h2>
                   </div>
                   <div className="flex-1 bg-white relative">
                      <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={counts}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#78716c' }} />
                          <YAxis domain={[yAxisMin, (dataMax: number) => Math.max(dataMax + 1, yAxisMin + 2)]} hide />
                          <Bar dataKey="count" radius={[12, 12, 0, 0]}>
                            {counts.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            <LabelList dataKey="count" position="top" style={{ fontSize: 14, fontWeight: 900, fill: '#1c1917' }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="audit" initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-[500px]">
                <div className="bg-white rounded-[3rem] p-8 border-4 border-emerald-500 shadow-xl flex flex-col relative overflow-hidden">
                   <div className="mb-6"><h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Källan (Sanningen)</h4><h2 className="text-xl font-black text-stone-900">Alla {total} röster</h2></div>
                   <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sourceCounts} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                          <XAxis dataKey="name" hide />
                          <YAxis domain={[0, (dataMax: number) => dataMax + 2]} hide />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {sourceCounts.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            <LabelList dataKey="count" position="top" style={{ fontSize: 12, fontWeight: 800 }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
                <div className="bg-white rounded-[3rem] p-8 border-4 border-red-500 shadow-xl flex flex-col relative overflow-hidden">
                   <div className="mb-6"><h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Vinklad (Manipulationen)</h4><h2 className="text-xl font-black text-stone-900 italic">"{activeHeadline}"</h2></div>
                   <div className="flex-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={counts} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                          <XAxis dataKey="name" hide />
                          <YAxis domain={[yAxisMin, (dataMax: number) => Math.max(dataMax + 1, yAxisMin + 2)]} hide />
                          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                            {counts.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                            <LabelList dataKey="count" position="top" style={{ fontSize: 12, fontWeight: 800 }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between items-center bg-white/50 backdrop-blur-md p-6 rounded-[3rem] border border-white h-24">
             <button onClick={() => setIsAuditing(!isAuditing)} disabled={phase !== 3} className={`px-8 py-3 rounded-2xl flex items-center gap-3 transition-all font-black uppercase tracking-widest text-[11px] disabled:opacity-30 ${isAuditing ? 'bg-emerald-600 text-white shadow-lg' : 'bg-stone-900 text-white hover:bg-stone-800 shadow-xl shadow-stone-200'}`}>
                {isAuditing ? <><EyeOff size={18} /> Göm granskning</> : <><Eye size={18} /> Granska sanningen</>}
             </button>
             <button onClick={exportAsImage} className="p-3 bg-white border border-stone-200 rounded-2xl text-stone-400 hover:text-stone-900 transition-all"><Download size={24} /></button>
          </div>
        </div>
      </main>

      <div className="fixed bottom-8 left-8">
         <motion.div whileHover={{ scale: 1.05 }} className="bg-white p-4 rounded-2xl shadow-2xl border border-stone-200 max-w-xs pointer-events-auto">
            <div className="flex items-center gap-2 mb-2"><Info className="text-amber-500" size={16} /><h4 className="text-[10px] font-black text-stone-900 uppercase">Detektiv-tips:</h4></div>
            <p className="text-[10px] text-stone-500 italic leading-relaxed">
              {phase === 1 && "Samla in minst 12 röster för att börja din vinkling."}
              {phase === 2 && currentLevel.mission}
              {phase === 3 && "Klicka på 'Granska' för att jämföra din vinklade nyhet med verkligheten!"}
            </p>
         </motion.div>
      </div>
    </div>
  );
};

export default StatisticsDetective;
