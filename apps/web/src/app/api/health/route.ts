import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 *
 * Verifica a saúde do sistema e suas dependências externas.
 * Usado por load balancers, monitoring, e orchestrators.
 *
 * Status Codes:
 * - 200: Sistema saudável
 * - 503: Sistema degradado ou indisponível
 */

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  checks: {
    database: CheckStatus;
    supabase: CheckStatus;
    external_apis: {
      asaas: CheckStatus;
      pagarme: CheckStatus;
      fcm: CheckStatus;
    };
  };
  version: string;
  environment: string;
}

interface CheckStatus {
  status: 'up' | 'down' | 'degraded';
  responseTime?: number;
  error?: string;
  lastChecked: string;
}

// Cache de status (evitar sobrecarga)
let healthCache: HealthCheckResult | null = null;
let lastCheck: number = 0;
const CACHE_TTL = 30000; // 30 segundos

export async function GET(request: Request) {
  const now = Date.now();

  // Retornar cache se ainda válido
  if (healthCache && now - lastCheck < CACHE_TTL) {
    const status = healthCache.status === 'healthy' ? 200 : 503;
    return NextResponse.json(healthCache, { status });
  }

  // Executar checks
  const startTime = Date.now();
  const checks = await Promise.all([
    checkDatabase(),
    checkSupabase(),
    checkAsaas(),
    checkPagarme(),
    checkFCM(),
  ]);

  const [database, supabase, asaas, pagarme, fcm] = checks;

  // Determinar status geral
  const allChecks = [database, supabase, asaas, pagarme, fcm];
  const hasUnhealthy = allChecks.some((c) => c.status === 'down');
  const hasDegraded = allChecks.some((c) => c.status === 'degraded');

  let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  if (hasUnhealthy) {
    overallStatus = 'unhealthy';
  } else if (hasDegraded) {
    overallStatus = 'degraded';
  } else {
    overallStatus = 'healthy';
  }

  const result: HealthCheckResult = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database,
      supabase,
      external_apis: {
        asaas,
        pagarme,
        fcm,
      },
    },
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  };

  // Atualizar cache
  healthCache = result;
  lastCheck = now;

  // Retornar status HTTP apropriado
  const statusCode = overallStatus === 'healthy' ? 200 : 503;
  return NextResponse.json(result, { status: statusCode });
}

/**
 * Check Database Connection
 */
async function checkDatabase(): Promise<CheckStatus> {
  const start = Date.now();
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      signal: AbortSignal.timeout(5000), // 5s timeout
    });

    const responseTime = Date.now() - start;

    if (!response.ok) {
      return {
        status: 'down',
        responseTime,
        error: `HTTP ${response.status}`,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: responseTime > 1000 ? 'degraded' : 'up',
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check Supabase Auth/Realtime
 */
async function checkSupabase(): Promise<CheckStatus> {
  const start = Date.now();
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    const responseTime = Date.now() - start;

    if (!response.ok) {
      return {
        status: 'down',
        responseTime,
        error: `HTTP ${response.status}`,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: responseTime > 1000 ? 'degraded' : 'up',
      responseTime,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check Asaas API
 */
async function checkAsaas(): Promise<CheckStatus> {
  const start = Date.now();
  try {
    // Apenas HEAD request para não consumir quota
    const response = await fetch('https://www.asaas.com/api/v3/customers', {
      method: 'HEAD',
      headers: {
        access_token: process.env.ASAAS_API_KEY || 'test',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout (API externa)
    });

    const responseTime = Date.now() - start;

    // 401 é OK (significa que API está respondendo, só não temos token válido)
    if (response.status === 401 || response.ok) {
      return {
        status: responseTime > 2000 ? 'degraded' : 'up',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: 'down',
      responseTime,
      error: `HTTP ${response.status}`,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check Pagar.me API
 */
async function checkPagarme(): Promise<CheckStatus> {
  const start = Date.now();
  try {
    const response = await fetch('https://api.pagar.me/core/v5/orders', {
      method: 'HEAD',
      headers: {
        Authorization: `Bearer ${process.env.PAGARME_API_KEY || 'test'}`,
      },
      signal: AbortSignal.timeout(10000),
    });

    const responseTime = Date.now() - start;

    // 401/403 é OK (API está respondendo)
    if ([200, 401, 403].includes(response.status)) {
      return {
        status: responseTime > 2000 ? 'degraded' : 'up',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: 'down',
      responseTime,
      error: `HTTP ${response.status}`,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}

/**
 * Check Firebase Cloud Messaging (FCM)
 */
async function checkFCM(): Promise<CheckStatus> {
  const start = Date.now();
  try {
    // FCM não tem endpoint de health, então apenas validamos se temos credenciais
    const hasCredentials = !!(
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );

    if (!hasCredentials) {
      return {
        status: 'down',
        error: 'Missing FCM credentials',
        lastChecked: new Date().toISOString(),
      };
    }

    // Validação básica de conectividade (Firebase REST API)
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer test`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ validate_only: true }),
        signal: AbortSignal.timeout(10000),
      }
    );

    const responseTime = Date.now() - start;

    // 401/403 é OK (API está respondendo)
    if ([401, 403].includes(response.status)) {
      return {
        status: responseTime > 2000 ? 'degraded' : 'up',
        responseTime,
        lastChecked: new Date().toISOString(),
      };
    }

    return {
      status: 'degraded',
      responseTime,
      error: `HTTP ${response.status}`,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      status: 'down',
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
      lastChecked: new Date().toISOString(),
    };
  }
}
