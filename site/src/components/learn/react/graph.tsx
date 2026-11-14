import { useMemo, type KeyboardEvent } from 'react';
import { px, useElementWidth } from './hooks';

/** Shared 2D node-and-edge drawing used by FlowAnimation, SystemDiagram and StateMachine. */

export interface GNode {
	id: string;
	label: string;
	/** Optional position on a 0–100 grid. Give both for every node, or for none. */
	x?: number;
	y?: number;
	kind?: 'box' | 'pill' | 'store';
	detail?: string;
}

export interface GEdge {
	from: string;
	to: string;
	label?: string;
	dashed?: boolean;
}

export type Direction = 'auto' | 'horizontal' | 'vertical';

interface Point {
	x: number;
	y: number;
}

export interface Layout {
	width: number;
	height: number;
	nodeW: number;
	nodeH: number;
	vertical: boolean;
	pos: Record<string, Point>;
}

const NODE_H = 46;
const SSR_WIDTH = 704;

function layers(nodes: GNode[], edges: GEdge[]): Record<string, number> {
	const ids = nodes.map((n) => n.id);
	const out = new Map<string, string[]>(ids.map((id) => [id, []]));
	for (const e of edges) if (e.from !== e.to && out.has(e.from) && out.has(e.to)) out.get(e.from)!.push(e.to);
	// Depth-first search marks back edges, which are ignored so cycles still get layers.
	const state = new Map<string, 0 | 1 | 2>();
	const back = new Set<string>();
	const visit = (id: string) => {
		state.set(id, 1);
		for (const next of out.get(id)!) {
			if (state.get(next) === 1) back.add(`${id}>${next}`);
			else if (!state.get(next)) visit(next);
		}
		state.set(id, 2);
	};
	for (const id of ids) if (!state.get(id)) visit(id);
	const layer: Record<string, number> = Object.fromEntries(ids.map((id) => [id, 0]));
	for (let pass = 0; pass < ids.length; pass++) {
		let changed = false;
		for (const e of edges) {
			if (e.from === e.to || back.has(`${e.from}>${e.to}`) || !(e.from in layer) || !(e.to in layer)) continue;
			if (layer[e.to] < layer[e.from] + 1) {
				layer[e.to] = layer[e.from] + 1;
				changed = true;
			}
		}
		if (!changed) break;
	}
	return layer;
}

export function computeLayout(nodes: GNode[], edges: GEdge[], width: number, direction: Direction): Layout {
	const hasLoop = edges.some((e) => e.from === e.to);
	const padTop = hasLoop ? 46 : 14;
	const pos: Record<string, Point> = {};
	const explicit = nodes.length > 0 && nodes.every((n) => typeof n.x === 'number' && typeof n.y === 'number');

	if (explicit) {
		const columns = new Set(nodes.map((n) => Math.round(n.x!))).size;
		const rows = new Set(nodes.map((n) => Math.round(n.y!))).size;
		const nodeW = Math.max(62, Math.min(140, ((width - 8) / columns) * 0.68));
		const height = Math.max(rows * (NODE_H + 44), Math.min(width * 0.5, 360)) + padTop;
		const padX = nodeW / 2 + 2;
		const padY = NODE_H / 2 + 6;
		for (const n of nodes) {
			pos[n.id] = {
				x: padX + (Math.min(100, Math.max(0, n.x!)) / 100) * (width - 2 * padX),
				y: padTop + padY + (Math.min(100, Math.max(0, n.y!)) / 100) * (height - padTop - 2 * padY),
			};
		}
		return { width, height, nodeW, nodeH: NODE_H, vertical: false, pos };
	}

	const layerOf = layers(nodes, edges);
	const count = Math.max(0, ...Object.values(layerOf)) + 1;
	const groups: GNode[][] = Array.from({ length: count }, () => []);
	for (const n of nodes) groups[layerOf[n.id]].push(n);
	const widest = Math.max(1, ...groups.map((g) => g.length));
	const vertical = direction === 'vertical' || (direction === 'auto' && width / count < 128);

	if (!vertical) {
		const column = width / count;
		const labelled = edges.some((e) => e.label);
		const nodeW = Math.min(136, column * (labelled ? 0.54 : 0.64));
		const rowStep = NODE_H + 30;
		const height = padTop + widest * rowStep - 30 + 14;
		groups.forEach((group, l) => {
			group.forEach((n, i) => {
				pos[n.id] = {
					x: column * (l + 0.5),
					y: padTop + NODE_H / 2 + ((widest - group.length) / 2 + i) * rowStep,
				};
			});
		});
		return { width, height, nodeW, nodeH: NODE_H, vertical, pos };
	}

	const rowStep = NODE_H + 48;
	const nodeW = Math.min(150, (width - (widest - 1) * 14) / widest);
	const height = padTop + count * rowStep - 48 + 14;
	groups.forEach((group, l) => {
		const column = width / group.length;
		group.forEach((n, i) => {
			pos[n.id] = { x: column * (i + 0.5), y: padTop + NODE_H / 2 + l * rowStep };
		});
	});
	return { width, height, nodeW, nodeH: NODE_H, vertical, pos };
}

export interface EdgeLabelPlace extends Point {
	anchor: 'start' | 'middle' | 'end';
}

export interface EdgeShape {
	d: string;
	/** Position along the edge, t from 0 (start) to 1 (end). */
	at: (t: number) => Point;
	/** Where the edge label may go, best first: beside the line, then on its other side. */
	labels: EdgeLabelPlace[];
	arrow: string;
	loop: boolean;
}

function clip(center: Point, toward: Point, w: number, h: number): Point {
	const dx = toward.x - center.x;
	const dy = toward.y - center.y;
	if (dx === 0 && dy === 0) return center;
	const scale = Math.min(Math.abs(dx) > 0 ? (w / 2 + 4) / Math.abs(dx) : Infinity, Math.abs(dy) > 0 ? (h / 2 + 4) / Math.abs(dy) : Infinity);
	return { x: px(center.x + dx * Math.min(scale, 1)), y: px(center.y + dy * Math.min(scale, 1)) };
}

function arrowHead(tip: Point, from: Point): string {
	const angle = Math.atan2(tip.y - from.y, tip.x - from.x);
	const size = 8;
	const a = { x: px(tip.x - size * Math.cos(angle - 0.42)), y: px(tip.y - size * Math.sin(angle - 0.42)) };
	const b = { x: px(tip.x - size * Math.cos(angle + 0.42)), y: px(tip.y - size * Math.sin(angle + 0.42)) };
	return `${tip.x},${tip.y} ${a.x},${a.y} ${b.x},${b.y}`;
}

export function edgeShape(edge: GEdge, edges: GEdge[], layout: Layout): EdgeShape | null {
	const a = layout.pos[edge.from];
	const b = layout.pos[edge.to];
	if (!a || !b) return null;
	const { nodeW: w, nodeH: h } = layout;

	if (edge.from === edge.to) {
		const top = a.y - h / 2;
		const p0 = { x: a.x + 14, y: top - 3 };
		const p3 = { x: a.x - 14, y: top - 3 };
		const c1 = { x: a.x + 40, y: top - 40 };
		const c2 = { x: a.x - 40, y: top - 40 };
		const at = (t: number) => {
			const u = 1 - t;
			return {
				x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p3.x,
				y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p3.y,
			};
		};
		return {
			d: `M${p0.x},${p0.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${p3.x},${p3.y}`,
			at,
			labels: [{ x: a.x, y: top - 36, anchor: 'middle' }],
			arrow: arrowHead(p3, c2),
			loop: true,
		};
	}

	const dx = b.x - a.x;
	const dy = b.y - a.y;
	const length = Math.hypot(dx, dy) || 1;
	const hasReverse = edges.some((other) => other.from === edge.to && other.to === edge.from);
	const normal = { x: dy / length, y: -dx / length };
	// Bend around any node that sits on the straight line between the two ends,
	// towards the side that is further from that node.
	let away = 1;
	const blocked = Object.entries(layout.pos).some(([id, p]) => {
		if (id === edge.from || id === edge.to) return false;
		const t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / (length * length);
		if (t <= 0.1 || t >= 0.9) return false;
		const px = a.x + t * dx;
		const py = a.y + t * dy;
		if (Math.abs(p.x - px) >= w / 2 + 6 || Math.abs(p.y - py) >= h / 2 + 6) return false;
		const side = (p.x - px) * normal.x + (p.y - py) * normal.y;
		away = side > 0.5 ? -1 : side < -0.5 ? 1 : normal.y < 0 || (normal.y === 0 && normal.x > 0) ? 1 : -1;
		return true;
	});
	const bend = hasReverse ? Math.min(26, length * 0.16) : blocked ? Math.min(74, h + length * 0.1) * away : 0;
	const control = { x: px((a.x + b.x) / 2 + normal.x * bend * 2), y: px((a.y + b.y) / 2 + normal.y * bend * 2) };
	const p0 = clip(a, control, w, h);
	const p1 = clip(b, control, w, h);
	const at = (t: number) => {
		const u = 1 - t;
		return { x: u * u * p0.x + 2 * u * t * control.x + t * t * p1.x, y: u * u * p0.y + 2 * u * t * control.y + t * t * p1.y };
	};
	const mid = at(0.5);
	// The label sits beside the line: on the outside of a bend, otherwise on the upper side.
	let side = bend < 0 ? { x: -normal.x, y: -normal.y } : { x: normal.x, y: normal.y };
	if (bend === 0 && (side.y > 0 || (side.y === 0 && side.x < 0))) side = { x: -side.x, y: -side.y };
	const place = (to: Point): EdgeLabelPlace => ({
		x: px(mid.x + to.x * 9),
		y: px(mid.y + to.y * 9 + (to.y > 0.35 ? 9 : Math.abs(to.y) <= 0.35 ? 4 : -1)),
		anchor: to.x > 0.35 ? 'start' : to.x < -0.35 ? 'end' : 'middle',
	});
	return {
		d: bend === 0 ? `M${p0.x},${p0.y} L${p1.x},${p1.y}` : `M${p0.x},${p0.y} Q${control.x},${control.y} ${p1.x},${p1.y}`,
		at,
		labels: [place(side), place({ x: -side.x, y: -side.y })],
		arrow: arrowHead(p1, bend === 0 ? p0 : control),
		loop: false,
	};
}

interface Rect {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

const EDGE_CHAR = 6.2;

function edgeLabelRect(text: string, at: EdgeLabelPlace): Rect {
	const size = text.length * EDGE_CHAR;
	const left = at.anchor === 'start' ? at.x : at.anchor === 'end' ? at.x - size : at.x - size / 2;
	return { left, top: at.y - 11, right: left + size, bottom: at.y + 4 };
}

const touches = (a: Rect, b: Rect) => a.left < b.right + 2 && b.left < a.right + 2 && a.top < b.bottom && b.top < a.bottom;

/**
 * Pick a place for every edge label. A label keeps its usual place unless it
 * would print on top of a label placed before it (two arrows that meet at one
 * node, on a narrow screen); then it moves to the other side of its line when
 * that side is clear of labels and nodes.
 */
export function placeEdgeLabels(edges: GEdge[], shapes: (EdgeShape | null)[], layout: Layout): (EdgeLabelPlace | null)[] {
	const nodes: Rect[] = Object.values(layout.pos).map((p) => ({
		left: p.x - layout.nodeW / 2,
		top: p.y - layout.nodeH / 2,
		right: p.x + layout.nodeW / 2,
		bottom: p.y + layout.nodeH / 2,
	}));
	const taken: Rect[] = [];
	return edges.map((edge, i) => {
		const shape = shapes[i];
		if (!shape || !edge.label) return null;
		const [usual, other] = shape.labels;
		let chosen = usual;
		if (other && taken.some((rect) => touches(edgeLabelRect(edge.label!, usual), rect))) {
			const moved = edgeLabelRect(edge.label, other);
			if (!taken.some((rect) => touches(moved, rect)) && !nodes.some((rect) => touches(moved, rect))) chosen = other;
		}
		taken.push(edgeLabelRect(edge.label, chosen));
		return chosen;
	});
}

/** Wrap a label into at most `maxLines` lines that fit `width` pixels. */
export function wrapLabel(label: string, width: number, charWidth = 6.9, maxLines = 2): string[] {
	const limit = Math.max(4, Math.floor(width / charWidth));
	const lines: string[] = [];
	let line = '';
	for (const word of label.split(/\s+/)) {
		const next = line ? `${line} ${word}` : word;
		if (next.length <= limit || !line) line = next;
		else {
			lines.push(line);
			line = word;
		}
	}
	if (line) lines.push(line);
	const kept = lines.slice(0, maxLines).map((l) => (l.length > limit ? `${l.slice(0, limit - 1)}…` : l));
	if (lines.length > maxLines) kept[maxLines - 1] = `${kept[maxLines - 1].replace(/…$/, '').slice(0, limit - 1)}…`;
	return kept;
}

export interface Packet {
	edge: number;
	t: number;
	reverse?: boolean;
	label?: string;
	failed?: boolean;
}

export function GraphCanvas(props: {
	nodes: GNode[];
	edges: GEdge[];
	direction?: Direction;
	ariaLabel: string;
	/** node id -> extra class names: is-active, is-visited, is-dim, is-broken, is-selected */
	nodeClass?: Record<string, string>;
	/** edge index -> extra class names: is-active, is-visited, is-dim */
	edgeClass?: Record<number, string>;
	packets?: Packet[];
	onNodeClick?: (id: string) => void;
	pressed?: string | null;
}) {
	const { nodes, edges, direction = 'auto', nodeClass = {}, edgeClass = {}, packets = [], onNodeClick } = props;
	const [ref, measured] = useElementWidth<HTMLDivElement>();
	const width = measured && measured > 0 ? measured : SSR_WIDTH;
	const layout = useMemo(() => computeLayout(nodes, edges, width, direction), [nodes, edges, width, direction]);
	const shapes = useMemo(() => edges.map((edge) => edgeShape(edge, edges, layout)), [edges, layout]);
	const labelAt = useMemo(() => placeEdgeLabels(edges, shapes, layout), [edges, shapes, layout]);
	// Bent edges and their labels can leave the node area: include them in the drawing.
	const box = useMemo(() => {
		let top = 0;
		let bottom = layout.height;
		let left = 0;
		let right = layout.width;
		shapes.forEach((shape, i) => {
			if (!shape) return;
			for (let t = 0; t <= 1; t += 0.125) {
				const p = shape.at(t);
				top = Math.min(top, p.y - 8);
				bottom = Math.max(bottom, p.y + 8);
				left = Math.min(left, p.x - 8);
				right = Math.max(right, p.x + 8);
			}
			const text = edges[i].label;
			const at = labelAt[i];
			if (text && at) {
				const rect = edgeLabelRect(text, at);
				top = Math.min(top, at.y - 16);
				bottom = Math.max(bottom, at.y + 10);
				left = Math.min(left, rect.left - 4);
				right = Math.max(right, rect.right + 4);
			}
		});
		return { top: px(top), left: px(left), width: px(right - left), height: px(bottom - top) };
	}, [shapes, labelAt, edges, layout.height, layout.width]);
	const drawn = layout.width / box.width;

	const keyHandler = (id: string) => (event: KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onNodeClick?.(id);
		}
	};

	return (
		<div ref={ref} className="lc-graph">
			<svg
				viewBox={`${box.left} ${box.top} ${box.width} ${box.height}`}
				width={layout.width}
				height={Math.round(box.height * drawn)}
				role="group"
				aria-label={props.ariaLabel}
			>
				{edges.map((edge, i) => {
					const shape = shapes[i];
					if (!shape) return null;
					return (
						<g key={`${edge.from}-${edge.to}-${i}`} className={`lc-edge ${edgeClass[i] ?? ''}`}>
							<path d={shape.d} className={edge.dashed ? 'is-dashed' : undefined} />
							<polygon points={shape.arrow} />
							{edge.label && labelAt[i] && (
								<text x={labelAt[i]!.x} y={labelAt[i]!.y} textAnchor={labelAt[i]!.anchor}>
									{edge.label}
								</text>
							)}
						</g>
					);
				})}
				{nodes.map((node) => {
					const p = layout.pos[node.id];
					if (!p) return null;
					const { nodeW: w, nodeH: h } = layout;
					const lines = wrapLabel(node.label, w - 12);
					const interactive = Boolean(onNodeClick);
					return (
						<g
							key={node.id}
							className={`lc-node kind-${node.kind ?? 'box'} ${nodeClass[node.id] ?? ''} ${interactive ? 'is-clickable' : ''}`}
							transform={`translate(${px(p.x)},${px(p.y)})`}
							role={interactive ? 'button' : undefined}
							tabIndex={interactive ? 0 : undefined}
							aria-pressed={interactive ? props.pressed === node.id : undefined}
							aria-label={interactive ? node.label : undefined}
							onClick={interactive ? () => onNodeClick?.(node.id) : undefined}
							onKeyDown={interactive ? keyHandler(node.id) : undefined}
						>
							<rect x={-w / 2} y={-h / 2} width={w} height={h} rx={node.kind === 'pill' ? h / 2 : 6} />
							{node.kind === 'store' && <path d={`M${-w / 2 + 6},${-h / 2 + 7} H${w / 2 - 6}`} className="lc-node-mark" />}
							<text textAnchor="middle" y={node.kind === 'store' ? 2 : 0}>
								{lines.map((line, i) => (
									<tspan key={i} x={0} dy={i === 0 ? `${0.35 - (lines.length - 1) * 0.6}em` : '1.2em'}>
										{line}
									</tspan>
								))}
							</text>
						</g>
					);
				})}
				{packets.map((packet, i) => {
					const shape = shapes[packet.edge];
					if (!shape) return null;
					const p = shape.at(packet.reverse ? 1 - packet.t : packet.t);
					return (
						<g key={i} className={`lc-packet ${packet.failed ? 'is-failed' : ''}`} transform={`translate(${p.x},${p.y})`}>
							<circle r={6.5} />
							{packet.label && (
								<text y={-12} textAnchor="middle">
									{packet.label}
								</text>
							)}
						</g>
					);
				})}
			</svg>
		</div>
	);
}
