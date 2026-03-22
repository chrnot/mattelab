import React, { useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, XCircle } from 'lucide-react';

interface FormulaBuilderProps {
  onSuccess: () => void;
}

const FormulaBuilder: React.FC<FormulaBuilderProps> = ({ onSuccess }) => {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const checkFormula = () => {
    // Normalize input: remove spaces, lowercase, handle exponents
    const normalized = input.replace(/\s+/g, '').toLowerCase();
    
    // Correct variations:
    // n(n+2)
    // (n+1)^2-1
    // n^2+2n
    // n*n+2*n
    // (n+1)*(n+1)-1
    
    const correctPatterns = [
      /^n\(n\+2\)$/,
      /^\(n\+1\)\^2-1$/,
      /^n\^2\+2n$/,
      /^n\*n\+2\*n$/,
      /^\(n\+1\)\*\(n\+1\)-1$/,
      /^n\*\(n\+2\)$/,
      /^n\*\*2\+2\*n$/,
      /^n\*\*2\+2n$/
    ];

    const isCorrect = correctPatterns.some(pattern => pattern.test(normalized));

    if (isCorrect) {
      setStatus('success');
      onSuccess();
    } else {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 2000);
    }
  };

  return (
    <div className="flex flex-col space-y-6 p-8 bg-white rounded-2xl shadow-sm border border-stone-200 w-full max-w-2xl">
      <div className="flex flex-col space-y-2">
        <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400">Fas 4: Generalisering</h3>
        <h2 className="text-2xl font-serif font-medium text-stone-800 italic">
          Kan du skriva en formel för n antal grodor?
        </h2>
        <p className="text-stone-500">
          Använd variabeln <span className="font-mono font-bold text-stone-700">n</span> för att beskriva hur många hopp som krävs.
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="t.ex. n^2 + 2n"
            className={`w-full px-6 py-4 rounded-xl border-2 font-mono text-xl transition-all outline-none ${
              status === 'success' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' :
              status === 'error' ? 'border-rose-500 bg-rose-50 text-rose-800' :
              'border-stone-200 focus:border-stone-400 bg-stone-50'
            }`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {status === 'success' && <CheckCircle2 className="text-emerald-500" size={24} />}
            {status === 'error' && <XCircle className="text-rose-500" size={24} />}
          </div>
        </div>

        <button
          onClick={checkFormula}
          disabled={status === 'success'}
          className="px-8 py-4 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-900 transition-colors disabled:opacity-50"
        >
          Validera
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-stone-400 uppercase tracking-widest">Tips:</span>
        <span className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-600 font-mono">n^2</span>
        <span className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-600 font-mono">(n+1)</span>
        <span className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-600 font-mono">n(n+2)</span>
      </div>
    </div>
  );
};

export default FormulaBuilder;
