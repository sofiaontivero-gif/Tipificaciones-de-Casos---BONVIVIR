import React, { useState } from "react";
import { BarChart3, History, Trash2, Clipboard, Check, Calendar, Activity, Wine } from "lucide-react";
import { Typification } from "../types";

interface LoggedCase {
  id: string;
  timestamp: Date;
  typification: Typification;
  notes: string;
}

interface StatsDashboardProps {
  loggedCases: LoggedCase[];
  onDeleteLog: (id: string) => void;
}

export default function StatsDashboard({ loggedCases, onDeleteLog }: StatsDashboardProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calculate metrics
  const totalCount = loggedCases.length;

  const categoryStats = React.useMemo(() => {
    const stats: Record<string, { count: number; color: string; bg: string; border: string }> = {
      EVENTO: { count: 0, color: "bg-rose-700", bg: "bg-rose-50", border: "border-rose-100" },
      FACTURACION: { count: 0, color: "bg-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
      PRODUCTO: { count: 0, color: "bg-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
      ENTREGA: { count: 0, color: "bg-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
      COMUNICACIONES: { count: 0, color: "bg-purple-600", bg: "bg-purple-50", border: "border-purple-100" },
      COMERCIAL: { count: 0, color: "bg-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    };

    loggedCases.forEach((log) => {
      const cat = log.typification.categoria;
      if (stats[cat]) {
        stats[cat].count += 1;
      } else {
        // Fallback fallback if any unknown category appears
        stats[cat] = { count: 1, color: "bg-stone-600", bg: "bg-stone-50", border: "border-stone-100" };
      }
    });

    return Object.entries(stats).map(([category, info]) => ({
      category,
      count: info.count,
      percentage: totalCount > 0 ? (info.count / totalCount) * 100 : 0,
      color: info.color,
      bg: info.bg,
      border: info.border,
    }));
  }, [loggedCases, totalCount]);

  const handleCopyLogText = (log: LoggedCase) => {
    const text = `[CASO LOGUEADO]
Socio consulta: ${log.notes || "(Sin notas)"}
Tipificación: ${log.typification.categoria} > ${log.typification.subcategoria} > ${log.typification.motivo} (${log.typification.operacionDetalle})
Canal: ${log.typification.origen}
Fecha de Registro: ${log.timestamp.toLocaleTimeString()}`;
    navigator.clipboard.writeText(text);
    setCopiedId(log.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Category Stats Bar Grid */}
      <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <BarChart3 className="h-5 w-5 text-brand-800" />
          <h3 className="text-base font-bold text-slate-900 font-sans">
            Métricas de la Jornada
          </h3>
        </div>

        {totalCount === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 text-slate-400">
            <Activity className="h-8 w-8 text-slate-300 stroke-[1.5] mb-2" />
            <p className="text-xs font-semibold font-sans text-slate-500">Sin datos de actividad</p>
            <p className="text-[10px] text-slate-400 max-w-[180px] mt-0.5 leading-relaxed">
              Los casos que registres durante este turno se reflejarán aquí en tiempo real.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1 justify-center">
            {/* Quick summary numbers */}
            <div className="grid grid-cols-2 gap-3 mb-1">
              <div className="bg-brand-50/55 rounded-xl p-3 border border-brand-100/50 text-center">
                <span className="text-[10px] font-bold text-brand-800/80 uppercase font-mono block">
                  Total Resueltos
                </span>
                <span className="text-2xl font-bold text-brand-950 block mt-0.5">
                  {totalCount}
                </span>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/50 text-center flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase font-mono block">
                  Rendimiento
                </span>
                <span className="text-xs font-bold text-slate-700 block mt-1">
                  Estable • Activo
                </span>
              </div>
            </div>

            {/* Custom proportion bars list */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono block">
                Distribución por Categorías
              </span>

              <div className="space-y-2.5">
                {categoryStats.map((stat) => (
                  <div key={stat.category} className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className={`h-2.5 w-2.5 rounded-full ${stat.color}`}></span>
                        {stat.category}
                      </span>
                      <span className="font-mono text-[11px] text-slate-500">
                        <strong className="text-slate-800 font-bold">{stat.count}</strong> (
                        {stat.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    {/* Visual Bar Container */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${stat.color}`}
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shift logs list */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-brand-800" />
            <h3 className="text-base font-bold text-slate-900 font-sans">
              Historial del Turno Reciente
            </h3>
          </div>
          {totalCount > 0 && (
            <span className="text-[10px] bg-brand-800 text-white font-bold px-2.5 py-0.5 rounded-full font-mono">
              {totalCount} Registros
            </span>
          )}
        </div>

        {totalCount === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center text-center py-14 text-slate-400">
            <History className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2" />
            <h4 className="text-xs font-bold text-slate-700 font-sans">No hay casos en este turno</h4>
            <p className="text-[11px] text-slate-500 max-w-xs mt-0.5 leading-relaxed">
              Completa los datos de un caso y haz clic en "Guardar Caso" para registrar el log de tu llamada en este panel.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {loggedCases.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50/50 border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-150 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {/* Left case path & note */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] bg-brand-800 text-white font-mono font-bold px-2 py-0.5 rounded shadow-sm shadow-brand-100/50">
                      {log.typification.categoria}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {log.typification.subcategoria} • {log.typification.motivo}
                    </span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 font-mono px-1.5 py-0.2 rounded font-bold">
                      {log.typification.operacionDetalle}
                    </span>
                  </div>

                  {log.notes ? (
                    <p className="text-xs text-slate-700 mt-1.5 font-sans italic line-clamp-1">
                      "{log.notes}"
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-1.5 font-sans italic">
                      Sin notas de asesor registradas.
                    </p>
                  )}

                  <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400 font-sans">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {log.timestamp.toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>•</span>
                    <span>Origen: {log.typification.origen}</span>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleCopyLogText(log)}
                    className="p-1.5 bg-white border border-slate-200 hover:border-brand-800 hover:bg-brand-50 text-slate-500 hover:text-brand-900 rounded-lg transition-all"
                    title="Copiar log completo para el CRM"
                  >
                    {copiedId === log.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Clipboard className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => onDeleteLog(log.id)}
                    className="p-1.5 bg-white border border-slate-200 hover:border-red-600 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg transition-all"
                    title="Borrar de la sesión"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
