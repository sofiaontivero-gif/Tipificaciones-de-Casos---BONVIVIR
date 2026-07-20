import React, { useState, useEffect } from "react";
import { Folder, FolderOpen, Tag, HelpCircle, ChevronRight, FileText, Check } from "lucide-react";
import { Typification } from "../types";

interface ManualSelectorProps {
  typifications: Typification[];
  selectedTypification: Typification | null;
  onSelect: (typification: Typification) => void;
}

export default function ManualSelector({
  typifications,
  selectedTypification,
  onSelect,
}: ManualSelectorProps) {
  // State for selections in each column
  const [selectedCat, setSelectedCat] = useState<string>("");
  const [selectedSub, setSelectedSub] = useState<string>("");
  const [selectedMot, setSelectedMot] = useState<string>("");

  // Update dropdown levels if external selection happens (e.g. from AI or table)
  useEffect(() => {
    if (selectedTypification) {
      setSelectedCat(selectedTypification.categoria);
      setSelectedSub(selectedTypification.subcategoria);
      setSelectedMot(selectedTypification.motivo);
    }
  }, [selectedTypification]);

  // Unique columns lists based on previous selections
  const categories = Array.from(new Set(typifications.map((t) => t.categoria)));

  const subcategories = selectedCat
    ? Array.from(
        new Set(
          typifications
            .filter((t) => t.categoria === selectedCat)
            .map((t) => t.subcategoria)
        )
      )
    : [];

  const motivos = (selectedCat && selectedSub)
    ? Array.from(
        new Set(
          typifications
            .filter((t) => t.categoria === selectedCat && t.subcategoria === selectedSub)
            .map((t) => t.motivo)
        )
      )
    : [];

  const filteredItems = (selectedCat && selectedSub && selectedMot)
    ? typifications.filter(
        (t) =>
          t.categoria === selectedCat &&
          t.subcategoria === selectedSub &&
          t.motivo === selectedMot
      )
    : [];

  const handleCatSelect = (cat: string) => {
    setSelectedCat(cat);
    setSelectedSub("");
    setSelectedMot("");
  };

  const handleSubSelect = (sub: string) => {
    setSelectedSub(sub);
    setSelectedMot("");
  };

  const handleMotSelect = (mot: string) => {
    setSelectedMot(mot);
  };

  const resetSelection = () => {
    setSelectedCat("");
    setSelectedSub("");
    setSelectedMot("");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col gap-4">
      {/* Title */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-brand-800" />
          <h3 className="text-base font-bold text-slate-900 font-sans">
            Navegador de Taxonomía Manual
          </h3>
        </div>
        {(selectedCat || selectedSub || selectedMot) && (
          <button
            onClick={resetSelection}
            className="text-xs text-brand-800 hover:text-brand-900 hover:underline cursor-pointer font-bold"
          >
            Resetear filtros
          </button>
        )}
      </div>

      {/* 4-Column Flow Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 min-h-[300px]">
        {/* Column 1: Categoría */}
        <div className="border border-slate-200 rounded-xl bg-slate-50/30 flex flex-col overflow-hidden shadow-inner">
          <div className="bg-slate-100/70 px-3 py-2.5 border-b border-slate-200 flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
              1. Categoría
            </span>
            <span className="text-[10px] bg-slate-250 text-slate-700 font-mono px-1.5 py-0.5 rounded-full font-bold">
              {categories.length}
            </span>
          </div>
          <div className="p-1.5 flex-1 overflow-y-auto max-h-[250px] space-y-1">
            {categories.map((cat) => {
              const isSelected = selectedCat === cat;
              return (
                <button
                  key={cat}
                  onClick={() => handleCatSelect(cat)}
                  className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? "bg-brand-800 text-white font-bold shadow-md shadow-brand-100/50"
                      : "text-slate-700 hover:bg-slate-200/60"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Folder className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-brand-200" : "text-slate-400"}`} />
                    <span className="truncate">{cat}</span>
                  </div>
                  <ChevronRight className={`h-3 w-3 shrink-0 ${isSelected ? "text-white" : "text-slate-400"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Column 2: Subcategoría */}
        <div className="border border-slate-200 rounded-xl bg-slate-50/30 flex flex-col overflow-hidden shadow-inner">
          <div className="bg-slate-100/70 px-3 py-2.5 border-b border-slate-200 flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
              2. Subcategoría
            </span>
            <span className="text-[10px] bg-slate-250 text-slate-700 font-mono px-1.5 py-0.5 rounded-full font-bold">
              {subcategories.length}
            </span>
          </div>
          <div className="p-1.5 flex-1 overflow-y-auto max-h-[250px] space-y-1">
            {!selectedCat ? (
              <div className="h-full flex items-center justify-center text-center p-4 text-slate-400 text-xs italic font-sans py-12">
                Selecciona una categoría primero
              </div>
            ) : (
              subcategories.map((sub) => {
                const isSelected = selectedSub === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => handleSubSelect(sub)}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-brand-800 text-white font-bold shadow-md shadow-brand-100/50"
                        : "text-slate-700 hover:bg-slate-200/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Tag className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-brand-200" : "text-slate-400"}`} />
                      <span className="truncate">{sub}</span>
                    </div>
                    <ChevronRight className={`h-3 w-3 shrink-0 ${isSelected ? "text-white" : "text-slate-400"}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 3: Motivo */}
        <div className="border border-slate-200 rounded-xl bg-slate-50/30 flex flex-col overflow-hidden shadow-inner">
          <div className="bg-slate-100/70 px-3 py-2.5 border-b border-slate-200 flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
              3. Motivo
            </span>
            <span className="text-[10px] bg-slate-250 text-slate-700 font-mono px-1.5 py-0.5 rounded-full font-bold">
              {motivos.length}
            </span>
          </div>
          <div className="p-1.5 flex-1 overflow-y-auto max-h-[250px] space-y-1">
            {!selectedSub ? (
              <div className="h-full flex items-center justify-center text-center p-4 text-slate-400 text-xs italic font-sans py-12">
                Selecciona una subcategoría
              </div>
            ) : (
              motivos.map((mot) => {
                const isSelected = selectedMot === mot;
                return (
                  <button
                    key={mot}
                    onClick={() => handleMotSelect(mot)}
                    className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-brand-800 text-white font-bold shadow-md shadow-brand-100/50"
                        : "text-slate-700 hover:bg-slate-200/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Tag className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-brand-200" : "text-slate-400"}`} />
                      <span className="truncate">{mot}</span>
                    </div>
                    <ChevronRight className={`h-3 w-3 shrink-0 ${isSelected ? "text-white" : "text-slate-400"}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 4: Operación / Acción */}
        <div className="border border-slate-200 rounded-xl bg-slate-50/30 flex flex-col overflow-hidden shadow-inner">
          <div className="bg-slate-100/70 px-3 py-2.5 border-b border-slate-200 flex justify-between items-center">
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
              4. Acción / Detalle
            </span>
            <span className="text-[10px] bg-slate-250 text-slate-700 font-mono px-1.5 py-0.5 rounded-full font-bold">
              {filteredItems.length}
            </span>
          </div>
          <div className="p-2 flex-1 overflow-y-auto max-h-[250px] space-y-3">
            {!selectedMot ? (
              <div className="h-full flex items-center justify-center text-center p-4 text-slate-400 text-xs italic font-sans py-12">
                Selecciona un motivo
              </div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedTypification?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`p-3 rounded-xl border text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-brand-50/30 border-brand-800 text-brand-950 ring-1 ring-brand-800 shadow-md"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        <FileText className={`h-3.5 w-3.5 ${isSelected ? "text-brand-800" : "text-slate-400"}`} />
                        <span className="text-xs font-bold font-sans">
                          {item.operacionDetalle}
                        </span>
                      </div>
                      {isSelected && (
                        <span className="bg-brand-800 text-white rounded-full p-0.5 flex items-center justify-center shadow-sm">
                          <Check className="h-2.5 w-2.5 stroke-[3px]" />
                        </span>
                      )}
                    </div>

                    <div className="mt-2 bg-slate-100/70 border border-slate-200/40 rounded px-2 py-1.5 text-[10px] text-slate-600 leading-relaxed font-sans font-medium">
                      <span className="font-bold text-brand-800">Ejemplo: </span>
                      "{item.ejemplo}"
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(item);
                      }}
                      className={`w-full mt-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        isSelected
                          ? "bg-brand-800 text-white shadow-md shadow-brand-100/50"
                          : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                      }`}
                    >
                      {isSelected ? "Seleccionado" : "Seleccionar"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
