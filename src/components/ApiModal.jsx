import React, { useEffect } from "react";
import { Layers, X } from "lucide-react";

/**
 * Modal explicativo de portabilidade de API e arquitetura para SIEM e Data Warehouses.
 */
export function ApiModal({ isOpen, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-modal-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            <h3 id="api-modal-title" className="text-base font-bold text-white">
              Portabilidade de API & Gateway de Ingestão (SIEM / Data Warehouse)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar modal"
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Este painel foi projetado com contrato JSON desacoplado para conectar-se diretamente a pipelines{" "}
          <strong>Apache Kafka</strong>, <strong>Python (FastAPI)</strong>,{" "}
          <strong>Java (Spring Boot)</strong> ou coletores SIEM corporativos sem alterar a camada visual:
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-cyan-300 overflow-x-auto">
          <pre>{`# Exemplo de Gateway Proxy Resiliente (Python FastAPI)
from fastapi import FastAPI
import httpx

app = FastAPI(title="Cyber & Economic Telemetry Gateway")

@app.get("/api/v1/telemetry/osint")
async def get_sanitized_osint():
    async with httpx.AsyncClient(timeout=4.0) as client:
        r = await client.get("https://isc.sans.edu/api/topips/records/10?json")
        return {"source": "SANS-ISC", "status": "VERIFIED", "records": r.json()}`}</pre>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white cursor-pointer"
          >
            Fechar Documentação
          </button>
        </div>
      </div>
    </div>
  );
}
