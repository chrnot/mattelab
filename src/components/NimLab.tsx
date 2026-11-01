import React, { useState, useRef, useEffect } from 'react';
import { Download, ExternalLink, Sparkles, Settings, Volume2, VolumeX, BookOpen, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NimLab: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { theme, toggleTheme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('nim_sound_enabled');
      return saved !== '0';
    } catch {
      return true;
    }
  });

  const settingsRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleOpenRules = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ type: 'OPEN_RULES' }, '*');
      try {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow.document;
        const modal = doc.getElementById('rulesModal');
        if (modal) {
          modal.classList.remove('hidden');
        }
      } catch {}
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setIsSettingsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Listen for messages from the embedded Nim game
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data) return;
      if (e.data.type === 'NIM_SOUND_STATUS') {
        setSoundEnabled(!!e.data.enabled);
      } else if (e.data.type === 'NIM_THEME_STATUS') {
        if (e.data.theme === 'light' || e.data.theme === 'dark') {
          setTheme(e.data.theme);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setTheme]);

  // Synchronize theme to iframe whenever theme state changes
  useEffect(() => {
    try {
      const iframeWin = iframeRef.current?.contentWindow as any;
      if (iframeWin && iframeWin.ThemeManager) {
        iframeWin.ThemeManager.set(theme, false);
      }
    } catch {}

    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'SET_THEME', theme }, '*');
    } catch {}
  }, [theme]);

  const handleDownloadHtml = async () => {
    try {
      const response = await fetch('/nim.html');
      const htmlText = await response.text();
      const blob = new Blob([htmlText], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nim_mattelab.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Kunde inte ladda ner filen:', e);
    }
  };

  const handleOpenStandalone = () => {
    window.open('/nim.html', '_blank');
  };

  const handleToggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    toggleTheme();

    try {
      const iframeWin = iframeRef.current?.contentWindow as any;
      if (iframeWin && iframeWin.ThemeManager) {
        iframeWin.ThemeManager.set(nextTheme, false);
      }
    } catch {}

    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'SET_THEME', theme: nextTheme }, '*');
    } catch {}
  };

  const toggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    try {
      localStorage.setItem('nim_sound_enabled', nextState ? '1' : '0');
    } catch {}

    // Direct access to iframe window if same-origin
    try {
      const iframeWin = iframeRef.current?.contentWindow as any;
      if (iframeWin && iframeWin.SoundFx) {
        iframeWin.SoundFx.enabled = nextState;
        iframeWin.UIController?.updateSoundUI?.();
        if (nextState) {
          iframeWin.SoundFx.playStickClick?.();
        }
      }
    } catch {}

    // postMessage as fallback
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'SET_SOUND', enabled: nextState }, '*');
    } catch {}
  };

  const handleIframeLoad = () => {
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'SET_SOUND', enabled: soundEnabled }, '*');
      iframeRef.current?.contentWindow?.postMessage({ type: 'SET_THEME', theme: theme }, '*');
    } catch {}
  };

  return (
    <div className={`flex-1 h-full flex flex-col overflow-hidden transition-colors duration-200 ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
    }`}>
      {/* Top action toolbar */}
      <div className={`px-4 py-2 flex flex-wrap items-center justify-between gap-3 z-20 border-b transition-colors duration-200 ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            NIM
          </span>
        </div>

        <div className="flex items-center gap-2 relative">
          <button
            onClick={handleOpenStandalone}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
            }`}
            title="Öppna i fullskärm i ny webbläsarflik"
          >
            <ExternalLink className={`w-3.5 h-3.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Ny flik</span>
          </button>

          {/* Regler-ikon (endast ikon utan text, till vänster om inställningar) */}
          <button
            onClick={handleOpenRules}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-lg border flex items-center justify-center transition active:scale-95 cursor-pointer ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 border-slate-700' 
                : 'bg-slate-50 hover:bg-slate-100 text-amber-600 hover:text-amber-700 border-slate-300'
            }`}
            title="Regler"
            aria-label="Regler"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Inställningsikon med meny */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${
                isSettingsOpen
                  ? (isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/30' : 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-400/40')
                  : (isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300')
              }`}
              title="Inställningar"
              aria-label="Inställningar"
              aria-expanded={isSettingsOpen}
            >
              <Settings className={`w-3.5 h-3.5 transition-transform duration-300 ${
                isSettingsOpen ? 'rotate-90 text-amber-500' : (isDark ? 'text-slate-400' : 'text-slate-500')
              }`} />
              <span className="hidden sm:inline">Inställningar</span>
            </button>

            {/* Dropdown-meny under inställningsikonen */}
            {isSettingsOpen && (
              <div className={`absolute right-0 mt-2 w-64 rounded-xl border shadow-2xl p-2 z-50 flex flex-col gap-1 transition-colors ${
                isDark 
                  ? 'bg-slate-900/98 backdrop-blur-md border-slate-700/80 text-slate-200' 
                  : 'bg-white/98 backdrop-blur-md border-slate-200 text-slate-800'
              }`}>
                <div className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-b flex items-center justify-between mb-0.5 ${
                  isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'
                }`}>
                  <span>Inställningar</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                </div>

                {/* Alternativ 1: Tema-switch (Växla mellan Ljust och Mörkt läge) */}
                <button
                  type="button"
                  onClick={handleToggleTheme}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 transition cursor-pointer group ${
                    isDark ? 'hover:bg-slate-800 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-950'
                  }`}
                  title={`Klicka för att växla till ${isDark ? 'ljust' : 'mörkt'} läge`}
                >
                  <div className="flex items-center gap-2">
                    {isDark ? (
                      <Moon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                    ) : (
                      <Sun className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-xs font-medium">Tema</span>
                  </div>

                  {/* Interaktiv switch-slider */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-medium ${isDark ? 'text-indigo-300' : 'text-amber-600'}`}>
                      {isDark ? 'Mörkt' : 'Ljust'}
                    </span>
                    <div
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out relative flex items-center ${
                        isDark ? 'bg-indigo-600' : 'bg-amber-500'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform duration-200 ease-in-out flex items-center justify-center text-[9px] ${
                          isDark ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      >
                        {isDark ? '🌙' : '☀️'}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Alternativ 2: Ljud: på/av */}
                <button
                  type="button"
                  onClick={toggleSound}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 transition cursor-pointer group ${
                    isDark ? 'hover:bg-slate-800 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-950'
                  }`}
                  title={soundEnabled ? 'Klicka för att stänga av ljud' : 'Klicka för att sätta på ljud'}
                >
                  <div className="flex items-center gap-2">
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
                    ) : (
                      <VolumeX className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                    )}
                    <span className="text-xs font-medium">Ljud</span>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                      soundEnabled
                        ? (isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                        : (isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-rose-50 text-rose-700 border-rose-200')
                    }`}
                  >
                    {soundEnabled ? 'På' : 'Av'}
                  </span>
                </button>

                {/* Alternativ 3: Ladda ner .html */}
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadHtml();
                    setIsSettingsOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center justify-between gap-2 transition cursor-pointer group ${
                    isDark ? 'hover:bg-slate-800 text-slate-200 hover:text-white' : 'hover:bg-slate-100 text-slate-700 hover:text-slate-950'
                  }`}
                  title="Ladda ner som en enda fristående HTML-fil utan externa byggsteg"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-4 h-4 text-amber-500 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-medium">Ladda ner .html</span>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${
                    isDark ? 'text-slate-400 bg-slate-800 border-slate-700/60' : 'text-slate-500 bg-slate-100 border-slate-200'
                  }`}>
                    fil
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded pristine Nim app */}
      <div className="flex-1 w-full h-full relative">
        <iframe
          ref={iframeRef}
          onLoad={handleIframeLoad}
          src="/nim.html"
          title="Nim Spel"
          className="w-full h-full border-0 absolute inset-0"
        />
      </div>
    </div>
  );
};

export default NimLab;

