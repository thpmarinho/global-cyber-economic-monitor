/**
 * Circuit Breaker Pattern
 * Isola falhas ou lentidão de APIs externas para prevenir falhas em cascata no cliente.
 * 
 * Estados:
 * - CLOSED: Operação normal. Requisições permitidas.
 * - OPEN: Falhas consecutivas excederam o limite. Requisições bloqueadas temporariamente.
 * - HALF-OPEN: Período de teste. Permite requisição de sondagem para testar recuperação.
 */
export class ApiCircuitBreaker {
  /**
   * @param {number} failureThreshold - Número de falhas consecutivas antes de abrir o circuito
   * @param {number} resetTimeoutMs - Tempo em ms que o circuito permanece aberto antes de testar recuperação
   */
  constructor(failureThreshold = 3, resetTimeoutMs = 15000) {
    this.state = "CLOSED"; // CLOSED | OPEN | HALF-OPEN
    this.failures = 0;
    this.failureThreshold = Math.max(1, failureThreshold);
    this.resetTimeoutMs = Math.max(100, resetTimeoutMs);
    this.nextAttempt = 0;
  }

  /**
   * Verifica se uma requisição é permitida no estado atual.
   * 
   * @param {number} [now] - Timestamp opcional para testes determinísticos
   * @returns {boolean}
   */
  canRequest(now = Date.now()) {
    if (this.state === "CLOSED") {
      return true;
    }

    if (this.state === "OPEN") {
      if (now >= this.nextAttempt) {
        this.state = "HALF-OPEN";
        return true;
      }
      return false;
    }

    if (this.state === "HALF-OPEN") {
      return true;
    }

    return false;
  }

  /**
   * Registra uma resposta com sucesso. Restaura o circuito para CLOSED.
   */
  recordSuccess() {
    this.failures = 0;
    this.state = "CLOSED";
  }

  /**
   * Registra uma falha de rede/API.
   * 
   * @param {number} [now] - Timestamp opcional
   */
  recordFailure(now = Date.now()) {
    if (this.state === "HALF-OPEN") {
      // Falhou durante a sondagem de recuperação: reabre imediatamente
      this.state = "OPEN";
      this.nextAttempt = now + this.resetTimeoutMs;
      return;
    }

    this.failures += 1;
    if (this.failures >= this.failureThreshold) {
      this.state = "OPEN";
      this.nextAttempt = now + this.resetTimeoutMs;
    }
  }

  /**
   * Retorna o estado atual do Circuit Breaker.
   * @returns {"CLOSED" | "OPEN" | "HALF-OPEN"}
   */
  getState() {
    return this.state;
  }

  /**
   * Reinicia o Circuit Breaker para o estado inicial fechado.
   */
  reset() {
    this.state = "CLOSED";
    this.failures = 0;
    this.nextAttempt = 0;
  }
}
