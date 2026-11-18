import { describe, expect, expectTypeOf, it } from 'vitest';
import type { StepId, StepMap, StepRecord } from '../../src/domain/model';
import { STEP_IDS, isStepId } from '../../src/domain/model';
import type { NotePatch, RawNote } from '../../src/domain/LearningNote';
import type { TrackerPatch } from '../../src/domain/TrackerState';

/**
 * The type checker holds the contract of the four steps.
 * A wrong step is a compile error, not a bug that shows up in the browser.
 */
describe('the contract of the four steps', () => {
  it('knows exactly four step ids', () => {
    expectTypeOf<StepId>().toEqualTypeOf<'read' | 'build' | 'measure' | 'explain'>();
    expectTypeOf(STEP_IDS).toEqualTypeOf<readonly ['read', 'build', 'measure', 'explain']>();
  });

  it('holds one record per step', () => {
    expectTypeOf<StepMap>().toEqualTypeOf<Record<StepId, StepRecord>>();
  });

  it('refuses a patch that names a step outside the loop', () => {
    expectTypeOf<NotePatch['steps']>().toEqualTypeOf<Partial<Record<StepId, Partial<StepRecord>>> | undefined>();
    // @ts-expect-error "review" is not one of the four steps of the loop.
    const wrong: NotePatch = { steps: { review: { done: true } } };
    expect(wrong).toBeDefined();
  });

  it('refuses a patch that touches something else than the notes', () => {
    // @ts-expect-error a patch only holds notes.
    const wrong: TrackerPatch = { progress: { percent: 50 } };
    expect(wrong).toBeDefined();
  });

  it('keeps the shape of a saved note in one place', () => {
    expectTypeOf<RawNote['steps']>().toEqualTypeOf<Partial<Record<StepId, Partial<StepRecord>>>>();
  });

  it('narrows a string to a step id only when it really is one', () => {
    expectTypeOf(isStepId('read')).toEqualTypeOf<boolean>();
    expect(isStepId('read')).toBe(true);
    expect(isStepId('review')).toBe(false);
  });
});
