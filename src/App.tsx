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
import TeacherView from './components/TeacherView';

const App: React.FC = () => {
  const [currentLab, setCurrentLab] = useState<Lab>(Lab.HOME);

  return (
    <div className="flex h-screen bg-stone-100 text-stone-900 font-sans selection:bg-amber-200 overflow-hidden">
      <Sidebar currentLab={currentLab} onSelectLab={setCurrentLab} />
      
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {currentLab === Lab.HOME ? (
          <Home />
        ) : currentLab === Lab.FROG_JUMP ? (
          <FrogJumpLab />
        ) : currentLab === Lab.MAGIC_SQUARE ? (
          <MagicSquareLab />
        ) : currentLab === Lab.GEOBOARD ? (
          <GeoboardLab />
        ) : currentLab === Lab.DECIMAL_CALCULATOR ? (
          <DecimalCalculatorLab />
        ) : currentLab === Lab.SMART_CALCULATOR ? (
          <SmartCalculatorLab />
        ) : (
          <IceCreamLab />
        )}
        
        <TeacherView currentLab={currentLab} />
      </div>
    </div>
  );
};

export default App;
