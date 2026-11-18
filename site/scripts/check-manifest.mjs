#!/usr/bin/env node
/**
 * `npm run manifest:check`: keeps the three descriptions of the shared lesson
 * components from drifting apart.
 *
 *   components.manifest.json   what the harness validator reads: the names by
 *                              kind, and under "props" every prop each one takes
 *   src/components/learn/      the code: `Name.astro` and its TypeScript `Props`
 *   COMPONENTS.md              what lesson authors read: one prop table per component
 *
 * It fails (exit 1) when
 *   - a component's `Props` type and its manifest list differ,
 *   - a component's prop table in COMPONENTS.md and its manifest list differ,
 *   - the names in the manifest, in "props", and in src/components/learn/index.ts differ.
 *
 * Only top-level prop names are compared (`nodes`, not the fields of a node).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const learnDir = path.join(siteDir, 'src', 'components', 'learn');
const read = (file) => fs.readFileSync(file, 'utf8');
const problems = [];
const quote = (list) => list.map((item) => `\`${item}\``).join(', ');

/** Report the two-way difference between a list and the manifest's list. */
function compare(component, what, found, listed) {
	const missing = found.filter((prop) => !listed.includes(prop));
	const extra = listed.filter((prop) => !found.includes(prop));
	if (missing.length > 0) problems.push(`${component}: ${what} has ${quote(missing)}, but components.manifest.json "props" does not list ${missing.length === 1 ? 'it' : 'them'}`);
	if (extra.length > 0) problems.push(`${component}: components.manifest.json "props" lists ${quote(extra)}, but ${what} has no such prop`);
}

// ------------------------------------------------------------- manifest ----

const manifest = JSON.parse(read(path.join(siteDir, 'components.manifest.json')));
const names = ['visual', 'activity', 'utility'].flatMap((kind) => (Array.isArray(manifest[kind]) ? manifest[kind] : []));
const listed = manifest.props && typeof manifest.props === 'object' ? manifest.props : {};
if (!manifest.props) problems.push('components.manifest.json has no "props" object');
for (const name of names) if (!Array.isArray(listed[name])) problems.push(`${name}: components.manifest.json "props" has no list for it`);
for (const name of Object.keys(listed)) {
	if (!names.includes(name)) problems.push(`${name}: listed under "props" but not under "visual", "activity" or "utility"`);
	const list = Array.isArray(listed[name]) ? listed[name] : [];
	const twice = list.filter((prop, i) => list.indexOf(prop) !== i);
	if (twice.length > 0) problems.push(`${name}: "props" lists ${quote(twice)} more than once`);
}
const twiceNamed = names.filter((name, i) => names.indexOf(name) !== i);
if (twiceNamed.length > 0) problems.push(`components.manifest.json names ${quote(twiceNamed)} more than once`);

// -------------------------------------------------- the map used by MDX ----

const mapSource = read(path.join(learnDir, 'index.ts'));
const mapBody = mapSource.match(/export const lessonComponents\s*=\s*{([\s\S]*?)};/)?.[1] ?? '';
const mapped = [...mapBody.replace(/\/\/.*$/gm, '').matchAll(/\b([A-Z]\w*)\b/g)].map((match) => match[1]);
for (const name of names) if (!mapped.includes(name)) problems.push(`${name}: in components.manifest.json but not in src/components/learn/index.ts`);
for (const name of mapped) if (!names.includes(name)) problems.push(`${name}: in src/components/learn/index.ts but not in components.manifest.json`);

// --------------------------------------------- TypeScript `Props` types ----

const parse = (file, text) => ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

/** Names of the properties of an interface or object type called `typeName`, following `extends` and imports. */
function propsOfType(file, source, typeName, seen = new Set()) {
	const key = `${file}#${typeName}`;
	if (seen.has(key)) return [];
	seen.add(key);
	const fromMembers = (members) => members.filter(ts.isPropertySignature).map((member) => member.name.getText(source).replace(/^['"]|['"]$/g, ''));
	const fromType = (node) => {
		if (!node) return null;
		if (ts.isTypeLiteralNode(node)) return fromMembers(node.members);
		if (ts.isTypeReferenceNode(node)) return propsOfType(file, source, node.typeName.getText(source), seen);
		if (ts.isIntersectionTypeNode(node)) {
			const parts = node.types.map(fromType);
			return parts.includes(null) ? null : parts.flat();
		}
		if (ts.isParenthesizedTypeNode(node)) return fromType(node.type);
		return null;
	};
	for (const statement of source.statements) {
		if (ts.isInterfaceDeclaration(statement) && statement.name.text === typeName) {
			const inherited = (statement.heritageClauses ?? []).flatMap((clause) => clause.types.flatMap((type) => propsOfType(file, source, type.expression.getText(source), seen) ?? []));
			return [...inherited, ...fromMembers(statement.members)];
		}
		if (ts.isTypeAliasDeclaration(statement) && statement.name.text === typeName) return fromType(statement.type);
		// `import Island, { type XProps } from './react/X.tsx'`: look in that file.
		if (ts.isImportDeclaration(statement) && statement.importClause?.namedBindings && ts.isNamedImports(statement.importClause.namedBindings)) {
			const binding = statement.importClause.namedBindings.elements.find((element) => element.name.text === typeName);
			const from = statement.moduleSpecifier.text;
			if (!binding || !from.startsWith('.')) continue;
			const base = path.resolve(path.dirname(file), from);
			const target = [base, `${base}.ts`, `${base}.tsx`].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
			if (!target) return null;
			return propsOfType(target, parse(target, read(target)), (binding.propertyName ?? binding.name).text, seen);
		}
	}
	return null;
}

for (const name of names) {
	const file = path.join(learnDir, `${name}.astro`);
	if (!fs.existsSync(file)) {
		problems.push(`${name}: src/components/learn/${name}.astro does not exist`);
		continue;
	}
	const frontmatter = read(file).match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
	const found = propsOfType(file, parse(`${file}.ts`, frontmatter), 'Props');
	if (!found) problems.push(`${name}: could not read the \`Props\` type of src/components/learn/${name}.astro (declare \`interface Props\` or \`type Props = SomeProps\`)`);
	else compare(name, `the Props type of ${name}.astro`, found, listed[name] ?? []);
}

// -------------------------------------------------------- COMPONENTS.md ----

const docs = read(path.join(siteDir, 'COMPONENTS.md'));
const headings = [...docs.matchAll(/^## (.+)$/gm)];
const documented = new Map();
headings.forEach((heading, i) => {
	const name = heading[1].trim();
	if (!names.includes(name)) return;
	const section = docs.slice(heading.index, headings[i + 1]?.index ?? docs.length);
	// The first table of the section whose first column is "Prop".
	const table = section.match(/^\| *Prop *\|.*\n\|[ :|-]+\|\n((?:\|.*\n?)*)/m);
	if (!table) return;
	const props = table[1]
		.split('\n')
		.filter((row) => row.startsWith('|'))
		.flatMap((row) => [...(row.split('|')[1] ?? '').matchAll(/`([A-Za-z_]\w*)`/g)].map((match) => match[1]));
	documented.set(name, props);
});
for (const name of names) {
	if (!documented.has(name)) problems.push(`${name}: COMPONENTS.md has no "## ${name}" section with a prop table (first column "Prop")`);
	else compare(name, `the prop table of "## ${name}" in COMPONENTS.md`, documented.get(name), listed[name] ?? []);
}

// --------------------------------------------------------------- result ----

if (problems.length > 0) {
	console.error(`manifest:check: FAILED, ${problems.length} problem(s)\n`);
	for (const problem of problems) console.error(`  - ${problem}`);
	console.error('\nFix the component, components.manifest.json and COMPONENTS.md so that all three name the same props.');
	process.exit(1);
}
const total = names.reduce((sum, name) => sum + listed[name].length, 0);
console.log(`manifest:check: OK, ${names.length} components, ${total} props; components.manifest.json, the Props types and COMPONENTS.md agree`);
