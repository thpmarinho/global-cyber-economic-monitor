import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchOsintFeeds } from "../../services/osintService.js";
import { ApiCircuitBreaker } from "../../security/circuitBreaker.js";
import { CACHE_KEY } from "../../data/osintBaseline.js";

/**
 * Suíte de Testes: Serviço de Feeds OSINT e Tolerância a Falhas
 * Técnicas aplicadas:
 * - Test Doubles: Mocks e Stubs de Fetch
 * - Injeção de Falhas de Rede e Timeouts
 * - Teste de Cache SWR (Stale-While-Revalidate) com Storage Fake
 */
describe("osintService (Threat Feeds & Resiliência OSINT)", () => {
  let breaker;
  let fakeStorage;

  beforeEach(() => {
    breaker = new ApiCircuitBreaker(2, 5000);
    const store = {};
    fakeStorage = {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, val) => {
        store[key] = val;
      }),
      clear: () => {
        for (const k in store) delete store[k];
      },
    };
  });

  it("deve processar feeds com sucesso quando a API externa responder 200 OK (Caminho Feliz)", async () => {
    const mockFetch = vi.fn().mockImplementation((url) => {
      if (url.includes("infocon")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ status: "yellow" }),
        });
      }
      if (url.includes("topips")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              { source: "198.51.100.5", targetport: "80", attacks: "1500" },
              { source: "203.0.113.19", targetport: "443", attacks: "980" },
            ]),
        });
      }
      return Promise.reject(new Error("URL desconhecida"));
    });

    const result = await fetchOsintFeeds({
      circuitBreaker: breaker,
      storage: fakeStorage,
      fetchFn: mockFetch,
    });

    expect(result.success).toBe(true);
    expect(result.infoconLevel).toBe("YELLOW");
    expect(result.feedSourceStatus).toContain("SANS ISC DShield (Tempo Real)");
    expect(breaker.getState()).toBe("CLOSED");

    // Verifica se salvou no cache SWR
    expect(fakeStorage.setItem).toHaveBeenCalledWith(
      CACHE_KEY,
      expect.any(String)
    );
  });

  it("deve recuperar dados do cache SWR quando a API externa falhar (Injeção de Falha)", async () => {
    // Popula o cache prévio
    const cachedLogs = [
      {
        id: "cached-1",
        ip: "10.0.0.1",
        agency: "Cache Validado",
        threatType: "Threat em Cache",
        severity: "ALTA",
      },
    ];
    fakeStorage.setItem(CACHE_KEY, JSON.stringify(cachedLogs));

    // Simula erro 500 na API externa
    const mockFailingFetch = vi.fn().mockRejectedValue(new Error("Network Error"));

    const result = await fetchOsintFeeds({
      circuitBreaker: breaker,
      storage: fakeStorage,
      fetchFn: mockFailingFetch,
    });

    expect(result.success).toBe(false);
    expect(result.feedSourceStatus).toBe("Cache SWR + Base OSINT Validada");
    expect(result.threatLogs).toEqual(cachedLogs);
    // Registra falha no breaker
    expect(breaker.failures).toBe(1);
  });

  it("não deve disparar requisições HTTP se o Circuit Breaker estiver OPEN", async () => {
    // Força o breaker para OPEN
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getState()).toBe("OPEN");

    const mockFetch = vi.fn();

    const result = await fetchOsintFeeds({
      circuitBreaker: breaker,
      storage: fakeStorage,
      fetchFn: mockFetch,
    });

    expect(result.success).toBe(false);
    expect(result.feedSourceStatus).toContain("Circuit Breaker Aberto");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("deve sanitizar entradas maliciosas ou IPs inválidos vindos do feed externo", async () => {
    const mockFetchWithMaliciousPayload = vi.fn().mockImplementation((url) => {
      if (url.includes("topips")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                source: "999.999.999.999", // IP Inválido
                targetport: "xyz",
                count: "<script>alert('xss')</script>",
              },
            ]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ status: "green" }),
      });
    });

    const result = await fetchOsintFeeds({
      circuitBreaker: breaker,
      storage: fakeStorage,
      fetchFn: mockFetchWithMaliciousPayload,
    });

    expect(result.success).toBe(true);
    const sanitizedItem = result.threatLogs[0];
    expect(sanitizedItem.ip).toBe("INVALID_IP_DROPPED");
    expect(sanitizedItem.port).toBe(443);
    expect(sanitizedItem.threatType).not.toContain("<script>");
  });
});
