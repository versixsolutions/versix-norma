/**
 * Circuit Breaker Pattern
 *
 * Implementa circuit breaker para proteger o sistema de falhas em cascata
 * quando serviços externos estão indisponíveis.
 *
 * Estados:
 * - CLOSED: Funcionamento normal
 * - OPEN: Bloqueando requisições (fallback ativado)
 * - HALF_OPEN: Testando recuperação
 *
 * @see https://martinfowler.com/bliki/CircuitBreaker.html
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  /** Nome do circuito (para logs) */
  name: string;
  /** Número de falhas consecutivas para abrir o circuito */
  failureThreshold: number;
  /** Tempo (ms) antes de tentar recuperação após abrir */
  resetTimeout: number;
  /** Timeout (ms) para requisições individuais */
  requestTimeout: number;
  /** Callback opcional quando circuito abre */
  onOpen?: () => void;
  /** Callback opcional quando circuito fecha */
  onClose?: () => void;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt: number = Date.now();
  private lastError?: Error;

  constructor(private options: CircuitBreakerOptions) {}

  /**
   * Executa função com proteção de circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Se circuito está aberto, verificar se é hora de tentar recuperação
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new CircuitBreakerOpenError(
          `Circuit breaker is OPEN for ${this.options.name}`,
          this.lastError
        );
      }
      // Tentar recuperação
      this.state = CircuitState.HALF_OPEN;
      console.warn(`[CircuitBreaker:${this.options.name}] Attempting recovery (HALF_OPEN)`);
    }

    try {
      // Executar com timeout
      const result = await this.executeWithTimeout(fn);

      // Sucesso - atualizar contadores
      this.onSuccess();
      return result;
    } catch (error) {
      // Falha - atualizar contadores
      this.onFailure(error as Error);
      throw error;
    }
  }

  /**
   * Executa função com timeout
   */
  private async executeWithTimeout<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Request timeout after ${this.options.requestTimeout}ms`));
      }, this.options.requestTimeout);

      fn()
        .then((result) => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Handler de sucesso
   */
  private onSuccess() {
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      // Após 3 sucessos em HALF_OPEN, fechar circuito
      if (this.successCount >= 3) {
        this.close();
      }
    }
  }

  /**
   * Handler de falha
   */
  private onFailure(error: Error) {
    this.lastError = error;
    this.failureCount++;

    console.error(
      `[CircuitBreaker:${this.options.name}] Failure ${this.failureCount}/${this.options.failureThreshold}`,
      error
    );

    if (
      this.failureCount >= this.options.failureThreshold ||
      this.state === CircuitState.HALF_OPEN
    ) {
      this.open();
    }
  }

  /**
   * Abre o circuito (bloqueia requisições)
   */
  private open() {
    if (this.state === CircuitState.OPEN) return;

    this.state = CircuitState.OPEN;
    this.nextAttempt = Date.now() + this.options.resetTimeout;
    this.successCount = 0;

    console.error(
      `[CircuitBreaker:${this.options.name}] Circuit OPENED. Will retry at ${new Date(this.nextAttempt).toISOString()}`
    );

    if (this.options.onOpen) {
      this.options.onOpen();
    }
  }

  /**
   * Fecha o circuito (funcionamento normal)
   */
  private close() {
    if (this.state === CircuitState.CLOSED) return;

    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;

    console.info(`[CircuitBreaker:${this.options.name}] Circuit CLOSED. Normal operation resumed.`);

    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  /**
   * Retorna estado atual do circuito
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Retorna métricas do circuito
   */
  getMetrics() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastError: this.lastError?.message,
      nextAttempt:
        this.state === CircuitState.OPEN ? new Date(this.nextAttempt).toISOString() : null,
    };
  }

  /**
   * Reset manual do circuito (use com cuidado!)
   */
  reset() {
    this.close();
    console.warn(`[CircuitBreaker:${this.options.name}] Circuit manually reset`);
  }
}

/**
 * Erro customizado quando circuito está aberto
 */
export class CircuitBreakerOpenError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

/**
 * Factory para criar circuit breakers pré-configurados
 */
export const CircuitBreakers = {
  /** Circuit breaker para Asaas API */
  asaas: new CircuitBreaker({
    name: 'Asaas',
    failureThreshold: 5,
    resetTimeout: 60000, // 1 minuto
    requestTimeout: 10000, // 10 segundos
    onOpen: () => {
      console.error('🚨 Asaas API circuit breaker OPENED - usando fallback');
      // TODO: Enviar alerta para Slack/PagerDuty
    },
    onClose: () => {
      console.info('✅ Asaas API circuit breaker CLOSED - operação normal');
    },
  }),

  /** Circuit breaker para Pagar.me API */
  pagarme: new CircuitBreaker({
    name: 'Pagarme',
    failureThreshold: 5,
    resetTimeout: 60000,
    requestTimeout: 10000,
    onOpen: () => {
      console.error('🚨 Pagar.me API circuit breaker OPENED - usando fallback');
    },
    onClose: () => {
      console.info('✅ Pagar.me API circuit breaker CLOSED - operação normal');
    },
  }),

  /** Circuit breaker para Firebase Cloud Messaging */
  fcm: new CircuitBreaker({
    name: 'FCM',
    failureThreshold: 10, // Push é menos crítico
    resetTimeout: 120000, // 2 minutos
    requestTimeout: 5000, // 5 segundos
    onOpen: () => {
      console.warn('⚠️ FCM circuit breaker OPENED - notificações via fallback (email)');
    },
    onClose: () => {
      console.info('✅ FCM circuit breaker CLOSED - push notifications restored');
    },
  }),

  /** Circuit breaker para Twilio SMS */
  twilio: new CircuitBreaker({
    name: 'Twilio',
    failureThreshold: 5,
    resetTimeout: 60000,
    requestTimeout: 10000,
    onOpen: () => {
      console.error('🚨 Twilio circuit breaker OPENED - SMS indisponível');
    },
    onClose: () => {
      console.info('✅ Twilio circuit breaker CLOSED - SMS restored');
    },
  }),

  /** Circuit breaker para SendGrid Email */
  sendgrid: new CircuitBreaker({
    name: 'SendGrid',
    failureThreshold: 10,
    resetTimeout: 120000,
    requestTimeout: 10000,
    onOpen: () => {
      console.error('🚨 SendGrid circuit breaker OPENED - emails em fila');
    },
    onClose: () => {
      console.info('✅ SendGrid circuit breaker CLOSED - email delivery restored');
    },
  }),
};

/**
 * Helper para executar com retry + circuit breaker
 */
export async function executeWithRetry<T>(
  circuitBreaker: CircuitBreaker,
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    retryDelay?: number;
    retryBackoff?: number;
  } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 1000, retryBackoff = 2 } = options;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await circuitBreaker.execute(fn);
    } catch (error) {
      lastError = error as Error;

      // Se circuito está aberto, não fazer retry
      if (error instanceof CircuitBreakerOpenError) {
        throw error;
      }

      // Se é última tentativa, lançar erro
      if (attempt === maxRetries - 1) {
        break;
      }

      // Aguardar com backoff exponencial
      const delay = retryDelay * Math.pow(retryBackoff, attempt);
      console.warn(
        `[Retry] Attempt ${attempt + 1}/${maxRetries} failed. Retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
