// Domain errors with one fixed code per failure class. The interface layer
// branches on the code, never on the message — the same idea as nvm's distinct
// exit codes (nvm-findings, finding 3).

export type ConfigErrorCode =
  | 'MISSING_SHELL'
  | 'INVALID_SHELL'
  | 'MISSING_GIT_NAME'
  | 'INVALID_GIT_NAME'
  | 'MISSING_GIT_EMAIL'
  | 'INVALID_GIT_EMAIL'
  | 'MISSING_EDITOR'
  | 'INVALID_EDITOR'
  | 'MISSING_NODE_VERSION'
  | 'INVALID_NODE_VERSION'
  | 'STORAGE_READ'
  | 'STORAGE_WRITE'
  | 'GENERATION'
  | 'UNEXPECTED';

export const ERROR_MESSAGES: Record<ConfigErrorCode, string> = {
  MISSING_SHELL: 'Choose a shell.',
  INVALID_SHELL: 'That shell is not supported.',
  MISSING_GIT_NAME: 'Enter your git name.',
  INVALID_GIT_NAME:
    'The git name must be 1 to 120 letters, digits, spaces, dots, dashes or apostrophes.',
  MISSING_GIT_EMAIL: 'Enter your git email.',
  INVALID_GIT_EMAIL: 'Enter a valid email address.',
  MISSING_EDITOR: 'Choose an editor.',
  INVALID_EDITOR: 'That editor is not supported.',
  MISSING_NODE_VERSION: 'Enter a Node version.',
  INVALID_NODE_VERSION: 'Use a three-part version such as 20.11.0.',
  STORAGE_READ: 'The saved configuration could not be read.',
  STORAGE_WRITE: 'The configuration could not be saved.',
  GENERATION: 'The dotfiles could not be generated.',
  UNEXPECTED: 'Something unexpected went wrong.',
};

export class ConfigError extends Error {
  constructor(
    readonly code: ConfigErrorCode,
    readonly field?: string,
  ) {
    super(ERROR_MESSAGES[code]);
    this.name = 'ConfigError';
  }
}

/** A validation failure: the input was missing or not in the allow-list. */
export class InvalidConfigError extends ConfigError {}

/** A persistence failure in a storage adapter. */
export class StorageError extends ConfigError {}

/** An internal failure while building the dotfiles. */
export class GenerationError extends ConfigError {}
