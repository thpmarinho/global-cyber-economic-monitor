import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/**
 * Seção de visualização gráfica: Séries temporais de atividade/ataques e barras por setor.
 */
export function AnalyticsCharts({ timeSeries, sectorSummaryData }) {
  return (
    <section aria-label="Gráficos Analíticos" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-white">
              Streaming: Índice de Atividade Econômica vs. Pressão de Ataques (req/min)
            </h2>
            <p className="text-xs text-slate-400">
              Atualização contínua com janela deslizante protegida contra estouro de memória
            </p>
          </div>
          <span className="text-xs px-2 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            Live Stream
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries}>
              <defs>
                <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEcon" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
              <YAxis yAxisId="left" stroke="#06b6d4" fontSize={11} />
              <YAxis yAxisId="right" orientation="right" stroke="#f43f5e" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="economicIndex"
                name="Índice Econômico Global"
                stroke="#06b6d4"
                fillOpacity={1}
                fill="url(#colorEcon)"
                strokeWidth={2}
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="cyberAttacksPerMin"
                name="Ameaças Interceptadas / min"
                stroke="#f43f5e"
                fillOpacity={1}
                fill="url(#colorAttacks)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-white">Exposição por Setor Econômico</h2>
          <p className="text-xs text-slate-400">Volume (US$ Bi) vs. Bloqueios (milhares)</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sectorSummaryData}
              layout="vertical"
              margin={{ left: 10, right: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis type="number" stroke="#64748b" fontSize={11} />
              <YAxis
                dataKey="setor"
                type="category"
                stroke="#94a3b8"
                fontSize={11}
                width={115}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="volumeBi"
                name="Volume (US$ Bi)"
                fill="#10b981"
                radius={[0, 4, 4, 0]}
              />
              <Bar
                dataKey="bloqueiosMil"
                name="Bloqueios (k)"
                fill="#f59e0b"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}
