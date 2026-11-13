import { describe, it, expect } from "vitest";
import { ApiCircuitBreaker } from "../../security/circuitBreaker.js";

/**
 * Suíte de Testes: Circuit Breaker Pattern
 * Técnicas aplicadas:
 * - Teste Baseado em Transição de Estados (State Transition Testing)
 * - Análise do Valor Limite (BVA) no threshold de falhas
 */
describe("ApiCircuitBreaker (Isolamento de Falhas e Resiliência)", () => {
  it("deve inicializar no estado CLOSED permitindo requisições", () => {
    const breaker = new ApiCircuitBreaker(3, 10000);
    expect(breaker.getState()).toBe("CLOSED");
    expect(breaker.canRequest()).toBe(true);
  });

  it("deve transitar para OPEN quando o threshold de falhas consecutivas for atingido (BVA)", () => {
    const breaker = new ApiCircuitBreaker(3, 5000);
    const now = 100000;

    // Falha 1 (abaixo do threshold) -> CLOSED
    breaker.recordFailure(now);
    expect(breaker.getState()).toBe("CLOSED");
    expect(breaker.canRequest(now)).toBe(true);

    // Falha 2 (abaixo do threshold) -> CLOSED
    breaker.recordFailure(now);
    expect(breaker.getState()).toBe("CLOSED");
    expect(breaker.canRequest(now)).toBe(true);

    // Falha 3 (atinge threshold) -> OPEN
    breaker.recordFailure(now);
    expect(breaker.getState()).toBe("OPEN");
    // No estado OPEN, bloqueia requisições imediatas
    expect(breaker.canRequest(now)).toBe(false);
  });

  it("deve transitar de OPEN para HALF-OPEN após expiração do timeout", () => {
    const breaker = new ApiCircuitBreaker(2, 5000);
    const t0 = 200000;

    breaker.recordFailure(t0);
    breaker.recordFailure(t0);
    expect(breaker.getState()).toBe("OPEN");

    // Antes do timeout de 5000ms: deve permanecer bloqueado
    expect(breaker.canRequest(t0 + 4999)).toBe(false);

    // No tempo exato ou após o timeout: transita para HALF-OPEN e permite teste
    expect(breaker.canRequest(t0 + 5000)).toBe(true);
    expect(breaker.getState()).toBe("HALF-OPEN");
  });

  it("deve transitar de HALF-OPEN para CLOSED se a requisição de teste tiver sucesso (Recuperação)", () => {
    const breaker = new ApiCircuitBreaker(2, 3000);
    const t0 = 300000;

    breaker.recordFailure(t0);
    breaker.recordFailure(t0);
    expect(breaker.getState()).toBe("OPEN");

    // Avança para HALF-OPEN
    expect(breaker.canRequest(t0 + 3500)).toBe(true);
    expect(breaker.getState()).toBe("HALF-OPEN");

    // Registra sucesso na sondagem
    breaker.recordSuccess();
    expect(breaker.getState()).toBe("CLOSED");
    expect(breaker.failures).toBe(0);
    expect(breaker.canRequest()).toBe(true);
  });

  it("deve retornar de HALF-OPEN para OPEN imediatamente se a sondagem falhar", () => {
    const breaker = new ApiCircuitBreaker(2, 3000);
    const t0 = 400000;

    breaker.recordFailure(t0);
    breaker.recordFailure(t0);
    expect(breaker.getState()).toBe("OPEN");

    // Entra em HALF-OPEN
    expect(breaker.canRequest(t0 + 3100)).toBe(true);
    expect(breaker.getState()).toBe("HALF-OPEN");

    // Falha na sondagem
    breaker.recordFailure(t0 + 3200);
    expect(breaker.getState()).toBe("OPEN");
    // Bloqueia novamente por mais 3000ms
    expect(breaker.canRequest(t0 + 3300)).toBe(false);
  });

  it("deve resetar o contador de falhas se ocorrer sucesso antes de atingir o threshold", () => {
    const breaker = new ApiCircuitBreaker(3, 5000);
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.failures).toBe(2);

    // Sucesso intercala
    breaker.recordSuccess();
    expect(breaker.failures).toBe(0);
    expect(breaker.getState()).toBe("CLOSED");
  });

  it("deve permitir reset explícito do circuito", () => {
    const breaker = new ApiCircuitBreaker(2, 5000);
    breaker.recordFailure();
    breaker.recordFailure();
    expect(breaker.getState()).toBe("OPEN");

    breaker.reset();
    expect(breaker.getState()).toBe("CLOSED");
    expect(breaker.canRequest()).toBe(true);
  });
});
