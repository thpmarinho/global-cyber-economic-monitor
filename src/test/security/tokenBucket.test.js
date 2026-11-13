import { describe, it, expect } from "vitest";
import { TokenBucketLimiter } from "../../security/tokenBucket.js";

/**
 * Suíte de Testes: Token Bucket Rate Limiter
 * Técnicas aplicadas:
 * - Análise do Valor Limite (BVA)
 * - Particionamento em Classes de Equivalência (EP)
 * - Teste Temporal / Injeção de Timestamp
 */
describe("TokenBucketLimiter (Rate Limiting & Anti-DDoS)", () => {
  it("deve inicializar com a capacidade cheia", () => {
    const limiter = new TokenBucketLimiter(100, 20);
    expect(limiter.getAvailableTokens()).toBe(100);
  });

  it("deve permitir consumo dentro da capacidade disponível", () => {
    const limiter = new TokenBucketLimiter(50, 10);
    expect(limiter.consume(10)).toBe(true);
    expect(limiter.getAvailableTokens()).toBe(40);
  });

  it("deve bloquear consumo que exceda os tokens disponíveis (BVA)", () => {
    const limiter = new TokenBucketLimiter(10, 5);
    // Consome exatamente 10 tokens (limite)
    expect(limiter.consume(10)).toBe(true);
    expect(limiter.getAvailableTokens()).toBe(0);

    // Tenta consumir 1 token com balde vazio -> deve falhar
    expect(limiter.consume(1)).toBe(false);
  });

  it("deve reabastecer tokens de acordo com o tempo decorrido", () => {
    const initialTime = 1000000;
    const limiter = new TokenBucketLimiter(20, 10); // 10 tokens por segundo

    // Esvazia 20 tokens no tempo inicial
    expect(limiter.consume(20, initialTime)).toBe(true);
    expect(limiter.consume(1, initialTime)).toBe(false);

    // Avança 1 segundo (1000ms) -> deve repor 10 tokens
    const timeAfter1Sec = initialTime + 1000;
    expect(limiter.consume(5, timeAfter1Sec)).toBe(true);
    expect(limiter.consume(5, timeAfter1Sec)).toBe(true);
    expect(limiter.consume(1, timeAfter1Sec)).toBe(false);

    // Avança 3 segundos -> deve limitar à capacidade máxima de 20
    const timeAfter4Sec = initialTime + 4000;
    expect(limiter.consume(20, timeAfter4Sec)).toBe(true);
  });

  it("não deve permitir consumo de valores não positivos ou inválidos (EP)", () => {
    const limiter = new TokenBucketLimiter(50, 10);
    expect(limiter.consume(0)).toBe(false);
    expect(limiter.consume(-5)).toBe(false);
    expect(limiter.consume("5")).toBe(false);
    expect(limiter.consume(NaN)).toBe(false);
    expect(limiter.consume(null)).toBe(false);
  });

  it("deve se proteger contra retrocesso no relógio do sistema (Clock Skew)", () => {
    const t1 = 2000000;
    const limiter = new TokenBucketLimiter(50, 10);
    limiter.consume(10, t1);

    // Simula relógio recuando no passado
    const pastTime = t1 - 5000;
    expect(limiter.consume(1, pastTime)).toBe(true);
  });

  it("deve permitir reset manual para capacidade máxima", () => {
    const limiter = new TokenBucketLimiter(30, 5);
    limiter.consume(30);
    expect(limiter.consume(1)).toBe(false);

    limiter.reset();
    expect(limiter.getAvailableTokens()).toBe(30);
    expect(limiter.consume(15)).toBe(true);
  });
});
