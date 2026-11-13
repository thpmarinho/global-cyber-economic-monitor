import React from "react";
import { Globe, Radio, Shield, RefreshCw } from "lucide-react";

/**
 * Cabeçalho principal com status dos feeds OSINT e indicador SANS Infocon.
 */
export function Header({
  feedSourceStatus,
  infoconLevel,
  isSyncing,
  onRefreshFeeds,
}) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
              <Globe className="w-6 h-6 text-cyan-400" aria-hidden="true" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Global Cyber & Economic Real-Time Monitor
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Observabilidade Multi-Setorial (Primário, Secundário, Terciário & ONGs) + Threat Intelligence OSINT
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" aria-hidden="true" />
            <span className="text-slate-400">Feed OSINT:</span>
            <span className="font-medium text-slate-200" data-testid="feed-source-status">
              {feedSourceStatus}
            </span>
          </div>

          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs">
            <Shield className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span className="text-slate-400">SANS Infocon:</span>
            <span
              data-testid="infocon-badge"
              className={`font-bold px-1.5 py-0.5 rounded ${
                infoconLevel === "GREEN"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : infoconLevel === "YELLOW"
                  ? "bg-amber-500/20 text-amber-300"
                  : "bg-rose-500/20 text-rose-300"
              }`}
            >
              {infoconLevel}
            </span>
          </div>

          <button
            type="button"
            onClick={onRefreshFeeds}
            disabled={isSyncing}
            aria-label="Atualizar feeds de inteligência OSINT"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin text-cyan-400" : ""}`}
              aria-hidden="true"
            />
            {isSyncing ? "Atualizando..." : "Atualizar Feeds"}
          </button>
        </div>
      </div>
    </header>
  );
}
