import { ConfigError } from '../domain/errors.js';
import { conventionalPreset } from '../domain/CommitRules.js';
import { LEVELS } from './JsonLogger.js';

const list = (text, fallback) =>
  (text ?? fallback).split(',').map((s) => s.trim()).filter(Boolean);

/** Reads settings from environment variables only. Fails at startup when a value is wrong. */
export class Config {
  constructor(env = process.env) {
    this.requiredTools = list(env.DEVKIT_REQUIRED_TOOLS, 'node,git,npm');
    this.optionalTools = list(env.DEVKIT_OPTIONAL_TOOLS, 'code,corepack');
    this.maxHeader = Number(env.DEVKIT_MAX_HEADER ?? 72);
    this.warnRules = list(env.DEVKIT_WARN_RULES, '');
    this.logLevel = env.DEVKIT_LOG_LEVEL ?? 'warn';
    this.#validate();
  }

  #validate() {
    if (this.requiredTools.length === 0) throw new ConfigError('DEVKIT_REQUIRED_TOOLS is empty');
    if (!Number.isInteger(this.maxHeader) || this.maxHeader < 20) {
      throw new ConfigError('DEVKIT_MAX_HEADER must be a whole number of at least 20');
    }
    if (!(this.logLevel in LEVELS)) {
      throw new ConfigError(`DEVKIT_LOG_LEVEL must be one of: ${Object.keys(LEVELS).join(', ')}`);
    }
    const known = Object.keys(conventionalPreset());
    const unknown = this.warnRules.filter((r) => !known.includes(r));
    if (unknown.length > 0) throw new ConfigError(`DEVKIT_WARN_RULES names unknown rule(s): ${unknown.join(', ')}`);
  }

  get tools() {
    return { required: this.requiredTools, optional: this.optionalTools };
  }

  get rulePreset() {
    return conventionalPreset({ maxHeader: this.maxHeader, warnRules: this.warnRules });
  }
}
