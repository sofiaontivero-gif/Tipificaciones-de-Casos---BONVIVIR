import React, { useState, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, Copy, Check, Filter, BookOpen } from "lucide-react";
import { Typification } from "../types";

interface TypificationsTableProps {
  typifications: Typification[];
  selectedTypification: Typification | null;
  onSelect: (typification: Typification) => void;
}

export default function TypificationsTable({
  typifications,
  selectedTypification,
  onSelect,
}: TypificationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("TODAS");
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const itemsPerPage = 8;

  // Categories list for filter dropdown
  const categoryOptions = useMemo(() => {
    return ["TODAS", ...Array.from(new Set(typifications.map((t) => t.categoria)))];
  }, [typifications]);

  // Filtered list based on search term and category selection
  const filteredList = useMemo(() => {
    return typifications.filter((t) => {
      const matchesCategory =
        selectedCategoryFilter === "TODAS" || t.categoria === selectedCategoryFilter;

      const normalizedSearch = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !normalizedSearch ||
        t.categoria.toLowerCase().includes(normalizedSearch) ||
        t.subcategoria.toLowerCase().includes(normalizedSearch) ||
        t.motivo.toLowerCase().includes(normalizedSearch) ||
        t.operacionDetalle.toLowerCase().includes(normalizedSearch) ||
        t.ejemplo.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [typifications, searchTerm, selectedCategoryFilter]);

  // Handle page resets when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategoryFilter]);

  // Paginated list calculations
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredList, currentPage]);

  const handleCopyPath = (e: React.MouseEvent, item: Typification) => {
    e.stopPropagation();
    const fullPath = `${item.categoria} > ${item.subcategoria} > ${item.motivo} (${item.operacionDetalle})`;
    navigator.clipboard.writeText(fullPath);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 flex flex-col gap-4">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-brand-800" />
          <h3 className="text-base font-bold text-slate-900 font-sans">
            Guía de Referencia Completa ({typifications.length} líneas)
          </h3>
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Mostrando <span className="font-bold text-brand-800">{filteredList.length}</span> resultados filtrados
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por palabra clave, motivo, detalle o ejemplo..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-100 focus:border-brand-800 outline-none transition-all bg-slate-50/30 placeholder-slate-400 text-slate-800"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="relative min-w-[160px] flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            className="w-full border border-slate-200 bg-white rounded-xl py-2 px-3 text-xs focus:ring-2 focus:ring-brand-100 focus:border-brand-800 outline-none cursor-pointer text-slate-700"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          >
            {categoryOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === "TODAS" ? "Todas las Categorías" : opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
          <thead>
            <tr className="bg-slate-50/70 border-b border-slate-200 text-[11px] font-bold uppercase text-slate-600 tracking-wider">
              <th className="p-3 w-[150px]">Categoría</th>
              <th className="p-3 w-[180px]">Subcategoría</th>
              <th className="p-3 w-[180px]">Motivo</th>
              <th className="p-3 w-[180px]">Detalle Acción</th>
              <th className="p-3 w-[250px]">Ejemplo / Frase Clave</th>
              <th className="p-3 w-[120px] text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-8 text-slate-400 italic">
                  No se encontraron tipificaciones con los criterios de búsqueda actuales.
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => {
                const isSelected = selectedTypification?.id === item.id;
                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`hover:bg-slate-50/70 transition-colors duration-150 cursor-pointer ${
                      isSelected
                        ? "bg-brand-50/30 border-l-2 border-l-brand-800"
                        : "even:bg-slate-50/10"
                    }`}
                  >
                    <td className="p-3 font-semibold text-slate-900 truncate">
                      <span className="bg-slate-200/50 text-slate-800 text-[10px] px-2 py-0.5 rounded-full border border-slate-300/30 font-bold">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="p-3 text-slate-700 font-semibold truncate" title={item.subcategoria}>
                      {item.subcategoria}
                    </td>
                    <td className="p-3 text-slate-700 truncate font-medium" title={item.motivo}>
                      {item.motivo}
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-800" title={item.operacionDetalle}>
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        item.operacionDetalle === "SE BRINDA INFORMACIÓN"
                          ? "bg-brand-50 text-brand-800 border border-brand-200/50"
                          : item.operacionDetalle === "ONE SHOT"
                          ? "bg-purple-50 text-purple-800 border border-purple-200/50"
                          : item.operacionDetalle === "SE CARGA CLIENTE POTENCIAL"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200/50"
                          : "bg-amber-50 text-amber-800 border border-amber-200/50"
                      }`}>
                        {item.operacionDetalle}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600 leading-normal line-clamp-2 select-text" title={item.ejemplo}>
                      "{item.ejemplo}"
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {/* Copy Path */}
                        <button
                          onClick={(e) => handleCopyPath(e, item)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-800 transition-colors"
                          title="Copiar ruta al portapapeles"
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                        {/* Select */}
                        <button
                          onClick={() => onSelect(item)}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                            isSelected
                              ? "bg-brand-800 text-white shadow-md shadow-brand-100/50"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {isSelected ? "Listo" : "Elegir"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="text-xs text-slate-500">
            Página <span className="font-semibold text-slate-800">{currentPage}</span> de{" "}
            <span className="font-semibold text-slate-800">{totalPages}</span>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
