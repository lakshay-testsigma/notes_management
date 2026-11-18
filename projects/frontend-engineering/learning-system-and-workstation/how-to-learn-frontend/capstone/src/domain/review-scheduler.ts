// Spaced review: each successful review waits longer than the one before.
export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30];

export interface ReviewPlan {
  reviewStep: number;
  nextReviewOn: string;
}

export class ReviewScheduler {
  constructor(private readonly intervals: number[] = REVIEW_INTERVAL_DAYS) {}

  // A new note is due the next day.
  first(today: string): ReviewPlan {
    return { reviewStep: 0, nextReviewOn: this.addDays(today, this.intervals[0]) };
  }

  // After the Nth review, wait intervals[N]; the last interval repeats.
  afterReview(currentStep: number, today: string): ReviewPlan {
    const reviewStep = currentStep + 1;
    const wait = this.intervals[Math.min(reviewStep, this.intervals.length - 1)];
    return { reviewStep, nextReviewOn: this.addDays(today, wait) };
  }

  isDue(nextReviewOn: string, today: string): boolean {
    return nextReviewOn <= today; // ISO dates sort as text
  }

  private addDays(iso: string, days: number): string {
    const date = new Date(`${iso}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }
}
