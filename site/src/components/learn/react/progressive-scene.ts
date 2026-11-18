/** Full snapshots make seeking and reversing independent of playback history. */
export interface SceneNode {
	id: string;
	label: string;
	detail: string;
	position: [number, number];
	kind?: 'block' | 'store' | 'queue' | 'client';
}
export interface SceneEdge {
	id: string;
	from: string;
	to: string;
	label: string;
}
export interface SceneStep {
	title: string;
	description: string;
	nodes: string[];
	edges: string[];
	focus?: string[];
	failed?: string[];
	changes: string[];
	metrics?: { label: string; value: string }[];
	source_ids?: string[];
}
export interface ProgressiveSceneProps {
	title: string;
	intro: string;
	nodes: SceneNode[];
	edges: SceneEdge[];
	steps: SceneStep[];
}

export function sceneProblems(props: ProgressiveSceneProps): string[] {
	const errors: string[] = [];
	const text = (v: unknown) => typeof v === 'string' && v.trim().length > 0;
	if (!text(props.title) || !text(props.intro)) errors.push('title and intro are required');
	if (!Array.isArray(props.nodes) || !Array.isArray(props.edges) || !Array.isArray(props.steps)) return [...errors, 'nodes, edges and steps must be arrays'];
	if (props.nodes.length < 1 || props.nodes.length > 7) errors.push('use 1–7 nodes per scene');
	if (props.steps.length < 2 || props.steps.length > 12) errors.push('use 2–12 steps per scene');
	const ids = new Set<string>(), edgeIds = new Set<string>();
	for (const node of props.nodes) {
		if (!node || !text(node.id) || ids.has(node.id)) { errors.push('node IDs must be nonempty and unique'); continue; }
		ids.add(node.id);
		if (!text(node.label) || node.label.length > 28 || !text(node.detail)) errors.push(`${node.id}: needs a short label (≤28 characters) and detail`);
		if (!Array.isArray(node.position) || node.position.length !== 2 || !node.position.every(Number.isFinite)) errors.push(`${node.id}: position must contain two finite numbers`);
		if (node.kind && !['block', 'store', 'queue', 'client'].includes(node.kind)) errors.push(`${node.id}: unknown kind`);
	}
	for (const edge of props.edges) {
		if (!edge || !text(edge.id) || edgeIds.has(edge.id)) { errors.push('edge IDs must be nonempty and unique'); continue; }
		edgeIds.add(edge.id);
		if (!ids.has(edge.from) || !ids.has(edge.to) || edge.from === edge.to || !text(edge.label)) errors.push(`${edge.id}: needs two distinct known endpoints and a label`);
	}
	if (errors.length) return errors;
	for (const [i, step] of props.steps.entries()) {
		if (!step || !text(step.title) || !text(step.description)) { errors.push(`step ${i + 1}: needs title and description`); continue; }
		if (!Array.isArray(step.nodes) || !step.nodes.length || step.nodes.some(id => !ids.has(id)) || new Set(step.nodes).size !== step.nodes.length) errors.push(`step ${i + 1}: nodes must be unique known IDs`);
		if (!Array.isArray(step.edges) || step.edges.some(id => !edgeIds.has(id)) || new Set(step.edges).size !== step.edges.length) errors.push(`step ${i + 1}: edges must be unique known IDs`);
		const visible = Array.isArray(step.nodes) ? step.nodes : [];
		for (const key of ['focus', 'failed'] as const) if (step[key] && (!Array.isArray(step[key]) || step[key]!.some(id => !visible.includes(id)))) errors.push(`step ${i + 1}: ${key} must name visible nodes`);
		if (!Array.isArray(step.changes) || !step.changes.length || !step.changes.every(text)) errors.push(`step ${i + 1}: explain what changed`);
		if (step.metrics && (!Array.isArray(step.metrics) || step.metrics.some(m => !m || !text(m.label) || !text(m.value)))) errors.push(`step ${i + 1}: metrics need labels and values`);
		if (step.source_ids && (!Array.isArray(step.source_ids) || !step.source_ids.every(text))) errors.push(`step ${i + 1}: source_ids must list source IDs`);
		for (const edge of props.edges.filter(e => Array.isArray(step.edges) && step.edges.includes(e.id))) {
			if (!visible.includes(edge.from) || !visible.includes(edge.to)) errors.push(`step ${i + 1}: ${edge.id} has a hidden endpoint`);
			if (step.failed?.includes(edge.from) || step.failed?.includes(edge.to)) errors.push(`step ${i + 1}: ${edge.id} cannot carry traffic through a failed node; remove it and explain the blocked route`);
		}
	}
	return errors;
}

export function sceneSnapshot(props: ProgressiveSceneProps, index: number) {
	const at = Math.max(0, Math.min(props.steps.length - 1, Number.isFinite(index) ? Math.round(index) : 0));
	const step = props.steps[at];
	return { index: at, step, nodes: props.nodes.filter(n => step.nodes.includes(n.id)), edges: props.edges.filter(e => step.edges.includes(e.id)) };
}
