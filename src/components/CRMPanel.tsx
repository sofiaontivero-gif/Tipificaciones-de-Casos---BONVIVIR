import React, { useState, useEffect } from "react";
import { FileEdit, Clipboard, Check, RefreshCw, Bookmark, Calendar, User } from "lucide-react";
import { Typification } from "../types";

interface CRMPanelProps {
  selectedTypification: Typification | null;
  onLogCase: (typification: Typification, notes: string) => void;
  onClearSelection: () => void;
}

export default function CRMPanel({
  selectedTypification,
  onLogCase,
  onClearSelection,
}: CRMPanelProps) {
  const [notes, setNotes] = useState("");
  const [copiedTextType, setCopiedTextType] = useState<"PATH" | "FULL" | null>(null);

  // Clear notes when typification changes or is cleared
  useEffect(() => {
    if (!selectedTypification) {
      setNotes("");
    }
  }, [selectedTypification]);

  // Format CRM block
  const crmBlockText = selectedTypification
    ? `[REGISTRO DE CASO BONVIVIR]
--------------------------------------------------
Canal de Origen: ${selectedTypification.origen}
Área de Negocio: ${selectedTypification.area}
Grupo de Llamada: ${selectedTypification.grupo}
Categoría: ${selectedTypification.categoria}
Subcategoría: ${selectedTypification.subcategoria}
Motivo de Caso: ${selectedTypification.motivo}
Acción Detalle: ${selectedTypification.operacionDetalle}
--------------------------------------------------
[NOTAS DEL ASESOR]:
${notes ? notes : "(Sin comentarios adicionales)"}
--------------------------------------------------
Registro: ${new Date().toLocaleString("es-AR")}
--------------------------------------------------`
    : "";

  const handleCopyPath = () => {
    if (!selectedTypification) return;
    const pathOnly = `${selectedTypification.categoria} > ${selectedTypification.subcategoria} > ${selectedTypification.motivo} [${selectedTypification.operacionDetalle}]`;
    navigator.clipboard.writeText(pathOnly);
    setCopiedTextType("PATH");
    setTimeout(() => setCopiedTextType(null), 1500);
  };

  const handleCopyFull = () => {
    if (!selectedTypification) return;
    navigator.clipboard.writeText(crmBlockText);
    setCopiedTextType("FULL");
    setTimeout(() => setCopiedTextType(null), 1500);
  };

  const handleSubmit = () => {
    if (!selectedTypification) return;
    onLogCase(selectedTypification, notes);
    setNotes("");
  };

  return (
    <div id="crm-draft-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileEdit className="h-5 w-5 text-brand-800" />
          <h2 className="text-base font-bold text-slate-900 font-sans">
            Ficha de Registro CRM (Borrador)
          </h2>
        </div>
        {selectedTypification && (
          <button
            onClick={onClearSelection}
            className="text-xs text-brand-800 hover:text-brand-900 hover:underline cursor-pointer font-bold"
          >
            Limpiar ficha
          </button>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        {!selectedTypification ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-10 px-4 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            <Bookmark className="h-10 w-10 text-slate-300 stroke-[1.5] mb-2.5" />
            <h4 className="text-sm font-bold text-slate-700 font-sans">Ficha vacía</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
              Selecciona una categoría desde el Navegador Manual, de la Guía de Referencia o haz una consulta al Copiloto de IA para generar tu ficha.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4">
            {/* Active Path Header */}
            <div className="bg-brand-50/30 border border-brand-100 rounded-xl p-4">
              <span className="text-[10px] font-bold text-brand-800 tracking-wider uppercase font-mono block">
                Ruta Taxonómica Seleccionada
              </span>
              <div className="mt-1 flex flex-wrap items-center text-xs gap-1 font-semibold text-slate-800 leading-normal">
                <span className="text-slate-500 font-normal">{selectedTypification.categoria}</span>
                <span className="text-slate-400 font-normal">/</span>
                <span className="text-slate-500 font-normal">{selectedTypification.subcategoria}</span>
                <span className="text-slate-400 font-normal">/</span>
                <span className="text-brand-800 font-bold">{selectedTypification.motivo}</span>
              </div>
              <div className="mt-2.5 pt-2.5 border-t border-brand-100/60 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Acción: <strong className="text-slate-900 font-bold">{selectedTypification.operacionDetalle}</strong></span>
                <span className="text-[10px] uppercase font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded border">
                  ID: {selectedTypification.id}
                </span>
              </div>
            </div>

            {/* Agent Comments */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Notas del Asesor (se anexarán al registro CRM)
              </label>
              <textarea
                className="w-full h-20 p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-800 outline-none transition-all resize-none font-sans text-stone-800 placeholder-stone-400"
                placeholder="Ejemplo: 'Socio disconforme con el correo asignado. Solicita cambio de Andreani a Correo Argentino. Se deriva gestión...'"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Copy Actions */}
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={handleCopyPath}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:border-brand-800 hover:bg-brand-50/20 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-900 transition-all duration-150 cursor-pointer"
              >
                {copiedTextType === "PATH" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Ruta Copiada!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="h-3.5 w-3.5" />
                    <span>Copiar Ruta CRM</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCopyFull}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:border-brand-800 hover:bg-brand-50/20 rounded-xl text-xs font-semibold text-slate-700 hover:text-brand-900 transition-all duration-150 cursor-pointer"
              >
                {copiedTextType === "FULL" ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Bloque Copiado!</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="h-3.5 w-3.5" />
                    <span>Copiar Bloque CRM</span>
                  </>
                )}
              </button>
            </div>

            {/* Structured Box Preview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex-1 overflow-y-auto max-h-[140px]">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase font-mono block mb-1">
                Previsualización del Texto CRM
              </span>
              <pre className="text-[10px] font-mono text-slate-600 leading-tight whitespace-pre">
                {crmBlockText}
              </pre>
            </div>

            {/* Submit registry */}
            <button
              onClick={handleSubmit}
              className="w-full bg-brand-800 hover:bg-brand-900 text-white font-bold py-2.5 rounded-xl text-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-brand-100/80"
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span>Guardar Caso en Turno Actual</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
