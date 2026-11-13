import React from "react";
import { Filter, Search } from "lucide-react";
import { GEO_HIERARCHY, getAvailableStates, getAvailableCities } from "../data/geoHierarchy.js";
import { SECTORS } from "../data/sectors.js";

/**
 * Painel de filtros com Drill-Down Geográfico em cascata e busca setorial.
 */
export function FilterControls({
  selectedCountry,
  selectedState,
  selectedCity,
  selectedSector,
  searchTerm,
  onCountryChange,
  onStateChange,
  onCityChange,
  onSectorChange,
  onSearchChange,
}) {
  const availableStates = getAvailableStates(selectedCountry);
  const availableCities = getAvailableCities(selectedCountry, selectedState);

  return (
    <section aria-label="Filtros Geoespaciais e Setoriais" className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-3">
        <Filter className="w-4 h-4" aria-hidden="true" />
        Drill-Down Geoespacial & Setorial
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div>
          <label htmlFor="filter-country" className="block text-xs text-slate-400 mb-1">
            País / Região
          </label>
          <select
            id="filter-country"
            data-testid="select-country"
            value={selectedCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            {Object.entries(GEO_HIERARCHY).map(([code, data]) => (
              <option key={code} value={code}>
                {data.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-state" className="block text-xs text-slate-400 mb-1">
            Estado / Província
          </label>
          <select
            id="filter-state"
            data-testid="select-state"
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            disabled={selectedCountry === "ALL"}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-40"
          >
            <option value="ALL">Todos os Estados</option>
            {Object.entries(availableStates).map(([stCode, stData]) => (
              <option key={stCode} value={stCode}>
                {stData.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-city" className="block text-xs text-slate-400 mb-1">
            Município
          </label>
          <select
            id="filter-city"
            data-testid="select-city"
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={selectedState === "ALL"}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 disabled:opacity-40"
          >
            <option value="ALL">Todos os Municípios</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="filter-sector" className="block text-xs text-slate-400 mb-1">
            Setor Econômico
          </label>
          <select
            id="filter-sector"
            data-testid="select-sector"
            value={selectedSector}
            onChange={(e) => onSectorChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            {SECTORS.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="search-input" className="block text-xs text-slate-400 mb-1">
            Buscar Organização / Segmento
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" aria-hidden="true" />
            <input
              id="search-input"
              data-testid="search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Ex: Manaus, B3, Agro, ONG..."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
