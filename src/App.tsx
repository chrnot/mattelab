import React, { useState } from 'react';
import { Lab } from './types';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import FrogJumpLab from './components/FrogJumpLab';
import MagicSquareLab from './components/MagicSquareLab';
import GeoboardLab from './components/GeoboardLab';
import DecimalCalculatorLab from './components/DecimalCalculatorLab';
import SmartCalculatorLab from './components/SmartCalculatorLab';
import IceCreamLab from './components/IceCreamLab';
import RichProblemLab from './components/RichProblemLab';
import ConnectionBuilder from './components/ConnectionBuilder';
import StatisticsLab from './components/StatisticsLab';
import StatisticsDetective from './components/StatisticsDetective';
import StatisticsExaminer from './components/StatisticsExaminer';
import TowerOfHanoi from './components/TowerOfHanoi';
import Architect from './components/Architect';
import TeacherView from './components/TeacherView';
import PatternTowers from './components/PatternTowers';

const App: React.FC = () => {
  const [currentLab, setCurrentLab] = useState<Lab>(Lab.HOME);
  const [isTeacherViewOpen, setIsTeacherViewOpen] = useState(false);

  const renderLab = () => {
    switch (currentLab) {
      case Lab.HOME: return <Home />;
      case Lab.FROG_JUMP: return <FrogJumpLab />;
      case Lab.MAGIC_SQUARE: return <MagicSquareLab />;
      case Lab.GEOBOARD: return <GeoboardLab />;
      case Lab.DECIMAL_CALCULATOR: return <DecimalCalculatorLab />;
      case Lab.SMART_CALCULATOR: return <SmartCalculatorLab />;
      case Lab.ICE_CREAM: return <IceCreamLab />;
      case Lab.RICH_PROBLEM_LAB: return <RichProblemLab />;
      case Lab.CONNECTION_BUILDER: return <ConnectionBuilder />;
      case Lab.STATISTICS_LAB: return <StatisticsLab />;
      case Lab.STATISTICS_DETECTIVE: return <StatisticsDetective />;
      case Lab.STATISTICS_EXAMINER: return <StatisticsExaminer />;
      case Lab.TOWER_OF_HANOI: return <TowerOfHanoi />;
      case Lab.ARCHITECT: return <Architect />;
      case Lab.PATTERN_TOWERS: return <PatternTowers />;
      default: return <Home />;
    }
  };

  return (
    <div className="flex h-screen bg-stone-100 text-stone-900 font-sans selection:bg-amber-200 overflow-hidden">
      <Sidebar 
        currentLab={currentLab} 
        onSelectLab={setCurrentLab} 
        isTeacherViewOpen={isTeacherViewOpen}
        onToggleTeacherView={() => setIsTeacherViewOpen(!isTeacherViewOpen)}
      />
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Beta Banner */}
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center justify-center gap-3 z-30">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] bg-amber-500 text-white font-black px-1.5 py-0.5 rounded shadow-sm uppercase tracking-widest">Beta</span>
            <p className="text-[11px] font-medium text-amber-900/70">
              Många laborationer är i <span className="font-bold">beta-version</span>. Vi utvecklar och förbättrar verktygen löpande!
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {renderLab()}
        </div>
        
        <TeacherView currentLab={currentLab} isOpen={isTeacherViewOpen} onToggle={() => setIsTeacherViewOpen(!isTeacherViewOpen)} />
      </div>
    </div>
  );
};

export default App;
