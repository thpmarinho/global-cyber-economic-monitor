import React from "react";
import { TrendingUp, ShieldAlert, AlertTriangle, Server } from "lucide-react";

/**
 * Cards executivos de indicadores-chave de desempenho (KPIs).
 */
export function KpiCards({ kpis }) {
  return (
    <section aria-label="Indicadores-Chave de Desempenho (KPIs)" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <span>Volume Econômico Monitorado</span>
          <TrendingUp className="w-4 h-4 text-emerald-400" aria-hidden="true" />
        </div>
        <div className="text-2xl font-bold text-white" data-testid="kpi-volume">
          US$ {kpis.totalVolume} Bi
        </div>
        <div className="text-xs text-emerald-400 mt-1">
          {kpis.entitiesCount} organizações ativas no recorte
        </div>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <span>Ataques Cibernéticos Mitigados (24h)</span>
          <ShieldAlert className="w-4 h-4 text-rose-400" aria-hidden="true" />
        </div>
        <div className="text-2xl font-bold text-white" data-testid="kpi-blocked">
          {kpis.totalBlocked}
        </div>
        <div className="text-xs text-rose-300 mt-1">
          Telemetria cruzada SANS DShield & Abuse.ch
        </div>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <span>Infraestruturas em Alerta Crítico</span>
          <AlertTriangle className="w-4 h-4 text-amber-400" aria-hidden="true" />
        </div>
        <div className="text-2xl font-bold text-white" data-testid="kpi-critical">
          {kpis.highRiskCount}
        </div>
        <div className="text-xs text-amber-300 mt-1">
          Bolsas, Big Techs e Energia sob monitoramento reforçado
        </div>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
          <span>Disponibilidade & Resiliência SLA</span>
          <Server className="w-4 h-4 text-cyan-400" aria-hidden="true" />
        </div>
        <div className="text-2xl font-bold text-emerald-400">99.98%</div>
        <div className="text-xs text-slate-400 mt-1">
          Zero indisponibilidade sob estresse de borda
        </div>
      </div>
    </section>
  );
}
