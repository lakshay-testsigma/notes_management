// The orchestration hook: holds the form state and drives the flow from draft
// through validation, generation, save, and download. It is the interface
// between the components and the application/domain layers.

import { useCallback, useState } from 'react';
import {
  DeveloperConfig,
  type BundleDownloader,
  type ConfigStorage,
  type DeveloperConfigInput,
  type GeneratedBundle,
} from '../model';
import { DotfilesGenerator } from '../DotfilesGenerator';
import { ConfigError } from '../../../shared/lib/errors';
import type { Logger } from '../../../shared/lib/Logger';

export interface ConfiguratorServices {
  storage: ConfigStorage;
  downloader: BundleDownloader;
  generator: DotfilesGenerator;
}

export interface FormDraft {
  shell: string;
  gitName: string;
  gitEmail: string;
  editor: string;
  nodeVersion: string;
}

export type Status = 'idle' | 'error' | 'ready';

const DEFAULTS: FormDraft = {
  shell: 'zsh',
  gitName: '',
  gitEmail: '',
  editor: 'vscode',
  nodeVersion: '20.11.0',
};

export function useConfigurator(services: ConfiguratorServices, logger: Logger) {
  const [draft, setDraft] = useState<FormDraft>(() => {
    try {
      const saved = services.storage.load();
      return saved ? draftFromConfig(saved) : DEFAULTS;
    } catch (error) {
      logger.warn('Saved configuration unreadable, starting fresh', { error: String(error) });
      return DEFAULTS;
    }
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [bundle, setBundle] = useState<GeneratedBundle | null>(null);

  const setField = useCallback((field: keyof FormDraft, value: string) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => {
      if (!(field in previous)) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
    setStatus('idle');
  }, []);

  const generate = useCallback(() => {
    try {
      const config = DeveloperConfig.create(draft);
      const nextBundle = services.generator.generate(config);
      services.storage.save(config);
      setBundle(nextBundle);
      setFieldErrors({});
      setStatus('ready');
      logger.info('Dotfiles generated', {
        shell: config.shell,
        editor: config.editor,
        node: config.node.toString(),
      });
    } catch (error) {
      if (error instanceof ConfigError) {
        const field = error.field ?? 'form';
        setFieldErrors({ [field]: error.message });
        logger.warn('Configuration rejected', { code: error.code, field });
      } else {
        logger.error('Generation failed', { error: String(error) });
      }
      setStatus('error');
    }
  }, [draft, services, logger]);

  const download = useCallback(() => {
    if (!bundle) return;
    services.downloader.download(bundle, 'install.sh');
    logger.info('Installer downloaded');
  }, [bundle, services, logger]);

  const reset = useCallback(() => {
    services.storage.clear();
    setDraft(DEFAULTS);
    setFieldErrors({});
    setBundle(null);
    setStatus('idle');
  }, [services]);

  return { draft, fieldErrors, status, bundle, setField, generate, download, reset };
}

function draftFromConfig(config: DeveloperConfig): FormDraft {
  const json: DeveloperConfigInput = config.toJSON();
  return {
    shell: json.shell,
    gitName: json.gitName,
    gitEmail: json.gitEmail,
    editor: json.editor,
    nodeVersion: json.nodeVersion,
  };
}
