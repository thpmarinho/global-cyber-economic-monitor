/**
 * Funções puras de cálculo, agregação e filtragem para o Monitor Global
 */

import { sanitizeString } from "../security/sanitizer.js";

/**
 * Filtra a base de organizações conforme os critérios dimensionais selecionados.
 * 
 * @param {Array<Object>} organizations - Lista de organizações
 * @param {Object} filters - Critérios de filtro
 * @param {string} [filters.country] - Código do país ("ALL" ou ISO ex: "BR")
 * @param {string} [filters.state] - Código do estado ("ALL" ou ex: "SP")
 * @param {string} [filters.city] - Nome da cidade ("ALL" ou ex: "Manaus")
 * @param {string} [filters.sector] - ID do setor ("ALL" ou ex: "TERCIARIO")
 * @param {string} [filters.searchTerm] - Termo textual de busca livre
 * @returns {Array<Object>} Organizações correspondentes
 */
export function filterOrganizations(organizations = [], filters = {}) {
  if (!Array.isArray(organizations)) {
    return [];
  }

  const {
    country = "ALL",
    state = "ALL",
    city = "ALL",
    sector = "ALL",
    searchTerm = "",
  } = filters;

  const cleanQuery = sanitizeString(searchTerm, 60).toLowerCase();

  return organizations.filter((org) => {
    if (!org) return false;

    // Filtro por País
    if (country !== "ALL" && org.country !== country) {
      return false;
    }

    // Filtro por Estado
    if (state !== "ALL" && org.state !== state) {
      return false;
    }

    // Filtro por Cidade
    if (city !== "ALL" && org.city !== city) {
      return false;
    }

    // Filtro por Setor
    if (sector !== "ALL" && org.sector !== sector) {
      return false;
    }

    // Filtro textual livre por nome, segmento ou cidade
    if (cleanQuery) {
      const nameMatch = (org.name || "").toLowerCase().includes(cleanQuery);
      const segmentMatch = (org.segment || "").toLowerCase().includes(cleanQuery);
      const cityMatch = (org.city || "").toLowerCase().includes(cleanQuery);

      if (!nameMatch && !segmentMatch && !cityMatch) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Agrega métricas de volume e bloqueios agrupadas por setor econômico.
 * Evita arredondamentos prematuros dentro do laço de acumulação.
 * 
 * @param {Array<Object>} filteredOrganizations - Organizações filtradas
 * @returns {Array<{ setor: string, volumeBi: number, bloqueiosMil: number }>}
 */
export function calculateSectorSummary(filteredOrganizations = []) {
  const groups = {
    PRIMARIO: { setor: "Primário (Agro)", rawVolume: 0, rawBloqueios: 0 },
    SECUNDARIO: { setor: "Secundário (Indústria)", rawVolume: 0, rawBloqueios: 0 },
    TERCIARIO: { setor: "Terciário (Finanças/Tech)", rawVolume: 0, rawBloqueios: 0 },
    ONG: { setor: "Terceiro Setor (ONGs)", rawVolume: 0, rawBloqueios: 0 },
  };

  for (const org of filteredOrganizations) {
    if (org && groups[org.sector]) {
      groups[org.sector].rawVolume += Number(org.volumeUsdBi) || 0;
      groups[org.sector].rawBloqueios += Number(org.attacksBlocked24h) || 0;
    }
  }

  return Object.values(groups).map((item) => ({
    setor: item.setor,
    volumeBi: Number(item.rawVolume.toFixed(1)),
    bloqueiosMil: Number((item.rawBloqueios / 1000).toFixed(2)),
  }));
}

/**
 * Calcula os KPIs executivos consolidados a partir da lista de organizações.
 * 
 * @param {Array<Object>} filteredOrganizations - Lista filtrada
 * @param {boolean} [ddosSimulation=false] - Se o modo de estresse DDoS está ativo
 * @returns {Object} KPIs formatados
 */
export function calculateKpis(filteredOrganizations = [], ddosSimulation = false) {
  let rawVolume = 0;
  let rawBlocked = 0;
  let highRiskCount = 0;

  for (const org of filteredOrganizations) {
    if (org) {
      rawVolume += Number(org.volumeUsdBi) || 0;
      rawBlocked += Number(org.attacksBlocked24h) || 0;
      if (org.cyberRisk === "ALTO") {
        highRiskCount += 1;
      }
    }
  }

  const simulatedAdditionalBlocks = ddosSimulation ? 14820 : 0;
  const totalBlocked = rawBlocked + simulatedAdditionalBlocks;

  return {
    rawVolume,
    rawBlocked: totalBlocked,
    totalVolume: rawVolume.toLocaleString("pt-BR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
    totalBlocked: totalBlocked.toLocaleString("pt-BR"),
    entitiesCount: filteredOrganizations.length,
    highRiskCount,
  };
}

/**
 * Gera o próximo ponto da série temporal de telemetria sem risco de estouro de memória.
 * 
 * @param {Object} lastPoint - Último ponto da série temporal
 * @param {boolean} ddosSimulation - Se o modo DDoS está ativo
 * @param {string} timeLabel - Rótulo de horário atual (HH:MM:SS)
 * @returns {Object} Novo ponto da série temporal
 */
export function generateNextTimeSeriesPoint(
  lastPoint = { economicIndex: 106.0, cyberAttacksPerMin: 400 },
  ddosSimulation = false,
  timeLabel = new Date().toTimeString().slice(0, 8)
) {
  const deltaEcon = (Math.random() - 0.46) * 0.8;
  const nextEcon = Number(
    Math.max(92, Math.min(135, (lastPoint?.economicIndex || 106.0) + deltaEcon)).toFixed(2)
  );

  const nextAttacks = ddosSimulation
    ? Math.floor(1850 + Math.random() * 450)
    : Math.floor(310 + Math.random() * 260);

  return {
    time: timeLabel,
    economicIndex: nextEcon,
    cyberAttacksPerMin: nextAttacks,
    mitigatedRate: ddosSimulation ? 99.94 : 99.89,
  };
}
