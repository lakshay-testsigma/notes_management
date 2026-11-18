#!/usr/bin/env node
// PreToolUse guard for unattended runs. Exit code 2 blocks the call, even in
// bypassPermissions mode. Rules:
//  1. Edit / Write / NotebookEdit may only touch files inside this repository
//     (or the system temp folders used for scratch files).
//  2. Bash may never ask to run outside the OS sandbox (dangerouslyDisableSandbox).
//  3. Bash may never run `git push` in any form.
// Reading files and web access are not restricted.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function realish(p) {
  // Resolve symlinks of the nearest existing ancestor, so a new file is checked too.
  let cur = path.resolve(p);
  const rest = [];
  while (!fs.existsSync(cur)) {
    const parent = path.dirname(cur);
    if (parent === cur) break;
    rest.unshift(path.basename(cur));
    cur = parent;
  }
  try { cur = fs.realpathSync(cur); } catch {}
  return path.join(cur, ...rest);
}
const inside = (child, parent) => {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
};
function block(msg) {
  process.stderr.write(`Blocked by .claude/hooks/repo-guard.mjs: ${msg}\n`);
  process.exit(2);
}

let raw = '';
process.stdin.on('data', (c) => (raw += c));
process.stdin.on('end', () => {
  let input;
  try { input = JSON.parse(raw); } catch { process.exit(0); }
  const tool = input.tool_name ?? '';
  const ti = input.tool_input ?? {};
  const repo = realish(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());

  if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
    const target = ti.file_path ?? ti.notebook_path;
    if (!target) process.exit(0);
    const abs = realish(path.isAbsolute(target) ? target : path.join(input.cwd || repo, target));
    const scratch = ['/tmp', '/private/tmp', os.tmpdir(), process.env.TMPDIR]
      .filter(Boolean).map(realish);
    const locked = ['.claude/settings.json', '.claude/settings.local.json', '.claude/hooks']
      .map((p) => path.join(repo, p));
    if (locked.some((p) => inside(abs, p))) {
      block(`${abs} holds the agent's own permissions and guard; only the learner edits it.`);
    }
    if (inside(abs, repo) || scratch.some((d) => inside(abs, d))) process.exit(0);
    block(`${tool} outside the repository is not allowed (${abs}). Agents change files only inside ${repo}.`);
  }

  if (tool === 'Bash') {
    if (ti.dangerouslyDisableSandbox === true) {
      block('commands must run inside the sandbox, which limits writes to this repository. Retry without dangerouslyDisableSandbox, or log the blocker with tutor log and continue.');
    }
    const cmd = String(ti.command ?? '');
    if (/(^|[\s;&|(`$])git(\s+(-C\s+\S+|-c\s+\S+|--?[\w-]+(=\S+)?))*\s+push\b/.test(cmd)) {
      block('this repository only commits locally; git push is not allowed for agents. Leave pushing to the learner.');
    }
  }
  process.exit(0);
});
