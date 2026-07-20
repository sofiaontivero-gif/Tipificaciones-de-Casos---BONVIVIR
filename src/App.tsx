import React, { useState } from "react";
import Header from "./components/Header";
import AICopilot from "./components/AICopilot";
import ManualSelector from "./components/ManualSelector";
import CRMPanel from "./components/CRMPanel";
import TypificationsTable from "./components/TypificationsTable";
import StatsDashboard from "./components/StatsDashboard";
import { TYPIFICATIONS_DATA } from "./data/typifications";
import { Typification } from "./types";
import { Sparkles, HelpCircle, CornerDownRight, Check, Play, BookOpen, Clock } from "lucide-react";

interface LoggedCase {
  id: string;
  timestamp: Date;
  typification: Typification;
  notes: string;
}

export default function App() {
  const [selectedTypification, setSelectedTypification] = useState<Typification | null>(null);
  const [loggedCases, setLoggedCases] = useState<LoggedCase[]>([]);

  // Fast shortcut to apply suggestions and scroll to work desk
  const handleApplySuggested = (typification: Typification) => {
    setSelectedTypification(typification);
    setTimeout(() => {
      document.getElementById("crm-draft-section")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  // Select an item manually from finder or table
  const handleSelectTypification = (typification: Typification) => {
    setSelectedTypification(typification);
  };

  // Clear current active selection
  const handleClearSelection = () => {
    setSelectedTypification(null);
  };

  // Save the case locally in session
  const handleLogCase = (typification: Typification, notes: string) => {
    const newLog: LoggedCase = {
      id: `log-${Date.now()}`,
      timestamp: new Date(),
      typification: typification,
      notes: notes,
    };
    setLoggedCases((prev) => [newLog, ...prev]);
    setSelectedTypification(null);

    // Microinteraction: scroll up to shift stats
    setTimeout(() => {
      document.getElementById("stats-dashboard-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  // Delete log from shift history
  const handleDeleteLog = (id: string) => {
    setLoggedCases((prev) => prev.filter((log) => log.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-brand-100 selection:text-brand-950 pb-12">
      {/* Brand Header */}
      <Header sessionCount={loggedCases.length} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 w-full">
        {/* Onboarding Guide/Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-950 to-brand-850 text-white rounded-2xl p-5 border border-brand-900 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-brand-200 font-sans flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse"></span>
              ¿Cómo usar el Tipificador Inteligente de Bonvivir?
            </h2>
            <p className="text-xs text-brand-100 leading-relaxed max-w-3xl">
              Este espacio asiste a los asesores del canal de atención de <strong>Club Bonvivir</strong>. Tienes tres formas de encontrar la tipificación del Excel oficial: consulta la <strong>IA Copiloto</strong> con lo que te diga el socio, navega la <strong>taxonomía por columnas</strong>, o busca directamente en la <strong>guía de referencia</strong>. Luego completa las notas y copia el registro formateado en un clic.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-brand-900/60 px-3 py-1.5 rounded-lg border border-brand-700/60 text-[11px] font-mono shrink-0">
            <Clock className="h-3.5 w-3.5 text-brand-300 shrink-0" />
            <span className="text-brand-100 font-bold">Respuesta Media IA: ~0.8s</span>
          </div>
        </div>

        {/* SECTION 1: AI Copilot & Active CRM Registration Board */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left panel: AI Query tool */}
          <AICopilot
            typifications={TYPIFICATIONS_DATA}
            onApplySuggested={handleApplySuggested}
          />

          {/* Right panel: Active CRM Ficha drafting */}
          <CRMPanel
            selectedTypification={selectedTypification}
            onClearSelection={handleClearSelection}
            onLogCase={handleLogCase}
          />
        </div>

        {/* SECTION 2: Manual Taxonomy Finder (macOS style columns) */}
        <ManualSelector
          typifications={TYPIFICATIONS_DATA}
          selectedTypification={selectedTypification}
          onSelect={handleSelectTypification}
        />

        {/* SECTION 3: All 67 Entries Reference Table */}
        <TypificationsTable
          typifications={TYPIFICATIONS_DATA}
          selectedTypification={selectedTypification}
          onSelect={handleSelectTypification}
        />

        {/* SECTION 4: Logs & Metrics of current shift */}
        <div id="stats-dashboard-section" className="scroll-mt-6">
          <StatsDashboard
            loggedCases={loggedCases}
            onDeleteLog={handleDeleteLog}
          />
        </div>
      </main>
    </div>
  );
}

