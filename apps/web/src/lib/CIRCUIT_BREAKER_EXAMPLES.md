# Exemplo de Uso: Circuit Breaker

Este documento demonstra como usar o circuit breaker pattern para proteger chamadas a APIs externas.

## Exemplo 1: Integração com Asaas

```typescript
import { CircuitBreakers, executeWithRetry } from '@/lib/circuit-breaker';

async function processarPagamentoAsaas(pagamentoData: any) {
  try {
    // Executar com circuit breaker + retry automático
    const result = await executeWithRetry(
      CircuitBreakers.asaas,
      async () => {
        const response = await fetch('https://www.asaas.com/api/v3/payments', {
          method: 'POST',
          headers: {
            access_token: process.env.ASAAS_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pagamentoData),
        });

        if (!response.ok) {
          throw new Error(`Asaas API error: ${response.status}`);
        }

        return response.json();
      },
      {
        maxRetries: 3,
        retryDelay: 1000, // 1 segundo
        retryBackoff: 2, // 1s, 2s, 4s
      }
    );

    return result;
  } catch (error) {
    // Se circuito está aberto, usar fallback
    if (error instanceof CircuitBreakerOpenError) {
      console.error('Asaas indisponível - usando provedor fallback');
      return await processarPagamentoPagarme(pagamentoData);
    }
    throw error;
  }
}
```

## Exemplo 2: Push Notifications com Fallback

```typescript
import { CircuitBreakers } from '@/lib/circuit-breaker';

async function enviarNotificacao(userId: string, message: string) {
  try {
    // Tentar enviar push notification
    await CircuitBreakers.fcm.execute(async () => {
      await sendPushNotification(userId, message);
    });
  } catch (error) {
    // Se FCM falhar, usar email como fallback
    console.warn('Push notification failed, falling back to email');
    await CircuitBreakers.sendgrid.execute(async () => {
      await sendEmailNotification(userId, message);
    });
  }
}
```

## Exemplo 3: Monitorar Estado dos Circuitos

```typescript
import { CircuitBreakers } from '@/lib/circuit-breaker';

// Endpoint de métricas
export async function GET() {
  const metrics = {
    asaas: CircuitBreakers.asaas.getMetrics(),
    pagarme: CircuitBreakers.pagarme.getMetrics(),
    fcm: CircuitBreakers.fcm.getMetrics(),
    twilio: CircuitBreakers.twilio.getMetrics(),
    sendgrid: CircuitBreakers.sendgrid.getMetrics(),
  };

  return Response.json(metrics);
}
```

## Exemplo 4: Reset Manual (Admin)

```typescript
// Apenas para administradores em caso de emergência
import { CircuitBreakers } from '@/lib/circuit-breaker';

async function resetCircuitBreaker(service: string) {
  const breaker = CircuitBreakers[service as keyof typeof CircuitBreakers];

  if (!breaker) {
    throw new Error('Invalid circuit breaker');
  }

  breaker.reset();
  console.log(`Circuit breaker ${service} manually reset`);
}
```
