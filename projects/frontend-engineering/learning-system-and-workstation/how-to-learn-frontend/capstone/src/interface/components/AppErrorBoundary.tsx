import { Component, type ErrorInfo, type ReactNode } from 'react';
import type { Logger } from '../../domain/ports';

export interface AppErrorBoundaryProps {
  logger: Logger;
  children: ReactNode;
}

interface AppErrorBoundaryState {
  failed: boolean;
}

/**
 * The last line of defence. When a component throws while it renders, React
 * would show a blank page. This class shows a message instead and writes the
 * error to the log.
 */
export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  override state: AppErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.logger.error('the app broke while it was rendering', {
      message: error.message,
      componentStack: info.componentStack ?? '',
    });
  }

  override render(): ReactNode {
    if (this.state.failed) {
      return (
        <p role="alert" className="error">
          Something went wrong. Reload the page to start again.
        </p>
      );
    }
    return this.props.children;
  }
}
