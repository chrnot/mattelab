import React from 'react';
import { motion } from 'motion/react';
import { FrogType } from '../types';
import { RotateCcw, Undo2, Lightbulb } from 'lucide-react';

interface FrogBoardProps {
  board: FrogType[];
  onMove: (index: number) => void;
  onUndo: () => void;
  onReset: () => void;
  onAutoMove: () => boolean;
  moves: number;
  isLocked: boolean;
  isSolved: boolean;
}

const FrogBoard: React.FC<FrogBoardProps> = ({
  board,
  onMove,
  onUndo,
  onReset,
  onAutoMove,
  moves,
  isLocked,
  isSolved,
}) => {
  const [shakeIndex, setShakeIndex] = React.useState<number | null>(null);
  const [showHintMsg, setShowHintMsg] = React.useState(false);

  const handleAutoMove = () => {
    const success = onAutoMove();
    if (!success) {
      setShowHintMsg(true);
      setTimeout(() => setShowHintMsg(false), 3000);
    }
  };

  const handleMove = (index: number) => {
    const frog = board[index];
    const isEmpty = (i: number) => board[i] === FrogType.EMPTY;
    
    let canMove = false;
    if (frog === FrogType.RED) {
      canMove = (index + 1 < board.length && isEmpty(index + 1)) || 
                (index + 2 < board.length && isEmpty(index + 2));
    } else if (frog === FrogType.GREEN) {
      canMove = (index - 1 >= 0 && isEmpty(index - 1)) || 
                (index - 2 >= 0 && isEmpty(index - 2));
    }

    if (!canMove) {
      setShakeIndex(index);
      setTimeout(() => setShakeIndex(null), 500);
    } else {
      onMove(index);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8 p-8 bg-stone-50 rounded-2xl shadow-sm border border-stone-200">
      <div className="flex items-center justify-between w-full max-w-2xl px-4">
        <div className="flex flex-col">
          <span className="text-xs font-mono uppercase tracking-widest text-stone-400">Hopp-räknare</span>
          <span className="text-4xl font-mono font-bold text-stone-800">{moves}</span>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handleAutoMove}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors font-bold text-sm"
            title="Visa nästa drag"
          >
            <Lightbulb size={18} />
            <span>Hjälp</span>
          </button>
          <button
            onClick={onUndo}
            className="p-3 rounded-full hover:bg-stone-200 transition-colors text-stone-600"
            title="Ångra ett steg"
          >
            <Undo2 size={24} />
          </button>
          <button
            onClick={onReset}
            className="p-3 rounded-full hover:bg-stone-200 transition-colors text-stone-600"
            title="Börja om"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center space-x-2 p-6 bg-stone-200 rounded-xl overflow-hidden min-h-[120px] w-full max-w-3xl">
        {board.map((type, index) => (
          <div
            key={index}
            className="relative w-16 h-16 flex items-center justify-center"
          >
            {/* The "Stone" */}
            <div className="absolute inset-0 bg-stone-300 rounded-lg shadow-inner border-b-4 border-stone-400" />
            
            {/* The Frog */}
            {type !== FrogType.EMPTY && (
              <motion.button
                layoutId={`frog-${index}`}
                onClick={() => handleMove(index)}
                animate={shakeIndex === index ? { x: [0, -5, 5, -5, 5, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className={`z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 ${
                  type === FrogType.RED ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                  <div className="w-4 h-1 bg-white/30 rounded-full mt-1" />
                </div>
              </motion.button>
            )}
          </div>
        ))}
      </div>

      <div className="h-8 flex items-center justify-center">
        {showHintMsg && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-amber-600 font-medium italic"
          >
            Ingen lösning från nuvarande läge. Startar om...
          </motion.p>
        )}
        {isLocked && !isSolved && !showHintMsg && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-rose-600 font-medium italic"
          >
            Spelet har låst sig! Prova att ångra eller börja om.
          </motion.p>
        )}
        {isSolved && (
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-emerald-600 font-bold text-lg"
          >
            Snyggt! Du har löst pusslet!
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default FrogBoard;
