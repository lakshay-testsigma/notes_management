import { useEffect, useMemo, useRef, useState } from 'react';
import type * as THREE_NS from 'three';
import { declutter, PRIORITY, textBox } from './declutter';
import { hashString, px, seededRandom, seriesColor, useReducedMotion, useThemeVersion } from './hooks';
import { createStage, type Stage } from './three-stage';
import { Frame, TextButton } from './ui';

interface GraphNode {
	id: string;
	label: string;
	group?: string;
	detail?: string;
	/** relative size, 1 = normal */
	size?: number;
}

interface GraphLink {
	source: string;
	target: string;
}

export interface Graph3DProps {
	title?: string;
	nodes: GraphNode[];
	links: GraphLink[];
	/** Order of groups for colours and the legend. Also the node types offered in editable mode. */
	groups?: { id: string; label: string }[];
	editable?: boolean;
	/** 'all' labels, only the 'focus'ed ones, or 'auto' (all up to 16 nodes) */
	labels?: 'all' | 'focus' | 'auto';
}

interface Body {
	x: number;
	y: number;
	z: number;
	vx: number;
	vy: number;
	vz: number;
}

const REST = 30;

function seedBody(index: number, total: number): Body {
	// Points spread evenly on a sphere: deterministic, so every visit looks the same.
	const radius = 18 + 5 * Math.sqrt(total);
	const y = total > 1 ? 1 - (index / (total - 1)) * 2 : 0;
	const ring = Math.sqrt(Math.max(0, 1 - y * y));
	const angle = index * 2.399963;
	return { x: Math.cos(angle) * ring * radius, y: y * radius, z: Math.sin(angle) * ring * radius, vx: 0, vy: 0, vz: 0 };
}

function simulate(bodies: Map<string, Body>, links: GraphLink[], alpha: number) {
	const list = [...bodies.values()];
	for (let i = 0; i < list.length; i++) {
		const a = list[i];
		for (let j = i + 1; j < list.length; j++) {
			const b = list[j];
			let dx = a.x - b.x;
			let dy = a.y - b.y;
			let dz = a.z - b.z;
			let d2 = dx * dx + dy * dy + dz * dz;
			if (d2 < 0.01) {
				dx = 0.1 * (i + 1);
				dy = 0.1;
				dz = -0.1;
				d2 = 0.03;
			}
			const force = (900 / d2) * alpha;
			const d = Math.sqrt(d2);
			a.vx += (dx / d) * force;
			a.vy += (dy / d) * force;
			a.vz += (dz / d) * force;
			b.vx -= (dx / d) * force;
			b.vy -= (dy / d) * force;
			b.vz -= (dz / d) * force;
		}
		a.vx -= a.x * 0.012 * alpha;
		a.vy -= a.y * 0.012 * alpha;
		a.vz -= a.z * 0.012 * alpha;
	}
	for (const link of links) {
		const a = bodies.get(link.source);
		const b = bodies.get(link.target);
		if (!a || !b) continue;
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const dz = b.z - a.z;
		const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.01;
		const pull = ((d - REST) / d) * 0.06 * alpha;
		a.vx += dx * pull;
		a.vy += dy * pull;
		a.vz += dz * pull;
		b.vx -= dx * pull;
		b.vy -= dy * pull;
		b.vz -= dz * pull;
	}
	for (const body of list) {
		body.vx *= 0.82;
		body.vy *= 0.82;
		body.vz *= 0.82;
		body.x += body.vx;
		body.y += body.vy;
		body.z += body.vz;
	}
}

const slug = (text: string) =>
	text
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '') || 'node';

export default function Graph3D(props: Graph3DProps) {
	const { title, editable = false, labels: labelMode = 'auto' } = props;
	const reduced = useReducedMotion();
	const themeVersion = useThemeVersion();
	const host = useRef<HTMLDivElement | null>(null);
	const stage = useRef<Stage | null>(null);
	const bodies = useRef(new Map<string, Body>());
	const meshes = useRef(new Map<string, THREE_NS.Mesh>());
	const lines = useRef<THREE_NS.LineSegments | null>(null);
	const alpha = useRef(1);

	const [mode, setMode] = useState<'loading' | 'webgl' | 'fallback'>('loading');
	const [nodes, setNodes] = useState<GraphNode[]>(props.nodes);
	const [links, setLinks] = useState<GraphLink[]>(props.links);
	const [selected, setSelected] = useState<string | null>(null);
	const [hovered, setHovered] = useState<string | null>(null);
	const [connecting, setConnecting] = useState(false);
	const [newLabel, setNewLabel] = useState('');
	const [newGroup, setNewGroup] = useState('');

	const groups = useMemo(() => {
		const list = [...(props.groups ?? [])];
		for (const node of nodes) {
			if (node.group && !list.some((g) => g.id === node.group)) list.push({ id: node.group, label: node.group });
		}
		return list;
	}, [props.groups, nodes]);
	const groupIndex = (group?: string) => Math.max(0, groups.findIndex((g) => g.id === group));

	// Everything the render loop needs, without re-subscribing it on each render.
	const live = useRef({ nodes, links, selected, hovered, connecting });
	live.current = { nodes, links, selected, hovered, connecting };
	const neighbours = useMemo(() => {
		const map = new Map<string, Set<string>>();
		for (const link of links) {
			if (!map.has(link.source)) map.set(link.source, new Set());
			if (!map.has(link.target)) map.set(link.target, new Set());
			map.get(link.source)!.add(link.target);
			map.get(link.target)!.add(link.source);
		}
		return map;
	}, [links]);

	// Keep one physics body per node; new nodes appear next to the selected one.
	const syncBodies = () => {
		const ids = new Set(nodes.map((n) => n.id));
		for (const id of [...bodies.current.keys()]) if (!ids.has(id)) bodies.current.delete(id);
		nodes.forEach((node, i) => {
			if (bodies.current.has(node.id)) return;
			const anchor = selected ? bodies.current.get(selected) : null;
			if (anchor && bodies.current.size > 0) {
				const random = seededRandom(hashString(node.id) + i);
				bodies.current.set(node.id, { x: anchor.x + (random() - 0.5) * 16, y: anchor.y + (random() - 0.5) * 16, z: anchor.z + (random() - 0.5) * 16, vx: 0, vy: 0, vz: 0 });
			} else bodies.current.set(node.id, seedBody(i, nodes.length));
		});
	};

	// Create the scene once the component is on screen (client:visible hydrates it lazily).
	useEffect(() => {
		let cancelled = false;
		let made: Stage | null = null;
		const el = host.current;
		if (!el) return;
		syncBodies();
		for (let i = 0; i < 140; i++) simulate(bodies.current, live.current.links, 1 - i / 200);
		alpha.current = 0.3;
		createStage(el, { distance: 150, autoRotate: !window.matchMedia('(prefers-reduced-motion: reduce)').matches })
			.then((result) => {
				if (cancelled) {
					result?.dispose();
					return;
				}
				if (!result) return setMode('fallback');
				made = result;
				stage.current = result;
				const { THREE, scene } = result;
				const segments = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ vertexColors: true, transparent: true }));
				segments.frustumCulled = false;
				scene.add(segments);
				lines.current = segments;
				const reach = Math.max(20, ...[...bodies.current.values()].map((b) => Math.hypot(b.x, b.y, b.z))) * 0.86;
				result.fit({ x: 0, y: 0, z: 0 }, reach);
				const focus = new THREE.Vector3();
				result.onFrame(() => {
					const state = live.current;
					if (alpha.current > 0.02) {
						simulate(bodies.current, state.links, alpha.current);
						alpha.current *= 0.985;
					}
					for (const [id, mesh] of meshes.current) {
						const body = bodies.current.get(id);
						if (body) mesh.position.set(body.x, body.y, body.z);
					}
					const positions = segments.geometry.getAttribute('position') as THREE_NS.BufferAttribute | undefined;
					if (positions && positions.count === state.links.length * 2) {
						state.links.forEach((link, i) => {
							const a = bodies.current.get(link.source);
							const b = bodies.current.get(link.target);
							if (!a || !b) return;
							positions.setXYZ(i * 2, a.x, a.y, a.z);
							positions.setXYZ(i * 2 + 1, b.x, b.y, b.z);
						});
						positions.needsUpdate = true;
					}
					const target = state.selected ? bodies.current.get(state.selected) : null;
					focus.set(target?.x ?? 0, target?.y ?? 0, target?.z ?? 0);
					result.controls.target.lerp(focus, 0.07);
				});
				setMode('webgl');
			})
			.catch(() => setMode('fallback'));
		return () => {
			cancelled = true;
			made?.dispose();
			stage.current = null;
			meshes.current.clear();
			lines.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Scene objects follow the React state: nodes, links, colours, highlight.
	useEffect(() => {
		syncBodies();
		const s = stage.current;
		if (!s || mode !== 'webgl') return;
		const { THREE, scene } = s;
		const ids = new Set(nodes.map((n) => n.id));
		for (const [id, mesh] of meshes.current) {
			if (!ids.has(id)) {
				scene.remove(mesh);
				mesh.geometry.dispose();
				(mesh.material as THREE_NS.Material).dispose();
				meshes.current.delete(id);
			}
		}
		const near = selected ? (neighbours.get(selected) ?? new Set<string>()) : null;
		for (const node of nodes) {
			let mesh = meshes.current.get(node.id);
			if (!mesh) {
				mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 18), new THREE.MeshLambertMaterial({ transparent: true }));
				mesh.userData.id = node.id;
				scene.add(mesh);
				meshes.current.set(node.id, mesh);
				const body = bodies.current.get(node.id);
				if (body) mesh.position.set(body.x, body.y, body.z);
			}
			const material = mesh.material as THREE_NS.MeshLambertMaterial;
			material.color.copy(s.color(`--s${(groupIndex(node.group) % 8) + 1}`));
			const lit = !selected || node.id === selected || near!.has(node.id);
			material.opacity = lit ? 1 : 0.3;
			const base = 3.1 * (node.size ?? 1);
			mesh.scale.setScalar(node.id === selected || node.id === hovered ? base * 1.3 : base);
		}

		const segments = lines.current!;
		const position = new Float32Array(links.length * 6);
		const colour = new Float32Array(links.length * 6);
		const plain = s.color('--line-strong');
		const strong = s.color('--accent');
		const faint = s.color('--line');
		links.forEach((link, i) => {
			const touches = selected && (link.source === selected || link.target === selected);
			const c = !selected ? plain : touches ? strong : faint;
			for (const offset of [0, 3]) colour.set([c.r, c.g, c.b], i * 6 + offset);
		});
		segments.geometry.dispose();
		segments.geometry = new THREE.BufferGeometry();
		segments.geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
		segments.geometry.setAttribute('color', new THREE.BufferAttribute(colour, 3));

		const showAll = labelMode === 'all' || (labelMode === 'auto' && nodes.length <= 16);
		s.setLabels(
			nodes
				.filter((node) => showAll || node.id === selected || node.id === hovered || (near?.has(node.id) ?? false))
				.map((node) => ({
					id: node.id,
					text: node.label,
					position: bodies.current.get(node.id)!,
					className: node.id === selected ? 'is-strong' : selected && !near!.has(node.id) ? 'is-dim' : '',
					offset: 3,
					radius: 3.1 * (node.size ?? 1) * (node.id === selected || node.id === hovered ? 1.3 : 1),
					priority: priorityOf(node.id),
				})),
		);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [nodes, links, selected, hovered, mode, themeVersion, neighbours, labelMode, groups]);

	useEffect(() => {
		alpha.current = Math.max(alpha.current, 0.5);
	}, [nodes.length, links.length]);

	const select = (id: string | null) => {
		if (connecting && id && selected && id !== selected) {
			const exists = links.some((l) => (l.source === selected && l.target === id) || (l.source === id && l.target === selected));
			setLinks((list) =>
				exists ? list.filter((l) => !((l.source === selected && l.target === id) || (l.source === id && l.target === selected))) : [...list, { source: selected, target: id }],
			);
			setConnecting(false);
			setSelected(id);
			return;
		}
		setSelected((current) => (current === id && !connecting ? null : id));
	};

	// Pointer handling on the canvas: hover, and click (a press that did not turn into a drag).
	useEffect(() => {
		const s = stage.current;
		if (!s || mode !== 'webgl') return;
		let down: { x: number; y: number } | null = null;
		const targets = () => [...meshes.current.values()];
		const onMove = (event: PointerEvent) => {
			const hit = s.pick(event, targets());
			const id = (hit?.userData.id as string | undefined) ?? null;
			s.canvas.style.cursor = id ? 'pointer' : 'grab';
			setHovered((current) => (current === id ? current : id));
		};
		const onDown = (event: PointerEvent) => {
			down = { x: event.clientX, y: event.clientY };
		};
		const onUp = (event: PointerEvent) => {
			if (!down || Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) return;
			const hit = s.pick(event, targets());
			selectRef.current((hit?.userData.id as string | undefined) ?? null);
		};
		const onLeave = () => setHovered(null);
		const onKey = (event: KeyboardEvent) => {
			const list = live.current.nodes;
			if (event.key === 'n' || event.key === 'p') {
				const at = list.findIndex((n) => n.id === live.current.selected);
				const next = list[(at + (event.key === 'n' ? 1 : list.length - 1) + (at === -1 && event.key === 'p' ? 1 : 0)) % list.length];
				if (next) selectRef.current(next.id === live.current.selected ? null : next.id);
				s.stopAutoRotate();
			} else if (event.key === 'Escape') selectRef.current(null);
		};
		s.canvas.addEventListener('pointermove', onMove);
		s.canvas.addEventListener('pointerdown', onDown);
		s.canvas.addEventListener('pointerup', onUp);
		s.canvas.addEventListener('pointerleave', onLeave);
		s.canvas.addEventListener('keydown', onKey);
		return () => {
			s.canvas.removeEventListener('pointermove', onMove);
			s.canvas.removeEventListener('pointerdown', onDown);
			s.canvas.removeEventListener('pointerup', onUp);
			s.canvas.removeEventListener('pointerleave', onLeave);
			s.canvas.removeEventListener('keydown', onKey);
		};
	}, [mode]);
	const selectRef = useRef(select);
	selectRef.current = select;

	const addNode = () => {
		const label = newLabel.trim();
		if (!label) return;
		let id = slug(label);
		for (let n = 2; nodes.some((node) => node.id === id); n++) id = `${slug(label)}-${n}`;
		const group = newGroup || groups[0]?.id;
		setNodes((list) => [...list, { id, label, group }]);
		if (selected) setLinks((list) => [...list, { source: selected, target: id }]);
		setNewLabel('');
		setSelected(id);
	};
	const removeSelected = () => {
		if (!selected) return;
		setNodes((list) => list.filter((n) => n.id !== selected));
		setLinks((list) => list.filter((l) => l.source !== selected && l.target !== selected));
		setSelected(null);
		setConnecting(false);
	};
	const reset = () => {
		bodies.current.clear();
		setNodes(props.nodes);
		setLinks(props.links);
		setSelected(null);
		setConnecting(false);
		alpha.current = 1;
	};

	// Which label keeps its place where several would overlap: the pointed-at
	// node, then the selected one, then its neighbours, then the rest in order.
	function priorityOf(id: string): number {
		if (id === hovered) return PRIORITY.hover;
		if (id === selected) return PRIORITY.selected;
		return selected && neighbours.get(selected)?.has(id) ? PRIORITY.near : PRIORITY.plain;
	}

	const node = nodes.find((n) => n.id === selected) ?? null;
	const labelOf = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;
	const connected = node ? [...(neighbours.get(node.id) ?? [])].filter((id) => nodes.some((n) => n.id === id)).map(labelOf) : [];

	// Static picture used when WebGL is not available (and before it loads).
	const ring = nodes.map((n, i) => {
		const angle = (i / Math.max(1, nodes.length)) * Math.PI * 2 - Math.PI / 2;
		return { node: n, x: px(320 + Math.cos(angle) * 230), y: px(200 + Math.sin(angle) * 140) };
	});
	const ringOf = (id: string) => ring.find((r) => r.node.id === id);
	// The flat picture drops overlapping labels by the same rule as the 3D view.
	const ringShown = declutter(ring.map(({ node: n, x, y }) => ({ ...textBox(n.label, x, y + (y < 200 ? -15 : 25)), priority: priorityOf(n.id) })));

	return (
		<Frame name="graph3d" title={title}>
			{groups.length > 1 && (
				<div className="lc-legend">
					{groups.map((group, i) => (
						<span key={group.id}>
							<i className="lc-key is-dot" style={{ background: seriesColor(i) }} />
							{group.label}
						</span>
					))}
				</div>
			)}
			<div ref={host} className={`lc-3d is-${mode}`} data-label={`${title ?? '3D graph'}. Drag to rotate, plus and minus to zoom, N and P to step through the nodes.`}>
				{mode !== 'webgl' && (
					<svg className="lc-3d-fallback" viewBox="0 0 640 400" role="group" aria-label={title ?? 'Graph'}>
						{links.map((link, i) => {
							const a = ringOf(link.source);
							const b = ringOf(link.target);
							if (!a || !b) return null;
							const on = selected && (link.source === selected || link.target === selected);
							return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className={on ? 'is-active' : ''} />;
						})}
						{ring.map(({ node: n, x, y }, i) => (
							<g
								key={n.id}
								transform={`translate(${x},${y})`}
								className={`lc-3d-fallback-node ${n.id === selected ? 'is-selected' : ''}`}
								role="button"
								tabIndex={mode === 'fallback' ? 0 : -1}
								aria-label={n.label}
								onClick={() => select(n.id)}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										select(n.id);
									}
								}}
							>
								<circle r={9 * (n.size ?? 1)} style={{ fill: seriesColor(groupIndex(n.group)) }} />
								<text y={y < 200 ? -15 : 25} textAnchor="middle" className={ringShown[i] === -1 ? 'is-crowded' : undefined}>
									{n.label}
								</text>
							</g>
						))}
					</svg>
				)}
			</div>
			<div className="lc-controls">
				{mode === 'webgl' && (
					<>
						<TextButton onClick={() => stage.current?.zoom(0.8)} label="Zoom in">
							Zoom in
						</TextButton>
						<TextButton onClick={() => stage.current?.zoom(1.25)} label="Zoom out">
							Zoom out
						</TextButton>
					</>
				)}
				{selected && <TextButton onClick={() => select(null)}>Clear selection</TextButton>}
				<span className="lc-quiet lc-controls-note">
					{mode === 'fallback'
						? '3D is not available in this browser, so this is a flat view.'
						: reduced
							? 'Drag to rotate. Select a node to focus it. Point at a node to read a label that had no room.'
							: 'Drag to rotate, scroll to zoom after clicking in. Select a node to focus it. Point at a node to read a label that had no room.'}
				</span>
			</div>
			<div className="lc-detail" aria-live="polite">
				{node ? (
					<>
						<p>
							<strong>{node.label}.</strong> {node.detail}
						</p>
						{connected.length > 0 && <p className="lc-quiet">Connected to {connected.join(', ')}.</p>}
					</>
				) : (
					<p className="lc-quiet">
						{nodes.length} part{nodes.length === 1 ? '' : 's'}, {links.length} connection{links.length === 1 ? '' : 's'}. Nothing selected.
					</p>
				)}
			</div>
			{editable && (
				<div className="lc-edit">
					<form
						className="lc-controls"
						onSubmit={(event) => {
							event.preventDefault();
							addNode();
						}}
					>
						<span className="lc-controls-label">Build:</span>
						<label className="sr-only" htmlFor={`g3-label-${slug(title ?? 'graph')}`}>
							Name of the new part
						</label>
						<input
							id={`g3-label-${slug(title ?? 'graph')}`}
							className="lc-input is-inline"
							placeholder="Name a new part"
							value={newLabel}
							onChange={(e) => setNewLabel(e.target.value)}
							maxLength={40}
						/>
						{groups.length > 1 && (
							<>
								<label className="sr-only" htmlFor={`g3-group-${slug(title ?? 'graph')}`}>
									Kind of part
								</label>
								<select id={`g3-group-${slug(title ?? 'graph')}`} className="lc-input is-inline" value={newGroup || groups[0].id} onChange={(e) => setNewGroup(e.target.value)}>
									{groups.map((group) => (
										<option key={group.id} value={group.id}>
											{group.label}
										</option>
									))}
								</select>
							</>
						)}
						<button type="submit" className="lc-btn" disabled={!newLabel.trim()}>
							{selected ? `Add, linked to ${labelOf(selected)}` : 'Add'}
						</button>
					</form>
					<div className="lc-controls">
						<TextButton onClick={() => setConnecting((c) => !c)} pressed={connecting} disabled={!selected}>
							Connect or disconnect
						</TextButton>
						<TextButton onClick={removeSelected} disabled={!selected}>
							Remove selected
						</TextButton>
						<TextButton onClick={reset}>Reset</TextButton>
						{connecting && selected && <span className="lc-quiet lc-controls-note">Now select the part to link with {labelOf(selected)}.</span>}
					</div>
				</div>
			)}
		</Frame>
	);
}
