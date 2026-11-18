/**
 * The hook the React parts use.
 * It holds the state of the dashboard, calls the controller, and turns a
 * domain error into a message the developer can read.
 */

import { useCallback, useEffect, useState } from 'react';
import type { NoteDraft, StepId } from '../../domain/model';
import { buildDashboard, type Dashboard } from '../../domain/Progress';
import type { TrackerController } from '../TrackerController';

export type TrackerStatus = 'loading' | 'ready' | 'error';

export interface TrackerViewModel {
  status: TrackerStatus;
  dashboard: Dashboard | null;
  error: string | null;
  setStep: (noteId: string, step: StepId, done: boolean) => void;
  saveNote: (draft: NoteDraft) => void;
  exportLog: () => Promise<string | null>;
}

export function useTracker(controller: TrackerController): TrackerViewModel {
  const [status, setStatus] = useState<TrackerStatus>('loading');
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The dashboard follows the log, so every change shows up at once.
  useEffect(
    () =>
      controller.subscribe((state) => {
        setDashboard(buildDashboard(state));
      }),
    [controller],
  );

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    controller
      .loadDashboard()
      .then((loaded) => {
        if (cancelled) {
          return;
        }
        setDashboard(loaded);
        setError(null);
        setStatus('ready');
      })
      .catch((cause: unknown) => {
        if (cancelled) {
          return;
        }
        setError(messageOf(cause));
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [controller]);

  const setStep = useCallback(
    (noteId: string, step: StepId, done: boolean) => {
      void controller.setStep(noteId, step, { done }).catch((cause: unknown) => {
        setError(messageOf(cause));
      });
    },
    [controller],
  );

  const saveNote = useCallback(
    (draft: NoteDraft) => {
      void controller.saveNote(draft).catch((cause: unknown) => {
        setError(messageOf(cause));
      });
    },
    [controller],
  );

  const exportLog = useCallback(async () => {
    try {
      return await controller.exportLog();
    } catch (cause: unknown) {
      setError(messageOf(cause));
      return null;
    }
  }, [controller]);

  return { status, dashboard, error, setStep, saveNote, exportLog };
}

/** The message of an error the app does not know. */
function messageOf(cause: unknown): string {
  if (cause instanceof Error) {
    return cause.message;
  }
  return 'Something went wrong.';
}
