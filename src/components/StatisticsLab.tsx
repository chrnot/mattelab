import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart2, 
  PieChart as PieChartIcon, 
  RotateCcw, 
  Download,
  Info,
  CheckCircle2,
  Apple,
  TrendingUp,
  ColumnsIcon,
  Layout
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Cell,
  LabelList,
  PieChart,
  Pie
} from 'recharts';
import html2canvas from 'html2canvas';

// --- Constants ---

const FRUITS = [
  { id: 'apple', label: 'Äpple', color: '#ef4444', icon: Apple },
  { id: 'banana', label: 'Banan', color: '#eab308', icon: Apple },
  { id: 'pear', label: 'Päron', color: '#22c55e', icon: Apple },
  { id: 'grape', label: 'Vindruva', color: '#8b5cf6', icon: Apple }
];

type FruitType = 'apple' | 'banana' | 'pear' | 'grape';

interface DataItem {
  id: string;
  type: FruitType;
}

// --- Components ---

const StatisticsLab: React.FC = () => {
  const [items, setItems] = useState<DataItem[]>([]);
  const [chartType, setChartType] = useState<'column' | 'bar' | 'pie'>('column');
  const [showMean, setShowMean] = useState(false);
  const [showMedian, setShowMedian] = useState(false);
  const [userMeanLine, setUserMeanLine] = useState<number | null>(null);

  // Stats Logic
  const counts = useMemo(() => {
    return FRUITS.map(f => ({
      name: f.label,
      count: items.filter(item => item.type === f.id).length,
      fill: f.color
    }));
  }, [items]);

  const total = items.length;
  const mean = total > 0 ? total / FRUITS.length : 0;
  
  const chartData = useMemo(() => {
    let data = [...counts];
    if (showMedian && (chartType === 'column' || chartType === 'bar')) {
      data.sort((a, b) => a.count - b.count);
    }
    return data;
  }, [counts, showMedian, chartType]);

  const medianValue = useMemo(() => {
    if (total === 0) return 0;
    const sorted = counts.map(c => c.count).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }, [counts, total]);

  const isCorrectMean = userMeanLine !== null && Math.abs(userMeanLine - mean) < 0.2;

  const addItem = (type: FruitType) => {
    const newItem = { id: Math.random().toString(36).substr(2, 9), type };
    setItems(prev => [...prev, newItem]);
  };

  const resetData = () => {
    setItems([]);
    setUserMeanLine(null);
    setShowMean(false);
    setShowMedian(false);
  };

  const exportAsImage = async () => {
    const element = document.getElementById('chart-area');
    if (element) {
      const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2 });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `statistik-labbet-${new Date().getTime()}.png`;
      link.click();
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-4 md:p-8 flex flex-col items-center gap-8 font-sans overflow-x-hidden">
      <header className="w-full max-w-6xl flex justify-between items-center bg-white p-6 rounded-[30px] border border-stone-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-emerald-500" />
        <div className="flex flex-col gap-1 pl-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Basics & Lägesmått</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 tracking-tight">Statistik-Labbet</h1>
        </div>
        <button onClick={resetData} className="p-3 text-stone-400 hover:text-stone-900 hover:bg-stone-50 rounded-2xl transition-all"><RotateCcw size={20} /></button>
      </header>

      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[600px]">
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-[40px] p-8 border border-stone-200 shadow-xl">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-[0.2em] mb-6">Skapa Data</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {FRUITS.map(f => (
                <button key={f.id} onClick={() => addItem(f.id as any)} className="flex items-center gap-3 p-4 rounded-3xl bg-stone-50 hover:bg-white hover:scale-105 transition-all border-2 border-transparent hover:border-stone-100">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: f.color + '20', color: f.color }}><Apple size={20} /></div>
                  <span className="text-xs font-black text-stone-600 uppercase">{f.label}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-between items-end p-4 bg-stone-50 rounded-3xl">
              <div className="flex flex-col"><span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Totalt antal</span><span className="text-2xl font-mono font-bold text-stone-900">{total}</span></div>
            </div>
          </div>

          <div className="bg-emerald-900 rounded-[40px] p-8 border border-emerald-800 shadow-xl text-white">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-[0.2em] mb-6">Analys-verktyg</h3>
            <div className="flex flex-col gap-4">
              <button onClick={() => setShowMean(!showMean)} className={`group relative w-full p-4 rounded-3xl flex items-center justify-between transition-all ${showMean ? 'bg-emerald-500 shadow-lg text-white' : 'bg-emerald-800 text-emerald-400 hover:bg-emerald-700'}`}>
                <div className="flex items-center gap-3"><TrendingUp size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Visa Medelvärde</span></div>
                {showMean && <CheckCircle2 size={16} />}
              </button>
              <button onClick={() => setShowMedian(!showMedian)} className={`w-full p-4 rounded-3xl flex items-center justify-between transition-all ${showMedian ? 'bg-amber-500 shadow-lg text-white' : 'bg-emerald-800 text-emerald-400 hover:bg-emerald-700'}`}>
                <div className="flex items-center gap-3"><ColumnsIcon size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Visa Median</span></div>
                {showMedian && <CheckCircle2 size={16} />}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-[40px] p-8 border border-stone-200 shadow-2xl flex-1 flex flex-col overflow-hidden relative" id="chart-area">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><BarChart2 size={24} /></div><div><h2 className="text-xl font-black text-stone-900 tracking-tight">Visualisering</h2><p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Ditt diagram uppdateras live</p></div></div>
              <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl">
                <button onClick={() => setChartType('column')} className={`p-2 rounded-xl transition-all ${chartType === 'column' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-400'}`}><ColumnsIcon size={18} /></button>
                <button onClick={() => setChartType('bar')} className={`p-2 rounded-xl transition-all ${chartType === 'bar' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-400'}`}><Layout size={18} className="rotate-90" /></button>
                <button onClick={() => setChartType('pie')} className={`p-2 rounded-xl transition-all ${chartType === 'pie' ? 'bg-white text-emerald-600 shadow-sm' : 'text-stone-400'}`}><PieChartIcon size={18} /></button>
              </div>
            </div>

            <div className="flex-1 min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'pie' ? (
                  <PieChart><Pie data={chartData} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="count">{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}</Pie></PieChart>
                ) : (
                  <BarChart data={chartData} layout={chartType === 'bar' ? 'vertical' : 'horizontal'}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    {chartType === 'bar' ? <><XAxis type="number" hide /><YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} /></> : <><XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} /><YAxis hide /></>}
                    <Bar dataKey="count" radius={8}>
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                      <LabelList dataKey="count" position={chartType === 'bar' ? 'right' : 'top'} />
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {showMean && chartType === 'column' && (
              <div className="absolute inset-0 pointer-events-none mt-[20px] mb-[40px] ml-[80px] mr-[30px]">
                <div className="absolute left-0 right-0 h-[2px] bg-stone-900/10 border-b border-dashed border-stone-500 z-0" style={{ bottom: `${(mean / (chartData.reduce((max, c) => Math.max(max, c.count), 0) + 1)) * 100}%` }}>
                  <span className="absolute right-0 -top-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Medel: {mean.toFixed(1)}</span>
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-end gap-2">
              <button onClick={exportAsImage} className="p-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-400 hover:text-stone-900 transition-all"><Download size={20} /></button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StatisticsLab;
