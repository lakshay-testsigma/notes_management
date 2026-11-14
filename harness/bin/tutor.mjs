#!/usr/bin/env node
// tutor CLI entry point. See harness/README.md for every command.

import { main } from '../lib/cli.mjs';

process.exitCode = main(process.argv.slice(2));
