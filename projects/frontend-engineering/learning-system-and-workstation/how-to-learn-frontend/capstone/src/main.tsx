/**
 * The composition root.
 * This is the only file that creates the adapters, the use cases, and the
 * controller. Everything else receives what it needs in its constructor.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CompleteStepUseCase } from './application/CompleteStepUseCase';
import { ExportLogUseCase } from './application/ExportLogUseCase';
import { LoadDashboardUseCase } from './application/LoadDashboardUseCase';
import { SaveNoteUseCase } from './application/SaveNoteUseCase';
import { TrackerStore } from './application/TrackerStore';
import { App } from './interface/components/App';
import { AppErrorBoundary } from './interface/components/AppErrorBoundary';
import { TrackerController } from './interface/TrackerController';
import { BrowserStorageAdapter } from './infrastructure/BrowserStorageAdapter';
import { Config } from './infrastructure/Config';
import { JsonLogger } from './infrastructure/JsonLogger';
import { LocalStorageTrackerRepository } from './infrastructure/LocalStorageTrackerRepository';
import './styles.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('the page has no element with the id root');
}

let logger: JsonLogger | null = null;

try {
  const config = Config.fromEnv(import.meta.env as Record<string, string | undefined>);
  logger = new JsonLogger(config.logLevel);
  const storage = new BrowserStorageAdapter();  const repository = new LocalStorageTrackerRepository(storage, config.storageKey, config.schemaVersion, logger);
  const store = new TrackerStore(repository, logger);
  const clock = (): string => new Date().toISOString();
  const controller = new TrackerController(
    store,
    new LoadDashboardUseCase(store),
    new CompleteStepUseCase(store, clock),
    new SaveNoteUseCase(store, clock),
    new ExportLogUseCase(store),
  );

  logger.info('the learning tracker started', {
    storageKey: config.storageKey,
    schemaVersion: config.schemaVersion,
  });

  createRoot(container).render(
    <StrictMode>
      <AppErrorBoundary logger={logger}>
        <App controller={controller} />
      </AppErrorBoundary>
    </StrictMode>,
  );
} catch (cause) {
  // A wrong environment variable must not leave a blank page behind.
  const message = cause instanceof Error ? cause.message : 'The app cannot start.';
  (logger ?? new JsonLogger('error')).error('the app cannot start', { message });
  const paragraph = document.createElement('p');
  paragraph.className = 'error';
  paragraph.setAttribute('role', 'alert');
  paragraph.textContent = message;
  container.replaceChildren(paragraph);
}
