// React requires a class for an error boundary (componentDidCatch), so this is
// the one class in the view layer. Everything else visual is a function.

import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  logger: { error(message: string, fields?: Record<string, unknown>): void };
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown): void {
    this.props.logger.error('Unhandled render error', { error: String(error) });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <p role="alert">Something went wrong. Reload the page to try again.</p>;
    }
    return this.props.children;
  }
}
