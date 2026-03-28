import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shapes, 
  Table as TableIcon, 
  LineChart, 
  Variable, 
  ChevronRight, 
  RotateCcw, 
  Check, 
  Info,
  Plus,
  Trash2,
  Share2,
  QrCode,
  Lightbulb
} from 'lucide-react';
import { 
  LineChart as ReChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

enum Phase {
  SPECIAL_CASES = 1,
  PATTERN_SEEKING = 2,
  GENERALIZATION = 3,
  CREATOR_STUDIO = 4
}

enum Tab {
  TABLE = 'TABLE',
  GRAPH = 'GRAPH',
  FORMULA = 'FORMULA'
}

interface DataPoint {
  n: number;
  value: number;
}

const RichProblemLab: React.FC = () => {
  const [phase, setPhase] = useState<Phase>(Phase.SPECIAL_CASES);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.TABLE);
  const [bushCount, setBushCount] = useState(1);
  const [tiles, setTiles] = useState<number[]>([]); // Concrete representation
  const [tableData, setTableData] = useState<DataPoint[]>([]);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ text: string; type: 'info' | 'success' | 'error' } | null>(null);
  const [formula, setFormula] = useState('');

  // Problem definition: Buskar på rad
  // Pattern: 2n + 6
  const getRequiredTiles = (n: number) => 2 * n + 6;

  useEffect(() => {
    // Initial data for table if empty
    if (tableData.length === 0) {
      setTableData([{ n: 1, value: 8 }]);
    }
  }, []);

  const handleAddBush = () => {
    if (bushCount < 20) {
      setBushCount(prev => prev + 1);
    }
  };

  const handleRemoveBush = () => {
    if (bushCount > 1) {
      setBushCount(prev => prev - 1);
    }
  };

  const checkAnswer = () => {
    const numAnswer = parseInt(answer);
    if (isNaN(numAnswer)) return;

    if (phase === Phase.SPECIAL_CASES) {
      if (bushCount === 4 && numAnswer === 14) {
        setFeedback({ text: 'Snyggt! 4 buskar behöver 14 plattor. Testa nu för 5 buskar.', type: 'success' });
        addToTable(4, 14);
      } else if (bushCount === 5 && numAnswer === 16) {
        setFeedback({ text: 'Helt rätt! Du verkar ha koll på hur det växer.', type: 'success' });
        addToTable(5, 16);
        setTimeout(() => setPhase(Phase.PATTERN_SEEKING), 2000);
      } else {
        setFeedback({ text: 'Inte riktigt, räkna plattorna en gång till.', type: 'error' });
      }
    } else if (phase === Phase.PATTERN_SEEKING) {
      if (numAnswer === 36) { // 2*15 + 6 = 36
        setFeedback({ text: 'Imponerande! Du hittade mönstret för 15 buskar.', type: 'success' });
        addToTable(15, 36);
        setTimeout(() => setPhase(Phase.GENERALIZATION), 2000);
      } else {
        setFeedback({ text: 'Nja, kolla i tabellen om du ser en ökning.', type: 'error' });
      }
    } else if (phase === Phase.GENERALIZATION) {
      if (numAnswer === 56) { // (118 - 6) / 2 = 56
        setFeedback({ text: 'Wow! Du kan arbeta baklänges också.', type: 'success' });
      } else {
        setFeedback({ text: 'Tänk på att vi har 6 hörnplattor som alltid är där.', type: 'error' });
      }
    }
    setAnswer('');
  };

  const addToTable = (n: number, value: number) => {
    if (!tableData.find(d => d.n === n)) {
      const newData = [...tableData, { n, value }].sort((a, b) => a.n - b.n);
      setTableData(newData);
    }
  };

  const renderSandbox = () => {
    // Render a visual representation of bushes and tiles
    // For n bushes, we have a row of n black squares (bushes)
    // Surrounded by white squares (tiles)
    // Top row: n + 2 tiles
    // Middle row: 1 tile, n bushes, 1 tile
    // Bottom row: n + 2 tiles
    // Total: (n+2) + 2 + (n+2) = 2n + 6
    
    const grid = [];
    const width = bushCount + 2;
    
    // Top row
    for (let i = 0; i < width; i++) grid.push({ type: 'tile', id: `t-top-${i}` });
    // Middle row
    grid.push({ type: 'tile', id: 't-mid-start' });
    for (let i = 0; i < bushCount; i++) grid.push({ type: 'bush', id: `b-${i}` });
    grid.push({ type: 'tile', id: 't-mid-end' });
    // Bottom row
    for (let i = 0; i < width; i++) grid.push({ type: 'tile', id: `t-bot-${i}` });

    return (
      <div 
        className="grid gap-1 p-4 bg-stone-50 rounded-2xl border border-stone-200 shadow-inner"
        style={{ 
          gridTemplateColumns: `repeat(${width}, minmax(0, 1fr))`,
          width: 'fit-content',
          maxWidth: '100%'
        }}
      >
        {grid.map(item => (
          <motion.div
            key={item.id}
            layout
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-md shadow-sm border ${
              item.type === 'bush' 
                ? 'bg-stone-900 border-stone-800' 
                : 'bg-white border-stone-200'
            }`}
          />
        ))}
      </div>
    );
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
            <h1 className="text-xl font-serif font-bold text-stone-900 italic">Det Rika Problemlabbet</h1>
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-stone-400">
              <span>Problemlösning</span>
              <ChevronRight size={10} />
              <span className="text-amber-500">Buskar på rad</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-stone-100 p-1 rounded-xl">
            {[1, 2, 3, 4].map(p => (
              <div 
                key={p}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                  phase === p ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'
                }`}
              >
                Fas {p}
              </div>
            ))}
          </div>
          <button 
            onClick={() => {
              setPhase(Phase.SPECIAL_CASES);
              setTableData([{ n: 1, value: 8 }]);
              setBushCount(1);
              setFeedback(null);
            }}
            className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 transition-colors"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-8 flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-hidden">
          
          {/* Left Side: Concrete Sandbox */}
          <div className="lg:col-span-7 flex flex-col space-y-6 overflow-hidden">
            <div className="flex-1 bg-white p-8 rounded-[32px] shadow-sm border border-stone-200 flex flex-col overflow-hidden relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2 text-stone-400">
                  <Info size={16} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Den Konkreta Sandlådan</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={handleRemoveBush}
                    className="w-8 h-8 flex items-center justify-center bg-stone-100 rounded-lg text-stone-600 hover:bg-stone-200 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="px-3 py-1 bg-stone-100 rounded-lg text-xs font-bold text-stone-600">
                    {bushCount} buskar
                  </div>
                  <button 
                    onClick={handleAddBush}
                    className="w-8 h-8 flex items-center justify-center bg-amber-500 rounded-lg text-white hover:bg-amber-600 transition-colors shadow-sm"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <div className="flex-1 flex items-center justify-center overflow-auto p-4">
                {renderSandbox()}
              </div>

              <div className="mt-8 p-6 bg-stone-50 rounded-2xl border border-stone-100">
                <h3 className="text-sm font-bold text-stone-900 mb-2">
                  {phase === Phase.SPECIAL_CASES && `Uppdrag: Hur många plattor går det åt till ${bushCount === 4 ? '4' : bushCount === 5 ? '5' : '...'} buskar?`}
                  {phase === Phase.PATTERN_SEEKING && "Uppdrag: Hur många plattor går det åt till 15 buskar?"}
                  {phase === Phase.GENERALIZATION && "Uppdrag: Hur många buskar får du för 118 plattor?"}
                  {phase === Phase.CREATOR_STUDIO && "Uppdrag: Skapa ditt eget problem!"}
                </h3>
                <div className="flex items-center space-x-4">
                  <input 
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Svar..."
                    className="flex-1 px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <button 
                    onClick={checkAnswer}
                    className="px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center space-x-2"
                  >
                    <Check size={18} />
                    <span>Svara</span>
                  </button>
                </div>
                <AnimatePresence>
                  {feedback && (
                    <motion.p 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`mt-3 text-xs font-medium ${
                        feedback.type === 'success' ? 'text-emerald-600' : feedback.type === 'error' ? 'text-red-600' : 'text-stone-500'
                      }`}
                    >
                      {feedback.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Side: Representation Selector */}
          <div className="lg:col-span-5 flex flex-col space-y-6 overflow-hidden">
            <div className="bg-stone-900 p-8 rounded-[32px] shadow-xl flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-stone-800 rounded-lg flex items-center justify-center text-amber-400">
                    {activeTab === Tab.TABLE && <TableIcon size={18} />}
                    {activeTab === Tab.GRAPH && <LineChart size={18} />}
                    {activeTab === Tab.FORMULA && <Variable size={18} />}
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Representations-väljaren</h3>
                </div>
                <div className="flex bg-stone-800 p-1 rounded-lg">
                  <button 
                    onClick={() => setActiveTab(Tab.TABLE)}
                    className={`p-2 rounded-md transition-all ${activeTab === Tab.TABLE ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}
                  >
                    <TableIcon size={16} />
                  </button>
                  <button 
                    onClick={() => setActiveTab(Tab.GRAPH)}
                    className={`p-2 rounded-md transition-all ${activeTab === Tab.GRAPH ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}
                  >
                    <LineChart size={16} />
                  </button>
                  <button 
                    onClick={() => setActiveTab(Tab.FORMULA)}
                    className={`p-2 rounded-md transition-all ${activeTab === Tab.FORMULA ? 'bg-stone-700 text-white shadow-sm' : 'text-stone-500 hover:text-stone-300'}`}
                  >
                    <Variable size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === Tab.TABLE && (
                    <motion.div 
                      key="table"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col"
                    >
                      <div className="grid grid-cols-2 gap-px bg-stone-800 rounded-xl overflow-hidden border border-stone-800">
                        <div className="bg-stone-800 p-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">Antal Buskar (n)</div>
                        <div className="bg-stone-800 p-3 text-[10px] font-bold text-stone-400 uppercase tracking-widest text-center">Antal Plattor (y)</div>
                        {tableData.map((row, i) => (
                          <React.Fragment key={i}>
                            <div className="bg-stone-900 p-4 text-white font-mono text-center border-t border-stone-800">{row.n}</div>
                            <div className="bg-stone-900 p-4 text-amber-400 font-mono text-center border-t border-stone-800">{row.value}</div>
                          </React.Fragment>
                        ))}
                      </div>
                      {phase === Phase.PATTERN_SEEKING && (
                        <div className="mt-4 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                          <p className="text-[10px] text-amber-200 leading-relaxed italic">
                            Tips: Se hur mycket antalet plattor ökar för varje ny buske. Kan du förutsäga värdet för 15?
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === Tab.GRAPH && (
                    <motion.div 
                      key="graph"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <ReChart data={tableData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis dataKey="n" stroke="#666" fontSize={10} />
                          <YAxis stroke="#666" fontSize={10} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1c1917', border: 'none', borderRadius: '8px', fontSize: '10px' }}
                            itemStyle={{ color: '#fbbf24' }}
                          />
                          <Line type="monotone" dataKey="value" stroke="#fbbf24" strokeWidth={2} dot={{ fill: '#fbbf24' }} />
                        </ReChart>
                      </ResponsiveContainer>
                    </motion.div>
                  )}

                  {activeTab === Tab.FORMULA && (
                    <motion.div 
                      key="formula"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col space-y-6"
                    >
                      <div className="p-6 bg-stone-800 rounded-2xl border border-stone-700">
                        <h4 className="text-[10px] font-bold text-amber-400 uppercase mb-4 tracking-widest">Formulera regeln</h4>
                        <div className="space-y-4">
                          <p className="text-xs text-stone-400 italic">
                            Hur många plattor behövs för "n" buskar?
                          </p>
                          <div className="flex items-center space-x-3">
                            <span className="text-white font-mono text-lg">y =</span>
                            <input 
                              type="text"
                              value={formula}
                              onChange={(e) => setFormula(e.target.value)}
                              placeholder="t.ex. 2n + 6"
                              className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-4 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <button 
                            className="w-full py-3 bg-amber-500 text-stone-900 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-all"
                            onClick={() => {
                              if (formula.replace(/\s/g, '') === '2n+6' || formula.replace(/\s/g, '') === 'n*2+6') {
                                setFeedback({ text: 'Perfekt! Du har hittat den generella formeln.', type: 'success' });
                                setTimeout(() => setPhase(Phase.CREATOR_STUDIO), 2000);
                              } else {
                                setFeedback({ text: 'Inte riktigt den formeln, titta på ökningen i tabellen.', type: 'error' });
                              }
                            }}
                          >
                            Testa formel
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Creator Studio / Share */}
            <AnimatePresence>
              {phase === Phase.CREATOR_STUDIO && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-6 rounded-[32px] border border-stone-200 shadow-sm"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-500">
                      <Share2 size={20} />
                    </div>
                    <div className="space-y-3 flex-1">
                      <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest">Skapar-studion</h4>
                      <p className="text-[11px] text-stone-500 leading-relaxed">
                        Du har bemästrat buskarna! Nu kan du skapa ett eget liknande problem och utmana en kompis.
                      </p>
                      <div className="flex space-x-2">
                        <button className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-stone-200 transition-all flex items-center justify-center space-x-2">
                          <QrCode size={14} />
                          <span>QR-kod</span>
                        </button>
                        <button className="flex-1 py-2 bg-stone-900 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center space-x-2">
                          <Share2 size={14} />
                          <span>Dela länk</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hint Box */}
            {phase !== Phase.CREATOR_STUDIO && (
              <div className="bg-white p-6 rounded-[32px] border border-stone-200 shadow-sm">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-amber-50 rounded-2xl text-amber-500">
                    <Lightbulb size={20} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-stone-900 uppercase tracking-widest">Matematisk utmaning</h4>
                    <p className="text-[11px] text-stone-500 leading-relaxed">
                      {phase === Phase.SPECIAL_CASES && "Börja med att bygga mönstret för 4 och 5 buskar. Hur många plattor ser du?"}
                      {phase === Phase.PATTERN_SEEKING && "Att bygga 15 buskar tar tid. Kan du se ett mönster i tabellen som hjälper dig?"}
                      {phase === Phase.GENERALIZATION && "Om vi har 118 plattor, hur många buskar får plats i mitten?"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RichProblemLab;
