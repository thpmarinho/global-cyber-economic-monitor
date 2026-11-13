/**
 * Serviço de Ingestão e Resiliência de Feeds OSINT (Threat Intelligence)
 * Implementa o padrão SWR (Stale-While-Revalidate) com isolamento via Circuit Breaker.
 */

import { sanitizeString, sanitizeIp } from "../security/sanitizer.js";
import { CACHE_KEY, MAX_THREAT_LOGS, CURATED_OSINT_BASELINE } from "../data/osintBaseline.js";

const VALID_INFOCON_LEVELS = ["GREEN", "YELLOW", "ORANGE", "RED"];
const SECTORS_CYCLE = ["TERCIARIO", "SECUNDARIO", "PRIMARIO", "ONG"];

/**
 * Consulta feeds OSINT em tempo real com tolerância a falhas e sanitização em camadas.
 * 
 * @param {Object} options
 * @param {import('../security/circuitBreaker.js').ApiCircuitBreaker} options.circuitBreaker - Instância do disjuntor
 * @param {Storage} [options.storage=localStorage] - Mecanismo de persistência de cache
 * @param {typeof fetch} [options.fetchFn=fetch] - Função de fetch injetável para testes
 * @param {number} [options.timeoutMs=4500] - Timeout da requisição externa
 * @param {Array<Object>} [options.currentLogs=[]] - Logs atualmente exibidos
 * @returns {Promise<{
 *   success: boolean,
 *   infoconLevel?: string,
 *   threatLogs: Array<Object>,
 *   feedSourceStatus: string,
 *   circuitState: string,
 * }>}
 */
export async function fetchOsintFeeds({
  circuitBreaker,
  storage = (typeof localStorage !== "undefined" ? localStorage : null),
  fetchFn = fetch,
  timeoutMs = 4500,
  currentLogs = CURATED_OSINT_BASELINE,
}) {
  // 1. Verificação prévia do Circuit Breaker
  if (!circuitBreaker.canRequest()) {
    const cachedLogs = loadLogsFromCache(storage) || currentLogs;
    return {
      success: false,
      threatLogs: cachedLogs,
      feedSourceStatus: "Circuit Breaker Aberto (Protegendo Cliente)",
      circuitState: circuitBreaker.getState(),
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const [infoconRes, topIpsRes] = await Promise.allSettled([
      fetchFn("https://isc.sans.edu/api/infocon?json", { signal: controller.signal }),
      fetchFn("https://isc.sans.edu/api/topips/records/6?json", { signal: controller.signal }),
    ]);

    clearTimeout(timeoutId);

    let newInfocon = null;
    let newLogs = null;
    let anySuccess = false;

    // Processa resposta do Infocon
    if (infoconRes.status === "fulfilled" && infoconRes.value?.ok) {
      try {
        const infoData = await infoconRes.value.json();
        const rawStatus = sanitizeString(infoData?.status || "", 15).toUpperCase();
        if (VALID_INFOCON_LEVELS.includes(rawStatus)) {
          newInfocon = rawStatus;
          anySuccess = true;
        }
      } catch (_) {
        // Falha no parsing do JSON
      }
    }

    // Processa resposta dos Top IPs
    if (topIpsRes.status === "fulfilled" && topIpsRes.value?.ok) {
      try {
        const ipsData = await topIpsRes.value.json();
        if (Array.isArray(ipsData) && ipsData.length > 0) {
          const sanitizedItems = ipsData.slice(0, 6).map((item, idx) => ({
            id: `sans-${Date.now()}-${idx}`,
            agency: "SANS ISC / DShield (Live)",
            ip: sanitizeIp(item?.source || item?.ip || ""),
            port: Number(item?.targetport) || 443,
            threatType: sanitizeString(
              `DShield Top Attacker (${item?.count || item?.attacks || "N/D"} eventos)`
            ),
            targetSector: SECTORS_CYCLE[idx % SECTORS_CYCLE.length],
            severity: idx < 2 ? "CRÍTICA" : "ALTA",
            status: "BLOQUEADO",
          }));

          const merged = [...sanitizedItems, ...currentLogs].slice(0, MAX_THREAT_LOGS);
          newLogs = merged;
          saveLogsToCache(storage, merged);
          anySuccess = true;
        }
      } catch (_) {
        // Falha no parsing
      }
    }

    if (anySuccess) {
      circuitBreaker.recordSuccess();
      return {
        success: true,
        ...(newInfocon ? { infoconLevel: newInfocon } : {}),
        threatLogs: newLogs || currentLogs,
        feedSourceStatus: "SANS ISC DShield (Tempo Real)",
        circuitState: circuitBreaker.getState(),
      };
    }

    throw new Error("Feeds externos indisponíveis ou payload inválido");
  } catch (err) {
    circuitBreaker.recordFailure();
    const fallbackLogs = loadLogsFromCache(storage) || currentLogs;

    return {
      success: false,
      threatLogs: fallbackLogs,
      feedSourceStatus: "Cache SWR + Base OSINT Validada",
      circuitState: circuitBreaker.getState(),
    };
  }
}

/**
 * Carrega logs do armazenamento local seguro.
 */
function loadLogsFromCache(storage) {
  if (!storage) return null;
  try {
    const raw = storage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, MAX_THREAT_LOGS);
    }
  } catch (_) {
    // Falha silenciosa no cache
  }
  return null;
}

/**
 * Salva logs no armazenamento local seguro.
 */
function saveLogsToCache(storage, logs) {
  if (!storage || !Array.isArray(logs)) return;
  try {
    storage.setItem(CACHE_KEY, JSON.stringify(logs));
  } catch (_) {
    // Quota cheia ou armazenamento bloqueado
  }
}
