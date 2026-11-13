/**
 * Token Bucket Rate Limiter
 * Algoritmo clássico de controle de taxa para proteção do cliente contra rajadas e DDoS.
 */
export class TokenBucketLimiter {
  /**
   * @param {number} capacity - Capacidade máxima do bucket (burst limit)
   * @param {number} refillPerSec - Taxa de reabastecimento de tokens por segundo
   */
  constructor(capacity = 80, refillPerSec = 25) {
    this.capacity = Math.max(1, capacity);
    this.tokens = this.capacity;
    this.refillPerSec = Math.max(0.1, refillPerSec);
    this.lastRefill = Date.now();
  }

  /**
   * Reabastece os tokens com base no tempo decorrido.
   * @private
   */
  _refill(now = Date.now()) {
    if (now < this.lastRefill) {
      // Proteção contra retrocesso de relógio do sistema
      this.lastRefill = now;
      return;
    }

    const elapsedSec = (now - this.lastRefill) / 1000;
    if (elapsedSec > 0) {
      this.tokens = Math.min(
        this.capacity,
        this.tokens + elapsedSec * this.refillPerSec
      );
      this.lastRefill = now;
    }
  }

  /**
   * Tenta consumir uma quantidade de tokens.
   * 
   * @param {number} count - Quantidade de tokens requerida (deve ser > 0)
   * @param {number} [now] - Timestamp opcional (útil para testes determinísticos)
   * @returns {boolean} true se os tokens foram consumidos, false se a taxa foi excedida
   */
  consume(count = 1, now = Date.now()) {
    if (typeof count !== "number" || count <= 0 || !Number.isFinite(count)) {
      return false;
    }

    this._refill(now);

    if (this.tokens >= count) {
      this.tokens -= count;
      return true;
    }

    return false;
  }

  /**
   * Retorna a quantidade atual de tokens disponíveis.
   * @returns {number}
   */
  getAvailableTokens() {
    this._refill();
    return this.tokens;
  }

  /**
   * Reinicia o balde com a capacidade máxima.
   */
  reset() {
    this.tokens = this.capacity;
    this.lastRefill = Date.now();
  }
}
