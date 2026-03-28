import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  ChevronRight, 
  RotateCcw, 
  Lightbulb, 
  CheckCircle2, 
  Info,
  ArrowRight,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  steps: string[];
}

const TASKS: Task[] = [
  {
    id: 1,
    title: "Bekanta dig med räknaren",
    description: "Slå på din räknare och se till att displayen visar noll.",
    steps: [
      "Tryck på sifferknapparna och kommatecknet för att skriva in några olika decimaltal, till exempel: 3,14, 0,5, 12,75.",
      "Vad händer om du trycker på kommatecknet flera gånger i ett tal? Prova till exempel att skriva 3..14. Vad visar räknaren?",
      "Jämför hur räknaren visar talet du skrev in med hur du själv brukar skriva det. Finns det några skillnader?"
    ]
  },
  {
    id: 2,
    title: "Utforska platsvärde",
    description: "Skriv in talet 1,23 på räknaren.",
    steps: [
      "Vilken siffra står på tiondelsplatsen? Vilken står på hundradelsplatsen?",
      "Vad händer om du multiplicerar 1,23 med 10? Tryck på *, sedan 1, 0 och =. Vad visar räknaren nu?",
      "Beskriv vad som hände med talet när du multiplicerade det med 10. Vilka siffror flyttades? Vilket nytt platsvärde fick de?",
      "Prova nu att dela resultatet du fick med 10. Vad visar räknaren? Jämför det med ditt ursprungliga tal (1,23).",
      "Upprepa processen genom att multiplicera och dividera andra decimaltal med 10, 100 och 1000. Vad upptäcker du för mönster?"
    ]
  },
  {
    id: 3,
    title: "Operationer med decimaltal",
    description: "Skriv in talet 2,5.",
    steps: [
      "Lägg till 1,7 (+ 1,7 =). Vad visar räknaren?",
      "Dra ifrån 0,9 (- 0,9 =). Vad visar räknaren?",
      "Utför några fler additioner och subtraktioner med decimaltal. Skriv ner dina beräkningar.",
      "Vad händer om du multiplicerar två decimaltal, till exempel 0,5 * 0,5? Prova och skriv ner resultatet.",
      "Försök att förklara resultatet. Varför blev det så? Tänk på vad 0,5 betyder (hälften av en hel)."
    ]
  },
  {
    id: 4,
    title: "Jämföra decimaltal",
    description: "Skriv in talet 0,6 på räknaren.",
    steps: [
      "Skriv in talet 0,58.",
      "Vilket av dessa tal är störst? Hur kan du avgöra det?",
      "Prova att dividera 0,6 med 0,58. Blir resultatet större eller mindre än 1? Hur kan detta hjälpa dig att jämföra talen?",
      "Jämför andra par av decimaltal på liknande sätt."
    ]
  },
  {
    id: 5,
    title: "Utforska speciella tal",
    description: "Skriv in talet 1 på räknaren.",
    steps: [
      "Dividera 1 med 3. Vad visar räknaren?",
      "Kan du förklara varför räknaren visar detta resultat? Vad betyder det när siffrorna upprepar sig?",
      "Prova att dividera andra heltal med 3, 7 och 9. Vilka mönster ser du?"
    ]
  }
];

const CHALLENGES = [
  { start: 3.14, target: 3.34, hint: "Addera något" },
  { start: 2.19, target: 2.22, hint: "Addera något litet" },
  { start: 5.20, target: 5.5, hint: "Addera tiondelar" },
  { start: 6.17, target: 6.12, hint: "Subtrahera hundradelar" },
  { start: 5.35, target: 5.29, hint: "Subtrahera hundradelar" },
  { start: 4, target: -2, hint: "Subtrahera ett heltal" },
  { start: -4, target: 3, hint: "Addera ett heltal" },
  { start: -10, target: -13, hint: "Subtrahera ett heltal" },
];

const DecimalCalculatorLab: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [currentTask, setCurrentTask] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState(0);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  const handleNumber = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleComma = () => {
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleClear = () => {
    setDisplay('0');
  };

  const handleOperator = (op: string) => {
    setDisplay(display + ' ' + op + ' ');
  };

  const handleEqual = () => {
    try {
      // Basic evaluation for the simulation
      const result = eval(display.replace(/,/g, '.'));
      const formattedResult = Number(result.toFixed(10)).toString();
      setHistory([...history, `${display} = ${formattedResult}`]);
      setDisplay(formattedResult);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const nextTask = () => {
    if (currentTask < TASKS.length - 1) {
      setCurrentTask(currentTask + 1);
    }
  };

  const prevTask = () => {
    if (currentTask > 0) {
      setCurrentTask(currentTask - 1);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
            <Calculator size={20} />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-stone-900 italic">Decimaltal på räknaren</h1>
            <div className="flex items-center space-x-2 text-[10px] uppercase tracking-widest font-bold text-stone-400">
              <span>Taluppfattning</span>
              <ChevronRight size={10} />
              <span className="text-amber-500">Utforska decimaler</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowChallenge(!showChallenge)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${showChallenge ? 'bg-amber-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
          >
            {showChallenge ? 'Visa Uppgifter' : 'Utmaningar (PDF)'}
          </button>
          <button 
            onClick={() => { setDisplay('0'); setHistory([]); setNotes(''); }}
            className="p-2 hover:bg-stone-100 rounded-lg text-stone-400 transition-colors"
            title="Nollställ allt"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Column: Tasks & Notes */}
          <div className="lg:col-span-4 flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="wait">
              {!showChallenge ? (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-mono uppercase tracking-widest text-amber-600 font-bold">Uppgift {TASKS[currentTask].id}</h3>
                      <div className="flex space-x-2">
                        <button onClick={prevTask} disabled={currentTask === 0} className="p-1 disabled:opacity-30"><ChevronRight className="rotate-180" size={18} /></button>
                        <button onClick={nextTask} disabled={currentTask === TASKS.length - 1} className="p-1 disabled:opacity-30"><ChevronRight size={18} /></button>
                      </div>
                    </div>
                    <h4 className="text-lg font-serif font-bold text-stone-800 mb-2">{TASKS[currentTask].title}</h4>
                    <p className="text-sm text-stone-600 mb-4 italic">{TASKS[currentTask].description}</p>
                    <ul className="space-y-3">
                      {TASKS[currentTask].steps.map((step, i) => (
                        <li key={i} className="flex items-start space-x-3 text-sm text-stone-700">
                          <div className="w-5 h-5 bg-stone-100 rounded-full flex items-center justify-center text-[10px] font-bold text-stone-500 flex-shrink-0 mt-0.5">{i + 1}</div>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-stone-800 p-6 rounded-3xl shadow-xl text-white">
                    <div className="flex items-center space-x-2 mb-4">
                      <BookOpen size={18} className="text-amber-400" />
                      <h3 className="text-xs font-mono uppercase tracking-widest">Dina anteckningar</h3>
                    </div>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Skriv ner dina observationer här..."
                      className="w-full h-40 bg-stone-700/50 border border-stone-600 rounded-xl p-4 text-sm text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="challenges"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 shadow-sm">
                    <h3 className="text-sm font-mono uppercase tracking-widest text-amber-700 font-bold mb-4">Utmaningar</h3>
                    <p className="text-xs text-amber-800 mb-6">
                      Utgå från talet till vänster. Vilken beräkning måste du göra för att få talet till höger?
                    </p>
                    <div className="space-y-3">
                      {CHALLENGES.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => { setDisplay(c.start.toString()); setActiveChallenge(i); }}
                          className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all ${activeChallenge === i ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-stone-600 hover:bg-amber-100'}`}
                        >
                          <span className="font-mono font-bold">{c.start}</span>
                          <ArrowRight size={16} className={activeChallenge === i ? 'text-white' : 'text-amber-300'} />
                          <span className="font-mono font-bold">{c.target}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Center Column: Calculator */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="bg-stone-900 p-8 rounded-[48px] shadow-2xl border-4 border-stone-800 w-full max-w-md">
              {/* Display */}
              <div className="bg-stone-800 rounded-2xl p-6 mb-8 text-right overflow-hidden border border-stone-700 shadow-inner">
                <div className="text-[10px] font-mono text-stone-500 uppercase tracking-widest mb-1">Mattelab Calculator v1.0</div>
                <div className="text-4xl font-mono text-amber-400 truncate tracking-tighter">
                  {display.replace(/\./g, ',')}
                </div>
              </div>

              {/* Buttons */}
              <div className="grid grid-cols-4 gap-4">
                <button onClick={handleClear} className="col-span-2 p-5 bg-stone-700 text-stone-200 rounded-2xl font-bold hover:bg-stone-600 transition-colors">AC</button>
                <button onClick={() => handleOperator('/')} className="p-5 bg-stone-800 text-amber-500 rounded-2xl font-bold hover:bg-stone-700 transition-colors">÷</button>
                <button onClick={() => handleOperator('*')} className="p-5 bg-stone-800 text-amber-500 rounded-2xl font-bold hover:bg-stone-700 transition-colors">×</button>

                {[7, 8, 9].map(n => (
                  <button key={n} onClick={() => handleNumber(n.toString())} className="p-5 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-700 transition-colors">{n}</button>
                ))}
                <button onClick={() => handleOperator('-')} className="p-5 bg-stone-800 text-amber-500 rounded-2xl font-bold hover:bg-stone-700 transition-colors">−</button>

                {[4, 5, 6].map(n => (
                  <button key={n} onClick={() => handleNumber(n.toString())} className="p-5 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-700 transition-colors">{n}</button>
                ))}
                <button onClick={() => handleOperator('+')} className="p-5 bg-stone-800 text-amber-500 rounded-2xl font-bold hover:bg-stone-700 transition-colors">+</button>

                {[1, 2, 3].map(n => (
                  <button key={n} onClick={() => handleNumber(n.toString())} className="p-5 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-700 transition-colors">{n}</button>
                ))}
                <button onClick={handleEqual} className="row-span-2 p-5 bg-amber-500 text-white rounded-2xl font-bold hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20">=</button>

                <button onClick={() => handleNumber('0')} className="col-span-2 p-5 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-700 transition-colors">0</button>
                <button onClick={handleComma} className="p-5 bg-stone-800 text-white rounded-2xl font-bold hover:bg-stone-700 transition-colors">,</button>
              </div>
            </div>
          </div>

          {/* Right Column: History & Tips */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex-1 flex flex-col overflow-hidden">
              <div className="flex items-center space-x-2 mb-4">
                <RotateCcw size={16} className="text-stone-400" />
                <h3 className="text-xs font-mono uppercase tracking-widest text-stone-400">Historik</h3>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                    <Calculator size={40} className="mb-2" />
                    <p className="text-[10px] uppercase font-bold tracking-widest">Inga beräkningar</p>
                  </div>
                ) : (
                  history.map((h, i) => (
                    <div key={i} className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs font-mono text-stone-600">
                      {h.replace(/\./g, ',')}
                    </div>
                  )).reverse()
                )}
              </div>
            </div>

            <div className="p-6 bg-amber-500 text-white rounded-3xl shadow-xl space-y-3">
              <div className="flex items-center space-x-2">
                <Lightbulb size={18} className="text-amber-200" />
                <h4 className="text-xs font-mono uppercase tracking-widest">Tips</h4>
              </div>
              <p className="text-xs text-amber-50 leading-relaxed">
                {showChallenge ? "Försök att lista ut beräkningen i huvudet innan du provar på räknaren!" : "Uppmuntra dig själv att gissa resultatet innan du trycker på '='. Det tränar din matematiska intuition."}
              </p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default DecimalCalculatorLab;
