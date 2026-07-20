import React, { useState } from "react";
import { Sparkles, ArrowRight, CornerDownRight, Check, AlertCircle, RefreshCw } from "lucide-react";
import { Typification, ClassificationResponse } from "../types";

interface AICopilotProps {
  onApplySuggested: (typification: Typification) => void;
  typifications: Typification[];
}

const SAMPLE_CUSTOMER_QUERIES = [
  { text: "¿Me pueden cambiar la tarjeta de crédito que tengo registrada para la suscripción?", label: "Cambio de Tarjeta" },
  { text: "No me llegó la caja de este mes, quiero ver por qué correo viene y si se puede cambiar el domicilio", label: "Consultar Correo/Envío" },
  { text: "Me aparece un cobro duplicado en la tarjeta de crédito de 12500 pesos, necesito que me solucionen eso", label: "Cobro Duplicado" },
  { text: "Quiero recomendar a un amigo para que se asocie y ganar la promo de recomendación", label: "Recomendar Amigo" },
  { text: "Hola, quisiera suspender mi caja de vinos por tres meses porque viajo por trabajo", label: "Suspender Suscripción" },
];

export default function AICopilot({ onApplySuggested, typifications }: AICopilotProps) {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClassificationResponse | null>(null);
  const [matchedTypification, setMatchedTypification] = useState<Typification | null>(null);

  const handleClassify = async (textToClassify = query) => {
    const trimmed = textToClassify.trim();
    if (!trimmed) return;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setMatchedTypification(null);

    try {
      const response = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Error al comunicarse con el servidor clasificador.");
      }

      const data: ClassificationResponse = await response.json();
      setResult(data);

      if (data.success && data.suggestedId) {
        const matched = typifications.find((t) => t.id === data.suggestedId);
        if (matched) {
          setMatchedTypification(matched);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocurrió un error inesperado al clasificar.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectSample = (text: string) => {
    setQuery(text);
    handleClassify(text);
  };

  const handleApply = () => {
    if (matchedTypification) {
      onApplySuggested(matchedTypification);
    }
  };

  return (
    <div id="ai-copilot-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-brand-800 fill-brand-50" />
          <h2 className="text-base font-bold text-slate-900 font-sans">
            Asistente Copiloto IA
          </h2>
        </div>
        <span className="text-[10px] uppercase tracking-wider font-mono font-bold bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-300/30">
          Gemini 3.5 Flash
        </span>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-5">
        {/* Input Area */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-600 block">
            ¿Qué dice el socio? (Copia la transcripción del chat o describe la consulta)
          </label>
          <div className="relative">
            <textarea
              className="w-full h-24 p-3.5 pr-10 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-800 outline-none transition-all duration-200 resize-none font-sans text-slate-800 bg-slate-50/30 placeholder-slate-400"
              placeholder="Ejemplo: 'Hola, quería consultar qué precio tiene la selección del mes que viene y si me cobran envío...'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  handleClassify();
                }
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 text-xs px-1.5 py-0.5 rounded hover:bg-slate-100 font-sans"
              >
                Limpiar
              </button>
            )}
          </div>
          <p className="text-[10px] text-slate-400 font-sans italic text-right mt-1">
            Presiona <kbd className="bg-slate-100 px-1 py-0.5 rounded border">Ctrl + Enter</kbd> para clasificar
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => handleClassify()}
            disabled={isLoading || !query.trim()}
            className="flex-1 bg-brand-800 hover:bg-brand-900 text-white disabled:bg-slate-100 disabled:text-slate-400 font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-brand-100/80 text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Analizando consulta...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                <span>Clasificar con IA</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Queries */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-slate-500">Ejemplos rápidos para probar:</span>
          <div className="flex flex-wrap gap-1.5 max-h-[110px] overflow-y-auto pr-1">
            {SAMPLE_CUSTOMER_QUERIES.map((q, idx) => (
              <button
                key={idx}
                onClick={() => selectSample(q.text)}
                className="text-[11px] font-semibold text-brand-850 bg-brand-50/70 hover:bg-brand-100/85 border border-brand-100 rounded-lg px-2.5 py-1 text-left transition-all duration-150 max-w-full truncate cursor-pointer"
                title={q.text}
              >
                {q.label}
              </button>
            ))}
          </div>
        </div>

        {/* Classification Result Display */}
        <div className="flex-1 min-h-[160px] flex flex-col justify-center border border-dashed border-slate-200 rounded-xl p-4 bg-slate-50/30">
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center py-6 gap-3">
              <div className="relative">
                <div className="h-10 w-10 border-4 border-brand-100 border-t-brand-800 rounded-full animate-spin"></div>
                <Sparkles className="h-4 w-4 text-brand-800 absolute top-3 left-3 animate-ping" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 font-sans">IA Procesando consulta</p>
                <p className="text-xs text-slate-500 mt-1">
                  Mapeando texto libre contra la taxonomía de Bonvivir...
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 text-red-800 bg-red-50 border border-red-200 rounded-xl p-4.5">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold font-sans">Error de clasificación</h4>
                <p className="text-xs text-red-700/90 mt-1 leading-relaxed">
                  {error}. Asegúrate de que el servidor esté activo y la API Key configurada.
                </p>
              </div>
            </div>
          )}

          {!isLoading && !error && !result && (
            <div className="flex flex-col items-center justify-center text-center py-6 text-slate-400">
              <Sparkles className="h-8 w-8 text-slate-300 stroke-[1.5] mb-2" />
              <p className="text-xs font-semibold font-sans text-slate-500">Esperando consulta...</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Escribe arriba o haz clic en un ejemplo para iniciar la tipificación con IA.
              </p>
            </div>
          )}

          {!isLoading && !error && result && (
            <div className="flex flex-col h-full gap-4">
              {/* Confidence & Breadcrumbs */}
              <div className="flex justify-between items-start gap-3 border-b border-slate-100 pb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono">
                      Categoría Sugerida
                    </span>
                    {matchedTypification && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 border border-emerald-200 rounded font-bold font-mono">
                        {(result.confidence ? result.confidence * 100 : 0).toFixed(0)}% Coincidencia
                      </span>
                    )}
                  </div>

                  {matchedTypification ? (
                    <div className="mt-1.5 flex flex-wrap items-center text-xs gap-1 font-semibold text-slate-800">
                      <span>{matchedTypification.categoria}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span>{matchedTypification.subcategoria}</span>
                      <ArrowRight className="h-3 w-3 text-slate-400" />
                      <span className="text-brand-800">{matchedTypification.motivo}</span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 font-sans mt-1">Sin coincidencia exacta</p>
                  )}
                </div>
              </div>

              {/* AI Explanation */}
              <div className="flex-1 bg-brand-50/30 border border-brand-100/60 rounded-lg p-3">
                <span className="text-[10px] font-bold text-brand-800 tracking-wider uppercase font-mono block mb-1">
                  Explicación de la IA
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {result.explanation}
                </p>
              </div>

              {/* Exact operation detail / example match */}
              {matchedTypification && (
                <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <CornerDownRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="text-xs font-semibold text-slate-600">
                      Operación: <span className="text-slate-900 font-bold">{matchedTypification.operacionDetalle}</span>
                    </span>
                  </div>
                  <div className="bg-amber-50/50 border border-amber-200/40 rounded px-2.5 py-1.5 text-[11px] text-amber-900 leading-relaxed">
                    <span className="font-bold">Ejemplo guía: </span>
                    "{matchedTypification.ejemplo}"
                  </div>
                </div>
              )}

              {/* Apply suggestion */}
              {matchedTypification && (
                <button
                  onClick={handleApply}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-200"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Aplicar Tipificación Sugerida</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
