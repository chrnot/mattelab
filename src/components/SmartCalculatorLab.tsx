import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  ChevronRight, 
  RotateCcw, 
  Lightbulb, 
  ArrowRight,
  HelpCircle,
  AlertCircle,
  Layers,
  Search,
  Infinity as InfinityIcon
} from 'lucide-react';

interface PlaceValueColumn {
  id: string;
  label: string;
  value: string;
  color: string;
}

const COLUMNS = [
  { id: 'hundreds', label: 'Hundratal', color: 'bg-blue-100 text-blue-800' },
  { id: 'tens', label: 'Tiotal', color: 'bg-blue-100 text-blue-800' },
  { id: 'ones', label: 'Ental', color: 'bg-blue-100 text-blue-800' },
  { id: 'decimal', label: ',', color: 'bg-red-500 text-white font-bold text-2xl' },
  { id: 'tenths', label: 'Tiondelar', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'hundredths', label: 'Hundradelar', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'thousandths', label: 'Tusendelar', color: 'bg-emerald-100 text-emerald-800' },
];

const SmartCalculatorLab: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [activeModule, setActiveModule] = useState<'free' | 'detective' | 'infinity'>('free');
  const [comparison, setComparison] = useState({ a: '', b: '' });
  const [isBråk, setIsBråk] = useState(false);

  // For animation tracking
  const [prevValue, setPrevValue] = useState('0');

  const handleNumber = (num: string) => {
    setError(null);
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleComma = () => {
    if (display.includes('.')) {
      setError('Ett tal kan bara ha ett kommatecken');
      return;
    }
    setDisplay(display + '.');
  };

  const handleClear = () => {
    setDisplay('0');
    setError(null);
    setComparison({ a: '', b: '' });
    setIsBråk(false);
  };

  const handleOperation = (op: string) => {
    setDisplay(display + ' ' + op + ' ');
  };

  const handleEqual = () => {
    try {
      const result = eval(display);
      const formattedResult = Number(result.toFixed(10)).toString();
      setPrevValue(display);
      setDisplay(formattedResult);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const getPlaceValues = (val: string) => {
    const parts = val.split('.');
    const integerPart = parts[0] || '0';
    const decimalPart = parts[1] || '';

    // Pad integer part to 3 digits
    const paddedInt = integerPart.padStart(3, ' ');
    // Pad decimal part to 3 digits
    const paddedDec = decimalPart.padEnd(3, ' ');

    return {
      hundreds: paddedInt[paddedInt.length - 3] === ' ' ? '' : paddedInt[paddedInt.length - 3],
      tens: paddedInt[paddedInt.length - 2] === ' ' ? '' : paddedInt[paddedInt.length - 2],
      ones: paddedInt[paddedInt.length - 1] === ' ' ? '' : paddedInt[paddedInt.length - 1],
      tenths: paddedDec[0] === ' ' ? '' : paddedDec[0],
      hundredths: paddedDec[1] === ' ' ? '' : paddedDec[1],
      thousandths: paddedDec[2] === ' ' ? '' : paddedDec[2],
    };
  };

  const values = getPlaceValues(display);

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Layers size={20} />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-stone-900 italic">Den Smarta Räknaren</h1>
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-stone-400">
              <span>Taluppfattning</span>
              <ChevronRight size={10} />
              <span className="text-amber-500">Platsvärdes-Visualisering</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex bg-stone-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveModule('free')}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeModule === 'free' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Fri utforskning
            </button>
            <button 
              onClick={() => setActiveModule('detective')}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeModule === 'detective' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Tal-Detektiven
            </button>
            <button 
              onClick={() => setActiveModule('infinity')}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeModule === 'infinity' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
            >
              Operation Oändlighet
            </button>
          </div>
          <button 
            onClick={handleClear}
            className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 transition-colors"
            title="Nollställ"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-8 flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
          
          {/* Left Side: Classic Calculator */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center">
            <div className="bg-stone-900 p-8 rounded-[48px] shadow-2xl border-4 border-stone-800 w-full max-w-sm relative">
              {/* Display */}
              <div className="bg-stone-800 rounded-2xl p-6 mb-8 text-right overflow-hidden border border-stone-700 shadow-inner relative">
                <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-1">Smart Calc v2.0</div>
                <div className="text-4xl font-mono text-amber-400 truncate tracking-tighter">
                  {display.replace(/\./g, ',')}
                </div>
                
                {/* Error Bubble */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute top-2 left-2 right-2 bg-red-500 text-white text-[10px] font-bold p-2 rounded-lg flex items-center space-x-2 shadow-lg z-20"
                    >
                      <AlertCircle size={14} />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-4 gap-3">
                <button onClick={handleClear} className="col-span-2 p-4 bg-stone-700 text-stone-200 rounded-2xl font-bold hover:bg-stone-600 active:scale-95 transition-all">AC</button>
                <button onClick={() => handleOperation('/')} className="p-4 bg-stone-800 text-amber-500 rounded-2xl font-bold hover:bg-stone-700 active:scale-95 transition-all">÷</button>
                <button onClick={() => handleOperation('*')} className="p-4 bg-stone-800 text-amber-500 rounded-2xl font-bold hover:bg-stone-700 active:scale-95 transition-all">×</button>

                {[7, 8, 9].map(n => (
                  <button key={n} onClick={() => handleNumber(n.toString())} className="p-4 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-700 active:scale-95 transition-all">{n}</button>
                ))}
                <button onClick={() => handleOperation('-')} className="p-4 bg-stone-800 text-amber-500 rounded-2xl font-bold hover:bg-stone-700 active:scale-95 transition-all">−</button>

                {[4, 5, 6].map(n => (
                  <button key={n} onClick={() => handleNumber(n.toString())} className="p-4 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-700 active:scale-95 transition-all">{n}</button>
                ))}
                <button onClick={() => handleOperation('+')} className="p-4 bg-stone-800 text-amber-500 rounded-2xl font-bold hover:bg-stone-700 active:scale-95 transition-all">+</button>

                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => handleNumber(n.toString())} className="p-4 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-700 active:scale-95 transition-all">{n}</button>
                ))}
                <button onClick={handleEqual} className="row-span-2 p-4 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-400 active:scale-95 transition-all shadow-lg shadow-amber-500/20">=</button>

                <button onClick={() => handleNumber('0')} className="col-span-2 p-4 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-700 active:scale-95 transition-all">0</button>
                <button onClick={handleComma} className={`p-4 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-700 active:scale-95 transition-all ${error ? 'border-2 border-red-500 animate-pulse' : ''}`}>,</button>
              </div>
            </div>
          </div>

          {/* Right Side: Place Value Visualization */}
          <div className="lg:col-span-8 flex flex-col space-y-8">
            <div className="bg-white p-12 rounded-[48px] shadow-sm border border-stone-200 flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600">
                    <Layers size={18} />
                  </div>
                  <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400">Platsvärdesschema</h3>
                </div>
                
                {activeModule === 'infinity' && display.startsWith('0.333') && (
                  <button 
                    onClick={() => setIsBråk(!isBråk)}
                    className="px-4 py-2 bg-stone-800 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-700 transition-all"
                  >
                    {isBråk ? 'Visa Decimal' : 'Visa Bråk (1/3)'}
                  </button>
                )}
              </div>

              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-stretch space-x-4 h-64">
                  {COLUMNS.map((col) => {
                    const val = (values as any)[col.id];
                    const isDecimalPoint = col.id === 'decimal';

                    return (
                      <div key={col.id} className="flex flex-col items-center space-y-4 w-24">
                        <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 text-center h-8 flex items-center">
                          {col.label}
                        </div>
                        
                        <div className={`flex-1 w-full rounded-2xl border-2 border-dashed border-stone-100 flex items-center justify-center relative overflow-hidden ${isDecimalPoint ? 'bg-transparent border-none' : 'bg-stone-50/50'}`}>
                          {isDecimalPoint ? (
                            <div className="w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/40" />
                          ) : (
                            <AnimatePresence mode="popLayout">
                              {val && (
                                <motion.div
                                  key={val + col.id}
                                  initial={{ y: -50, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  exit={{ y: 50, opacity: 0 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                  className={`w-16 h-20 rounded-xl shadow-lg flex items-center justify-center text-3xl font-mono font-bold ${col.color}`}
                                >
                                  {val}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Infinity indicator */}
                  {activeModule === 'infinity' && display.includes('333') && (
                    <div className="flex items-center px-4">
                      <motion.div 
                        animate={{ x: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-stone-300"
                      >
                        <InfinityIcon size={32} />
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comparison Mode Overlay */}
              {activeModule === 'detective' && (
                <div className="mt-8 p-6 bg-stone-900 rounded-3xl text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">Tal A</span>
                        <input 
                          type="text" 
                          placeholder="0,6"
                          value={comparison.a}
                          onChange={(e) => setComparison({...comparison, a: e.target.value})}
                          className="bg-transparent text-2xl font-mono font-bold border-b border-stone-700 outline-none focus:border-amber-500 transition-colors w-24"
                        />
                      </div>
                      <div className="text-stone-700 text-2xl font-bold">VS</div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest text-stone-500 mb-1">Tal B</span>
                        <input 
                          type="text" 
                          placeholder="0,58"
                          value={comparison.b}
                          onChange={(e) => setComparison({...comparison, b: e.target.value})}
                          className="bg-transparent text-2xl font-mono font-bold border-b border-stone-700 outline-none focus:border-amber-500 transition-colors w-24"
                        />
                      </div>
                    </div>
                    
                    {comparison.a && comparison.b && (
                      <div className="flex items-center space-x-4 bg-stone-800 px-6 py-3 rounded-2xl border border-stone-700">
                        <span className="text-sm font-bold">
                          {parseFloat(comparison.a.replace(',', '.')) > parseFloat(comparison.b.replace(',', '.')) 
                            ? `${comparison.a} är störst!` 
                            : parseFloat(comparison.a.replace(',', '.')) < parseFloat(comparison.b.replace(',', '.'))
                            ? `${comparison.b} är störst!`
                            : 'De är lika stora!'}
                        </span>
                        <Search size={18} className="text-amber-500" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mission Panel */}
            <div className="bg-stone-800 p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                <Lightbulb size={120} />
              </div>
              <div className="relative z-10 space-y-4">
                <div className="flex items-center space-x-2 text-amber-400">
                  <HelpCircle size={18} />
                  <h4 className="text-xs font-mono uppercase tracking-widest">Uppdrag</h4>
                </div>
                <p className="text-lg font-serif italic text-stone-200">
                  {activeModule === 'free' && "Slå in 1,23 och multiplicera med 10. Se hur siffrorna glider åt vänster!"}
                  {activeModule === 'detective' && "Jämför 0,6 och 0,58. Vilken kolumn avgör vilket tal som är störst?"}
                  {activeModule === 'infinity' && "Dela 1 med 3. Hur många treor får plats i schemat?"}
                </p>
                <div className="flex items-center space-x-4 pt-2">
                  <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Aktivt uppdrag</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default SmartCalculatorLab;
