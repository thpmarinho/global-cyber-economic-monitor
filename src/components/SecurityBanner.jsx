import React from "react";
import { ShieldCheck, Cpu, Activity, Lock, Zap, Code2 } from "lucide-react";

/**
 * Barra superior de telemetria de segurança e controle de simulação DDoS.
 */
export function SecurityBanner({
  securityMetrics,
  ddosSimulation,
  onToggleDdos,
  onOpenApiModal,
}) {
  return (
    <aside
      aria-label="Barra de Telemetria de Segurança"
      className={`border-b px-4 py-2.5 text-xs transition-colors duration-200 ${
        ddosSimulation
          ? "bg-red-950/80 border-red-500/60 text-red-100"
          : "bg-slate-900/95 border-slate-800 text-slate-300"
      }`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
            WAF / Edge Shield: ATIVO
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            Circuit Breaker:{" "}
            <strong
              data-testid="circuit-breaker-status"
              className={
                securityMetrics.circuitState === "CLOSED"
                  ? "text-emerald-400"
                  : "text-amber-400"
              }
            >
              {securityMetrics.circuitState}
            </strong>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
            Tráfego: <strong>{securityMetrics.currentRps} req/s</strong> | Descartados (Rate Limit):{" "}
            <strong className="text-amber-400">
              {securityMetrics.requestsDropped.toLocaleString("pt-BR")}
            </strong>
          </span>
          <span className="hidden md:inline-flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-rose-400" aria-hidden="true" />
            Payloads XSS/SQLi Bloqueados:{" "}
            <strong data-testid="xss-blocked-count">{securityMetrics.xssBlocked}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleDdos}
            aria-label={ddosSimulation ? "Parar Ataque DDoS" : "Simular Ataque DDoS"}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
              ddosSimulation
                ? "bg-red-600 hover:bg-red-500 text-white animate-pulse"
                : "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40"
            }`}
          >
            <Zap className="w-3.5 h-3.5" aria-hidden="true" />
            {ddosSimulation
              ? "Parar Ataque DDoS (Mitigando 950 req/s)"
              : "Simular Ataque DDoS"}
          </button>

          <button
            type="button"
            onClick={onOpenApiModal}
            aria-label="Abrir documentação de API e arquitetura"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 font-semibold transition cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" aria-hidden="true" />
            API & Arquitetura
          </button>
        </div>
      </div>
    </aside>
  );
}
