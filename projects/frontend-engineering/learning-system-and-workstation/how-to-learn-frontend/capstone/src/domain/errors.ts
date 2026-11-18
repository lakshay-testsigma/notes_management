// Domain errors are their own classes so the interface can tell them apart.

export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

// `issues` hold one fix-it sentence per problem, ready to show to the learner.
export class ValidationError extends DomainError {
  constructor(public readonly issues: string[]) {
    super(issues.join(" "));
  }
}

export class NoteNotFoundError extends DomainError {
  constructor(id: string) {
    super(`No note with id "${id}". It may have been deleted in another tab.`);
  }
}

export class UnknownFeatureError extends DomainError {
  constructor(key: string, failingPart: string) {
    super(`Unknown feature "${key}": no part named "${failingPart}".`);
  }
}
