/**
 * Módulo de Sanitização e Validação de Entradas (Edge Defense)
 * Proteção contra XSS, HTML Injection, SQL Injection e dados corrompidos de feeds externos.
 */

/**
 * Sanitiza strings recebidas de fontes externas e formulários de busca.
 * Remove caracteres de controle de sintaxe HTML/SQL e bloqueia termos maliciosos conhecidos.
 * 
 * @param {unknown} input - Valor a ser sanitizado
 * @param {number} maxLen - Tamanho máximo permitido (padrão: 110)
 * @returns {string} String limpa e segura
 */
export function sanitizeString(input, maxLen = 110) {
  if (typeof input !== "string") {
    return "";
  }

  return input
    // Remove tags HTML e scripts completos
    .replace(/<[^>]*>?/gm, "")
    // Remove caracteres de escape/injeção comuns (< > " ' ` ;)
    .replace(/[<>"'`;]/g, "")
    // Bloqueia seletores de ataque XSS e SQL Injection
    .replace(
      /(javascript:|data:text\/html|onerror=|onload=|onclick=|eval\(|union\s+select|drop\s+table|insert\s+into|delete\s+from)/gi,
      "[BLOCKED]"
    )
    .trim()
    .slice(0, Math.max(0, maxLen));
}

/**
 * Validação rigorosa de endereços de rede IPv4 e IPv6.
 * Rejeita representações forjadas ou malformadas.
 * 
 * @param {unknown} ip - String candidata a IP
 * @returns {string} IP válido ou "INVALID_IP_DROPPED"
 */
export function sanitizeIp(ip) {
  if (typeof ip !== "string") {
    return "INVALID_IP_DROPPED";
  }

  const cleaned = ip.trim();

  // IPv4 padrão: 4 octetos decimais de 0 a 255
  const ipv4Regex =
    /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;

  // IPv6 estrito (compatível com notação canônica e comprimida)
  const ipv6Regex =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;

  if (ipv4Regex.test(cleaned) || ipv6Regex.test(cleaned)) {
    return cleaned;
  }

  return "INVALID_IP_DROPPED";
}

/**
 * Converte e valida números de porta e quantidades.
 * 
 * @param {unknown} val - Valor bruto
 * @param {number} fallback - Valor padrão em caso de falha
 * @param {number} min - Mínimo aceito
 * @param {number} max - Máximo aceito
 * @returns {number} Número dentro da faixa
 */
export function sanitizeNumber(val, fallback = 0, min = 0, max = Infinity) {
  const num = Number(val);
  if (Number.isNaN(num) || !Number.isFinite(num)) {
    return fallback;
  }
  return Math.min(Math.max(num, min), max);
}
