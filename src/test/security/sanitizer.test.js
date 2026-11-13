import { describe, it, expect } from "vitest";
import { sanitizeString, sanitizeIp, sanitizeNumber } from "../../security/sanitizer.js";

/**
 * Suíte de Testes: Sanitização e Edge Defense
 * Técnicas aplicadas:
 * - Particionamento em Classes de Equivalência (EP)
 * - Análise do Valor Limite (BVA)
 */
describe("Sanitizer Module (Anti-XSS, Anti-SQLi e Validação)", () => {
  describe("sanitizeString()", () => {
    it("deve manter strings seguras inalteradas (Classe de Equivalência Válida)", () => {
      const input = "Monitoramento do Setor Primario";
      expect(sanitizeString(input)).toBe("Monitoramento do Setor Primario");
    });

    it("deve remover tags HTML simples e aninhadas (Proteção Anti-XSS)", () => {
      expect(sanitizeString("<script>alert('xss')</script>")).toBe("alert(xss)");
      expect(sanitizeString("<img src=x onerror=alert(1)>")).toBe("");
      expect(sanitizeString("Imagem suspeita: <img src=x onerror=alert(1)>")).toBe("Imagem suspeita:");
      expect(sanitizeString("<b>Texto em negrito</b>")).toBe("Texto em negrito");
    });

    it("deve bloquear seletores de ataques comuns como javascript: e SQL injection", () => {
      expect(sanitizeString("javascript:void(0)")).toBe("[BLOCKED]void(0)");
      expect(sanitizeString("SELECT * FROM users UNION SELECT 1,2,3")).toBe(
        "SELECT * FROM users [BLOCKED] 1,2,3"
      );
      expect(sanitizeString("admin' DROP TABLE logs;--")).toBe(
        "admin [BLOCKED] logs--"
      );
    });

    it("deve remover caracteres de injeção sintática (< > \" ' ` ;)", () => {
      expect(sanitizeString("teste'\"`;<>")).toBe("teste");
    });

    it("deve respeitar a Análise do Valor Limite (BVA) no parâmetro maxLen", () => {
      const base = "1234567890";
      expect(sanitizeString(base, 5)).toBe("12345");
      expect(sanitizeString(base, 10)).toBe("1234567890");
      expect(sanitizeString(base, 0)).toBe("");
      expect(sanitizeString(base, -3)).toBe("");
    });

    it("deve retornar string vazia para entradas não-string (Robustez)", () => {
      expect(sanitizeString(null)).toBe("");
      expect(sanitizeString(undefined)).toBe("");
      expect(sanitizeString(12345)).toBe("");
      expect(sanitizeString({})).toBe("");
    });
  });

  describe("sanitizeIp()", () => {
    it("deve aceitar endereços IPv4 válidos dentro dos limites (0-255)", () => {
      expect(sanitizeIp("127.0.0.1")).toBe("127.0.0.1");
      expect(sanitizeIp("0.0.0.0")).toBe("0.0.0.0");
      expect(sanitizeIp("255.255.255.255")).toBe("255.255.255.255");
      expect(sanitizeIp("  192.168.1.100  ")).toBe("192.168.1.100");
    });

    it("deve rejeitar endereços IPv4 fora dos limites (BVA)", () => {
      expect(sanitizeIp("256.0.0.1")).toBe("INVALID_IP_DROPPED");
      expect(sanitizeIp("192.168.1.300")).toBe("INVALID_IP_DROPPED");
      expect(sanitizeIp("192.168.1")).toBe("INVALID_IP_DROPPED");
      expect(sanitizeIp("192.168.1.1.1")).toBe("INVALID_IP_DROPPED");
    });

    it("deve aceitar endereços IPv6 válidos", () => {
      expect(sanitizeIp("2001:0db8:85a3:0000:0000:8a2e:0370:7334")).toBe(
        "2001:0db8:85a3:0000:0000:8a2e:0370:7334"
      );
      expect(sanitizeIp("::1")).toBe("::1");
      expect(sanitizeIp("fe80::1")).toBe("fe80::1");
    });

    it("deve descartar strings arbitrárias ou nulas como INVALID_IP_DROPPED", () => {
      expect(sanitizeIp("not-an-ip")).toBe("INVALID_IP_DROPPED");
      expect(sanitizeIp("")).toBe("INVALID_IP_DROPPED");
      expect(sanitizeIp(null)).toBe("INVALID_IP_DROPPED");
      expect(sanitizeIp(undefined)).toBe("INVALID_IP_DROPPED");
    });
  });

  describe("sanitizeNumber()", () => {
    it("deve converter números válidos dentro da faixa", () => {
      expect(sanitizeNumber("443", 80, 1, 65535)).toBe(443);
      expect(sanitizeNumber(8080, 80, 1, 65535)).toBe(8080);
    });

    it("deve aplicar limites mínimos e máximos (BVA)", () => {
      expect(sanitizeNumber(-10, 80, 1, 65535)).toBe(1);
      expect(sanitizeNumber(70000, 80, 1, 65535)).toBe(65535);
    });

    it("deve retornar o fallback para NaN ou valores não numéricos", () => {
      expect(sanitizeNumber("abc", 443)).toBe(443);
      expect(sanitizeNumber(null, 443)).toBe(0);
      expect(sanitizeNumber(undefined, 443)).toBe(443);
    });
  });
});
