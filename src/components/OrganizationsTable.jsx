import React from "react";
import { Building2 } from "lucide-react";

/**
 * Tabela de entidades monitoradas (empresas, bancos, bolsas, big techs e ONGs).
 */
export function OrganizationsTable({ organizations }) {
  return (
    <div className="lg:col-span-7 bg-slate-900/70 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-cyan-400" aria-hidden="true" />
          <h2 className="text-sm font-bold text-white">
            Entidades Monitoradas (Empresas, Bancos, Bolsas, Big Techs & ONGs)
          </h2>
        </div>
        <span className="text-xs text-slate-400" data-testid="orgs-count">
          {organizations.length} registros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
              <th scope="col" className="py-2.5 px-2">Organização / Segmento</th>
              <th scope="col" className="py-2.5 px-2">Localização</th>
              <th scope="col" className="py-2.5 px-2">Setor</th>
              <th scope="col" className="py-2.5 px-2 text-right">Volume (US$)</th>
              <th scope="col" className="py-2.5 px-2 text-center">Risco Cyber</th>
              <th scope="col" className="py-2.5 px-2 text-right">SLA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {organizations.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  data-testid="no-orgs-message"
                  className="py-8 text-center text-slate-500"
                >
                  Nenhuma organização encontrada para os filtros selecionados.
                </td>
              </tr>
            ) : (
              organizations.map((org) => (
                <tr
                  key={org.id}
                  data-testid="org-row"
                  className="hover:bg-slate-800/40 transition"
                >
                  <td className="py-2.5 px-2">
                    <div className="font-semibold text-slate-100">
                      {org.name}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {org.segment}
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-slate-300">
                    {org.city}, {org.state} ({org.country})
                  </td>
                  <td className="py-2.5 px-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium">
                      {org.sector}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-emerald-300 font-semibold">
                    ${org.volumeUsdBi.toFixed(1)}B
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        org.cyberRisk === "ALTO"
                          ? "bg-rose-500/20 text-rose-300"
                          : org.cyberRisk === "MÉDIO"
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {org.cyberRisk}
                    </span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono text-slate-300">
                    {org.sla}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
