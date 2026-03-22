import React from 'react';
import { ResultEntry } from '../types';

interface ResultTableProps {
  results: ResultEntry[];
  currentFrogCount: number;
}

const ResultTable: React.FC<ResultTableProps> = ({ results, currentFrogCount }) => {
  return (
    <div className="flex flex-col space-y-4 p-6 bg-white rounded-2xl shadow-sm border border-stone-200 w-full max-w-md">
      <h3 className="text-sm font-mono uppercase tracking-widest text-stone-400">Resultattabell</h3>
      
      <div className="overflow-hidden rounded-xl border border-stone-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-100">
              <th className="px-4 py-3 text-xs font-mono uppercase text-stone-500 italic">Antal grodor (n)</th>
              <th className="px-4 py-3 text-xs font-mono uppercase text-stone-500 italic">Antal hopp (h)</th>
              <th className="px-4 py-3 text-xs font-mono uppercase text-stone-500 italic">Ökning</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((n, idx) => {
              const result = results.find(r => r.frogCount === n);
              const prevResult = results.find(r => r.frogCount === n - 1);
              const diff = result && prevResult ? result.minMoves - prevResult.minMoves : null;
              const isCurrent = currentFrogCount === n;

              return (
                <tr 
                  key={n} 
                  className={`border-b border-stone-50 transition-colors ${
                    isCurrent ? 'bg-amber-50' : 'hover:bg-stone-50'
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-stone-800">{n}</td>
                  <td className="px-4 py-3 font-mono font-bold text-stone-900">
                    {result ? result.minMoves : '—'}
                  </td>
                  <td className="px-4 py-3 font-mono text-stone-400 text-sm italic">
                    {diff ? `+${diff}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <p className="text-xs text-stone-400 italic">
        * Tabellen fylls i automatiskt när du löser en nivå med minsta möjliga antal hopp.
      </p>
    </div>
  );
};

export default ResultTable;
