// Expected failures get their own class so the interface layer can tell them
// apart from bugs.
export class PolicyError extends Error {}
export class ProfileError extends Error {}
export class InputError extends Error {}
export class UsageError extends Error {}
