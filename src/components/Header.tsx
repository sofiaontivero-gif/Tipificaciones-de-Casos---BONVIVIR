import React, { useState, useEffect } from "react";
import { Sparkles, Clock, ShieldCheck, Activity } from "lucide-react";

interface HeaderProps {
  sessionCount: number;
}

export default function Header({ sessionCount }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm relative z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Left Brand Area */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* 6-dot grid logo representing Bonvivir */}
            <div className="grid grid-cols-2 gap-1.5 bg-brand-800 p-2.5 rounded-xl shadow-md shadow-brand-900/10 select-none w-10 h-10 items-center justify-center shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-brand-800 leading-none tracking-wider font-sans">
                  BONVIVIR
                </h1>
                <span className="text-[10px] bg-brand-50 text-brand-800 px-2 py-0.5 rounded-full border border-brand-100 font-bold uppercase tracking-wider">
                  Copiloto Call Center
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Sistema Inteligente de Tipificación • v2.4
              </p>
            </div>
          </div>
        </div>

        {/* Right Info Widgets */}
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-end">
          {/* Shift Tracker Badge */}
          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
              {sessionCount} {sessionCount === 1 ? "Caso Registrado" : "Casos Registrados"}
            </span>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

          {/* Time Widget */}
          <div className="bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl flex items-center gap-2 text-slate-600 shadow-sm">
            <Clock className="h-3.5 w-3.5 text-brand-600" />
            <span className="text-xs font-semibold font-mono tracking-wider text-slate-700">
              {currentTime || "--:--:--"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
