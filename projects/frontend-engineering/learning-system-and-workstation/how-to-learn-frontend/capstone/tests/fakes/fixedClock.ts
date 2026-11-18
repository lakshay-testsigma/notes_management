import type { Clock } from '../../src/domain/model';

/** A clock that always answers the same moment. Used by the unit tests. */
export const fixedClock: Clock = () => '2026-11-19T09:00:00.000Z';

/** A clock that answers a different moment every time it is called. */
export function countingClock(start: string): Clock {
  let count = 0;
  return () => {
    count += 1;
    return `${start}#${count}`;
  };
}
