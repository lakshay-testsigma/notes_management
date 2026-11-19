// The composition root: the only place that creates the adapters and wires
// them together. Dependencies are passed down through props.

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { EnvConfig } from '../shared/config';
import { ConsoleLogger } from '../shared/lib/Logger';
import { LocalStorageConfigStorage } from '../shared/lib/LocalStorageConfigStorage';
import { BrowserBundleDownloader } from '../shared/lib/BrowserBundleDownloader';
import { DotfilesGenerator } from '../features/configurator/DotfilesGenerator';

const env = EnvConfig.from(import.meta.env as Record<string, string | undefined>);
const sessionId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : 'dev-session';
const logger = new ConsoleLogger(sessionId);
const storage = new LocalStorageConfigStorage(window.localStorage, env.storageKey);
const downloader = new BrowserBundleDownloader();
const generator = new DotfilesGenerator();

const container = document.getElementById('root');
if (!container) {
  throw new Error('Missing #root element');
}

createRoot(container).render(
  <StrictMode>
    <App services={{ storage, downloader, generator }} title={env.appTitle} logger={logger} />
  </StrictMode>,
);
