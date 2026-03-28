import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Eye, EyeOff, Info, HelpCircle } from 'lucide-react';

import { Lab } from '../types';

interface TeacherViewProps {
  currentLab: Lab;
}

const TeacherView: React.FC<TeacherViewProps> = ({ currentLab }) => {
  const [isOpen, setIsOpen] = useState(false);

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
      default:
        return { title: '', body: <></>, footer: '' };
    }
  };

  const content = getContent();

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all flex items-center space-x-2 ${
          isOpen ? 'bg-stone-800 text-white' : 'bg-white text-stone-800 border border-stone-200'
        }`}
      >
        {isOpen ? <EyeOff size={24} /> : <Eye size={24} />}
        <span className="font-bold text-sm uppercase tracking-widest">Lärarvy</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-96 p-8 bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
          >
            <div className="flex flex-col space-y-6">
              <div className="flex items-center space-x-3 text-amber-600">
                <Info size={24} />
                <h3 className="text-xl font-serif font-medium italic">{content.title}</h3>
              </div>

              <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
                {content.body}
              </div>

              <div className="pt-4 border-t border-stone-100">
                <div className="flex items-center space-x-2 text-stone-400">
                  <HelpCircle size={16} />
                  <span className="text-xs uppercase tracking-widest">{content.footer}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeacherView;
