'use client';

import * as Sentry from '@sentry/nextjs';
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log no Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });

    // Callback opcional
    this.props.onError?.(error, errorInfo);

    console.error('ErrorBoundary capturou erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Fallback customizado ou padrão
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <h2 className="mb-2 text-xl font-semibold text-destructive">Ops! Algo deu errado</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando na solução.
            </p>
            <div className="space-y-2">
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                className="text-primary-foreground w-full rounded-md bg-primary px-4 py-2 text-sm font-medium hover:bg-primary/90"
              >
                Tentar novamente
              </button>
              <button
                onClick={() => (window.location.href = '/')}
                className="hover:bg-accent w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium"
              >
                Voltar ao início
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium">
                  Detalhes do erro (dev)
                </summary>
                <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
