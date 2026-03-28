import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EyeOff, Info, HelpCircle } from 'lucide-react';

import { Lab } from '../types';

interface TeacherViewProps {
  currentLab: Lab;
  isOpen: boolean;
  onToggle: () => void;
}

const TeacherView: React.FC<TeacherViewProps> = ({ currentLab, isOpen, onToggle }) => {
  if (currentLab === Lab.HOME) return null;

  const getContent = () => {
    switch (currentLab) {
      case Lab.FROG_JUMP:
        return {
          title: 'Grodtricket',
          body: (
            <>
              <p>
                Det kritiska ögonblicket är det <span className="font-bold text-stone-800">tredje draget</span>. 
                Efter att ha flyttat den första röda grodan och hoppat över den med en grön groda, 
                måste man flytta <span className="font-bold text-stone-800 italic">nästa gröna groda</span> till den tomma platsen.
              </p>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 italic">
                "Flytta aldrig två grodor av samma färg intill varandra, om de inte redan är på sina slutplatser."
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 uppercase text-xs tracking-widest">Diskussionsunderlag:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hur ser vi att n(n+2) är samma som n² + 2n?</li>
                  <li>Varför ökar antalet hopp med 5, 7, 9...?</li>
                </ul>
              </div>
            </>
          ),
          footer: 'Facit: h = n² + 2n'
        };
      case Lab.MAGIC_SQUARE:
        return {
          title: 'Magiska Mönster',
          body: (
            <>
              <p>
                I en 3x3 magisk kvadrat med en aritmetisk talföljd är <span className="font-bold text-stone-800">mitten-talet</span> alltid 1/3 av den magiska summan.
              </p>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 italic">
                "Motsatta tal (genom mitten) bildar par som summeras till 2 gånger mitten-talet."
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 uppercase text-xs tracking-widest">Diskussionsunderlag:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Varför kan inte 9:an ligga i ett hörn i 1-9 kvadraten?</li>
                  <li>Hur kan vi förutsäga summan innan vi börjar?</li>
                </ul>
              </div>
            </>
          ),
          footer: 'Facit: S = 3 * Mitten-talet'
        };
      case Lab.GEOBOARD:
        return {
          title: 'Geometriska Gåtor',
          body: (
            <>
              <p>
                Geobrädet är ett kraftfullt verktyg för att visualisera <span className="font-bold text-stone-800">area</span> och <span className="font-bold text-stone-800">omkrets</span>.
              </p>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 italic">
                "Använd Picks formel: Area = Inre spikar + (Randspikar / 2) - 1."
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 uppercase text-xs tracking-widest">Diskussionsunderlag:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Varför har en kvadrat med sidan √2 arean 2?</li>
                  <li>Kan vi skapa en liksidig triangel på ett geobräde?</li>
                </ul>
              </div>
            </>
          ),
          footer: 'Picks formel: A = I + B/2 - 1'
        };
      case Lab.DECIMAL_CALCULATOR:
        return {
          title: 'Decimaltal på räknaren',
          body: (
            <>
              <p>
                Miniräknaren används här som ett didaktiskt verktyg för att ge elever fördjupad förståelse för <span className="font-bold text-stone-800">decimaltal</span>.
              </p>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 italic">
                "Uppmuntra eleverna att förutsäga resultatet innan de trycker på '='."
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 uppercase text-xs tracking-widest">Diskussionsunderlag:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Vad händer med siffrorna när vi multiplicerar med 10?</li>
                  <li>Varför blir 0,5 * 0,5 = 0,25?</li>
                  <li>Hur kan vi jämföra 0,6 och 0,58 på ett säkert sätt?</li>
                </ul>
              </div>
            </>
          ),
          footer: 'Tips: Arbeta i par för diskussion'
        };
      case Lab.SMART_CALCULATOR:
        return {
          title: 'Den Smarta Räknaren',
          body: (
            <>
              <p>
                Denna widget visualiserar kopplingen mellan <span className="font-bold text-stone-800">knapptryckningar</span> och <span className="font-bold text-stone-800">platsvärdessystemet</span>.
              </p>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 italic">
                "Fokusera på att siffrorna flyttar sig mellan kolumnerna, istället för att kommat flyttar sig."
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 uppercase text-xs tracking-widest">Diskussionsunderlag:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Varför glider siffrorna åt vänster vid multiplikation?</li>
                  <li>Vad händer med värdet på siffra 2 när den flyttar från ental till tiotal?</li>
                  <li>Hur visar visualiseringen att 0,6 är större än 0,58?</li>
                </ul>
              </div>
            </>
          ),
          footer: 'Didaktik: Visualisera platsvärde'
        };
      case Lab.ICE_CREAM:
        return {
          title: 'Glass-labbet (Kombinatorik)',
          body: (
            <>
              <p>
                Ett klassiskt kombinatorikproblem som introducerar <span className="font-bold text-stone-800">KLAG-modellen</span> (Konkret, Logiskt, Algebraiskt, Grafiskt).
              </p>
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 italic">
                "Det är viktigt att zappa mellan olika uttrycksformer för att fördjupa förståelsen."
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 uppercase text-xs tracking-widest">Diskussionsunderlag:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Spelar ordningen någon roll? (Är jordgubb+choklad samma som choklad+jordgubb?)</li>
                  <li>Får man välja två av samma smak?</li>
                  <li>Hur kan vi rita eller skriva för att vara säkra på att vi hittat alla?</li>
                </ul>
              </div>
            </>
          ),
          footer: 'KLAG: Konkret, Logiskt, Algebraiskt, Grafiskt'
        };
      case Lab.RICH_PROBLEM_LAB:
        return {
          title: 'Det Rika Problemlabbet',
          body: (
            <>
              <p>
                Här fokuserar vi på <span className="font-bold text-stone-800">rika problem</span> som leder från konkreta experiment till algebraisk generalisering.
              </p>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <h4 className="font-bold text-amber-900 uppercase text-[10px] tracking-widest mb-2">Strategi-Galleriet:</h4>
                <div className="space-y-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-amber-200">
                    <p className="text-[11px] font-bold text-stone-800">Elev A (Konkret):</p>
                    <p className="text-[10px] text-stone-600">Bygger mönstret med plattor och räknar en och en.</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-amber-200">
                    <p className="text-[11px] font-bold text-stone-800">Elev B (Logisk/Tabell):</p>
                    <p className="text-[10px] text-stone-600">Ser att det ökar med 2 för varje steg: "Det är 2n + 6".</p>
                  </div>
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-amber-200">
                    <p className="text-[11px] font-bold text-stone-800">Elev C (Algebraisk):</p>
                    <p className="text-[10px] text-stone-600">Formulerar regeln direkt: y = 2x + 6.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-bold text-stone-800 uppercase text-xs tracking-widest">Diskussionsunderlag:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Hur ser vi "2:an" i den konkreta sandlådan?</li>
                  <li>Varför börjar tabellen på 8 plattor?</li>
                  <li>Kan vi använda grafen för att förutsäga nästa steg?</li>
                </ul>
              </div>
            </>
          ),
          footer: 'Didaktik: Från konkret till abstrakt'
        };
      default:
        return { title: '', body: <></>, footer: '' };
    }
  };

  const content = getContent();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggle}
            className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-40"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-96 bg-white shadow-2xl z-50 flex flex-col border-l border-stone-200"
          >
            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3 text-amber-600">
                  <Info size={24} />
                  <h3 className="text-xl font-serif font-medium italic">{content.title}</h3>
                </div>
                <button
                  onClick={onToggle}
                  className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
                >
                  <EyeOff size={20} />
                </button>
              </div>

              <div className="space-y-6 text-stone-600 text-sm leading-relaxed">
                {content.body}
              </div>

              <div className="mt-12 pt-6 border-t border-stone-100">
                <div className="flex items-center space-x-2 text-stone-400">
                  <HelpCircle size={16} />
                  <span className="text-xs uppercase tracking-widest font-bold">{content.footer}</span>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-stone-50 border-t border-stone-100">
              <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-2">Lärarvy</p>
              <p className="text-[11px] text-stone-500 italic">
                Denna vy är till för läraren och innehåller didaktiska tips och facit.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TeacherView;
