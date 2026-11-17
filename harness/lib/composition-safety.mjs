// Safety checks and publishing of HyperFrames compositions for the lesson site.
//
// A composition is HTML and JavaScript that runs inside <hyperframes-player>.
// The site loads it with sandbox-origin="opaque", so it cannot read the lesson
// page, but it still runs scripts. Before a composition is published, this
// module rejects anything that reaches the network, the parent page or the
// learner's storage, and then rewrites it to run offline: the pinned GSAP and
// HyperFrames runtime come from the site's own copies (site/public/media/_hf),
// fonts are inlined, and a Content-Security-Policy blocks every connection.

import fs from 'node:fs';
import path from 'node:path';
import { isFile, readJson, readText, writeTextAtomic } from './io.mjs';

export const HF_CORE_VERSION = '0.9.59';
export const GSAP_VERSION = '3.15.0';
export const GSAP_CDN = `https://cdn.jsdelivr.net/npm/gsap@${GSAP_VERSION}/dist/gsap.min.js`;
/** Folder of the shared, pinned runtime files, relative to the repository root. */
export const VENDOR_DIR = 'site/public/media/_hf';
const VENDOR_FILES = {
  'gsap.min.js': { from: 'site/node_modules/gsap/dist/gsap.min.js', pkg: 'site/node_modules/gsap/package.json', version: GSAP_VERSION },
  'hyperframe.runtime.iife.js': { from: 'site/node_modules/@hyperframes/core/dist/hyperframe.runtime.iife.js', pkg: 'site/node_modules/@hyperframes/core/package.json', version: HF_CORE_VERSION },
};

export const CSP = "default-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src data:; img-src 'self' data:; media-src 'self'; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'";

const FORBIDDEN = [
  [/\bfetch\s*\(/, 'network access with fetch()'],
  [/\bXMLHttpRequest\b/, 'network access with XMLHttpRequest'],
  [/\bWebSocket\b/, 'network access with WebSocket'],
  [/\bEventSource\b/, 'network access with EventSource'],
  [/\bsendBeacon\b/, 'network access with sendBeacon'],
  [/\bimport\s*\(/, 'dynamic import()'],
  [/\beval\s*\(/, 'eval()'],
  [/\bnew\s+Function\b/, 'new Function()'],
  [/\bdocument\.cookie\b/, 'cookies'],
  [/\b(localStorage|sessionStorage|indexedDB)\b/, 'browser storage'],
  [/\b(window\.)?top\s*\.\s*(location|document)\b/, 'the top window'],
  [/\bparent\s*\.\s*(document|location|window)\b/, 'the parent page'],
  [/\bwindow\.open\s*\(/, 'window.open()'],
  [/\bDate\.now\s*\(|\bnew Date\s*\(/, 'wall-clock time (a composition must be a function of timeline time)'],
  [/\bMath\.random\s*\(/, 'unseeded randomness'],
  [/<\s*(iframe|object|embed|form|base)\b/i, 'embedded frames, forms or <base>'],
  [/http-equiv\s*=\s*["']?refresh/i, 'a meta refresh'],
  [/javascript\s*:/i, 'javascript: URLs'],
  [/\son[a-z]+\s*=\s*["']/i, 'inline event handler attributes'],
];

/**
 * Problems of composition HTML (or a script file), as plain strings.
 * `allowGsapCdn` accepts the pinned GSAP CDN tag that the editable project uses.
 */
export function compositionSafetyProblems(source, { allowGsapCdn = true, name = 'index.html' } = {}) {
  const problems = [];
  const code = String(source);
  for (const [pattern, what] of FORBIDDEN) if (pattern.test(code)) problems.push(`${name} uses ${what}`);
  for (const match of code.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)) {
    const src = match[1];
    if (allowGsapCdn && src === GSAP_CDN) continue;
    if (/^(https?:)?\/\//i.test(src) || src.startsWith('/')) problems.push(`${name} loads a script from ${src}; only the pinned GSAP (${GSAP_CDN}) or a relative path is allowed`);
  }
  for (const match of code.matchAll(/\b(?:src|href|poster)\s*=\s*["']((?:https?:)?\/\/[^"']+)["']/gi)) {
    if (allowGsapCdn && match[1] === GSAP_CDN) continue;
    problems.push(`${name} references the external resource ${match[1]}; copy it into the project's assets/ folder`);
  }
  for (const match of code.matchAll(/url\(\s*["']?((?:https?:)?\/\/[^"')]+)/gi)) problems.push(`${name} loads the external resource ${match[1]} in CSS`);
  return [...new Set(problems)];
}

/** Copy the pinned GSAP and HyperFrames runtime into the site. Returns { ok, problems, files }. */
export function ensureVendor(root) {
  const problems = [];
  const files = [];
  fs.mkdirSync(path.join(root, VENDOR_DIR), { recursive: true });
  for (const [name, spec] of Object.entries(VENDOR_FILES)) {
    const from = path.join(root, spec.from);
    if (!isFile(from)) {
      problems.push(`${spec.from} is missing; run \`npm install\` in site/ (it pins gsap@${GSAP_VERSION} and @hyperframes/player@${HF_CORE_VERSION})`);
      continue;
    }
    const version = isFile(path.join(root, spec.pkg)) ? readJson(path.join(root, spec.pkg)).version : null;
    if (version !== spec.version) problems.push(`${spec.pkg} is version ${version}; the harness pins ${spec.version}`);
    const to = path.join(root, VENDOR_DIR, name);
    if (!isFile(to) || fs.statSync(to).size !== fs.statSync(from).size || readText(to) !== readText(from)) fs.copyFileSync(from, to);
    files.push(`${VENDOR_DIR}/${name}`);
  }
  return { ok: problems.length === 0, problems, files };
}

const FONT_TYPES = { '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf' };

/**
 * Publish a composition project folder (index.html plus the narration and
 * assets it references) to `destRelative` under the repository root, rewritten
 * to run offline in an opaque sandbox. Returns { ok, problems, files }.
 */
export function publishComposition(root, projectDir, destRelative, { extraScripts = [] } = {}) {
  const html = readText(path.join(projectDir, 'index.html'));
  const problems = compositionSafetyProblems(html);
  for (const script of extraScripts) problems.push(...compositionSafetyProblems(readText(path.join(projectDir, script)), { name: script }));
  if (problems.length) return { ok: false, problems, files: [] };
  const vendor = ensureVendor(root);
  if (!vendor.ok) return { ok: false, problems: vendor.problems, files: [] };

  const dest = path.join(root, destRelative);
  const depth = destRelative.split('/').length - VENDOR_DIR.split('/').length + 1;
  const vendorRelative = `${'../'.repeat(depth)}_hf`;
  let out = html.replace(
    `<script src="${GSAP_CDN}"></script>`,
    `<meta http-equiv="Content-Security-Policy" content="${CSP}" />\n    <script src="${vendorRelative}/gsap.min.js"></script>\n    <script src="${vendorRelative}/hyperframe.runtime.iife.js"></script>`,
  );
  if (out === html) return { ok: false, problems: ['index.html does not load the pinned GSAP with a plain <script src> tag; rebuild it with tutor'], files: [] };
  // An opaque-origin document cannot fetch fonts across origins: inline them.
  out = out.replace(/url\(\s*["']?(assets\/fonts\/[^"')]+)["']?\s*\)/g, (whole, relative) => {
    const file = path.join(projectDir, relative);
    const type = FONT_TYPES[path.extname(file).toLowerCase()];
    if (!type || !isFile(file)) return whole;
    return `url("data:${type};base64,${fs.readFileSync(file).toString('base64')}")`;
  });
  const files = [];
  fs.mkdirSync(dest, { recursive: true });
  const media = new Set([...out.matchAll(/\bsrc\s*=\s*["']((?:narration|assets)\/[^"']+)["']/g)].map((m) => m[1]));
  for (const relative of media) {
    const from = path.join(projectDir, relative);
    if (!isFile(from)) { problems.push(`index.html references ${relative}, which is missing`); continue; }
    const to = path.join(dest, relative);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    if (!isFile(to) || fs.statSync(to).size !== fs.statSync(from).size) fs.copyFileSync(from, to);
    files.push(`${destRelative}/${relative}`);
  }
  if (problems.length) return { ok: false, problems, files: [] };
  const target = path.join(dest, 'index.html');
  if (!isFile(target) || readText(target) !== out) writeTextAtomic(target, out);
  files.unshift(`${destRelative}/index.html`, ...vendor.files);
  return { ok: true, problems: [], files };
}
