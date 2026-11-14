import { useEffect, useMemo, useRef, useState } from 'react';
import type * as THREE_NS from 'three';
import { declutter, PRIORITY, textBox } from './declutter';
import { formatNumber, px, seriesColor, useThemeVersion } from './hooks';
import { createStage, type Stage } from './three-stage';
import { Frame, TextButton } from './ui';

interface Vec {
	x: number;
	y: number;
	z: number;
}

interface SpacePoint extends Vec {
	label: string;
	group?: string;
}

type Metric = 'cosine' | 'euclidean';

export interface VectorSpace3DProps {
	title?: string;
	points: SpacePoint[];
	/** Starting position of the movable query point. */
	query?: Vec & { label?: string };
	/** How many nearest neighbours to highlight (default 3). */
	k?: number;
	metric?: Metric;
	/** Names of the x, y and z axes. */
	axes?: [string, string, string];
}

const EXTENT = 46;

function score(a: Vec, b: Vec, metric: Metric): number {
	if (metric === 'euclidean') return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
	const dot = a.x * b.x + a.y * b.y + a.z * b.z;
	const size = Math.hypot(a.x, a.y, a.z) * Math.hypot(b.x, b.y, b.z);
	return size === 0 ? 0 : dot / size;
}

export default function VectorSpace3D(props: VectorSpace3DProps) {
	const { title, points, axes = ['x', 'y', 'z'] } = props;
	const themeVersion = useThemeVersion();
	const host = useRef<HTMLDivElement | null>(null);
	const stage = useRef<Stage | null>(null);
	const objects = useRef<{ points: THREE_NS.Mesh[]; query: THREE_NS.Mesh; rays: THREE_NS.LineSegments; axes: THREE_NS.LineSegments } | null>(null);
	const [mode, setMode] = useState<'loading' | 'webgl' | 'fallback'>('loading');
	const [metric, setMetric] = useState<Metric>(props.metric ?? 'cosine');
	const [k, setK] = useState(Math.min(points.length, Math.max(1, props.k ?? 3)));
	// The point under the pointer, and the point picked by a click or the N / P keys.
	// Their labels always show, even where labels are too crowded to print them all.
	const [hovered, setHovered] = useState<number | null>(null);
	const [focused, setFocused] = useState<number | null>(null);

	const limit = useMemo(() => {
		const values = [...points, props.query ?? { x: 0, y: 0, z: 0 }].flatMap((p) => [Math.abs(p.x), Math.abs(p.y), Math.abs(p.z)]);
		const max = Math.max(0.001, ...values);
		const power = Math.pow(10, Math.floor(Math.log10(max)));
		return Math.ceil(max / power) * power;
	}, [points, props.query]);
	const [query, setQuery] = useState<Vec>(() => ({ x: props.query?.x ?? limit / 2, y: props.query?.y ?? limit / 2, z: props.query?.z ?? limit / 2 }));
	const queryLabel = props.query?.label ?? 'query';
	const scale = EXTENT / limit;
	// Data that never goes negative gets axes that start at the origin.
	const positive = useMemo(() => [...points, props.query ?? { x: 0, y: 0, z: 0 }].every((p) => p.x >= 0 && p.y >= 0 && p.z >= 0), [points, props.query]);
	const lower = positive ? 0 : -limit;

	const groups = useMemo(() => [...new Set(points.map((p) => p.group ?? ''))], [points]);
	const ranked = useMemo(() => {
		const list = points.map((p, i) => ({ i, value: score(query, p, metric) }));
		list.sort((a, b) => (metric === 'cosine' ? b.value - a.value : a.value - b.value));
		return list;
	}, [points, query, metric]);
	const nearest = ranked.slice(0, k);
	const nearestSet = new Set(nearest.map((n) => n.i));

	// Which label keeps its place where several would overlap: the pointed-at or
	// picked point, then the query, then the nearest neighbours (closest first),
	// then the axis names, then the other points in the order they were given.
	const priorityOf = (i: number) => {
		if (i === hovered || i === focused) return PRIORITY.hover;
		const rank = nearest.findIndex((n) => n.i === i);
		return rank === -1 ? PRIORITY.plain : PRIORITY.near - rank;
	};
	const radiusOf = (i: number) => (nearestSet.has(i) ? 2.9 : 2) * (i === hovered || i === focused ? 1.25 : 1);

	const live = useRef({ limit, scale, lower });
	live.current = { limit, scale, lower };

	useEffect(() => {
		let cancelled = false;
		let made: Stage | null = null;
		const el = host.current;
		if (!el) return;
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
				const sphere = new THREE.SphereGeometry(1, 24, 16);
				const pointMeshes = points.map((_point, index) => {
					const mesh = new THREE.Mesh(sphere, new THREE.MeshLambertMaterial({ transparent: true }));
					mesh.userData.index = index;
					scene.add(mesh);
					return mesh;
				});
				const queryMesh = new THREE.Mesh(sphere, new THREE.MeshLambertMaterial());
				queryMesh.scale.setScalar(3.4);
				scene.add(queryMesh);
				const rays = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ vertexColors: true }));
				rays.frustumCulled = false;
				scene.add(rays);
				const axisLines = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial());
				axisLines.geometry.setAttribute(
					'position',
					new THREE.BufferAttribute(new Float32Array(positive ? [0, 0, 0, EXTENT, 0, 0, 0, 0, 0, 0, EXTENT, 0, 0, 0, 0, 0, 0, EXTENT] : [-EXTENT, 0, 0, EXTENT, 0, 0, 0, -EXTENT, 0, 0, EXTENT, 0, 0, 0, -EXTENT, 0, 0, EXTENT]), 3),
				);
				scene.add(axisLines);
				objects.current = { points: pointMeshes, query: queryMesh, rays, axes: axisLines };
				const half = EXTENT / 2;
				if (positive) result.fit({ x: half, y: half, z: half }, EXTENT * 0.8);
				else result.fit({ x: 0, y: 0, z: 0 }, EXTENT * 1.2);

				// Drag the query point on the plane that faces the camera.
				const plane = new THREE.Plane();
				const hit = new THREE.Vector3();
				let dragging = false;
				const clampAxis = (v: number) => Math.min(live.current.limit, Math.max(live.current.lower, v));
				const targets = [queryMesh, ...pointMeshes];
				let press: { x: number; y: number } | null = null;
				const onDown = (event: PointerEvent) => {
					press = { x: event.clientX, y: event.clientY };
					if (result.pick(event, targets) !== queryMesh) return;
					dragging = true;
					result.controls.enabled = false;
					result.canvas.setPointerCapture(event.pointerId);
					plane.setFromNormalAndCoplanarPoint(result.camera.getWorldDirection(new THREE.Vector3()), queryMesh.position);
					event.preventDefault();
				};
				const onMove = (event: PointerEvent) => {
					if (!dragging) {
						const under = result.pick(event, targets);
						const index = under && under !== queryMesh ? (under.userData.index as number) : null;
						result.canvas.style.cursor = under === queryMesh ? 'move' : index !== null ? 'pointer' : 'grab';
						setHovered((current) => (current === index ? current : index));
						return;
					}
					if (!result.ray(event).intersectPlane(plane, hit)) return;
					const s = live.current.scale;
					setQuery({ x: clampAxis(hit.x / s), y: clampAxis(hit.y / s), z: clampAxis(hit.z / s) });
				};
				const onUp = (event: PointerEvent) => {
					// A press that did not turn into a drag picks the point under it (touch has no hover).
					if (!dragging && press && event.type === 'pointerup' && Math.hypot(event.clientX - press.x, event.clientY - press.y) <= 6) {
						const under = result.pick(event, targets);
						const index = under && under !== queryMesh ? (under.userData.index as number) : null;
						setFocused((current) => (current === index ? null : index));
					}
					press = null;
					dragging = false;
					result.controls.enabled = true;
				};
				const onLeave = () => setHovered(null);
				const onKey = (event: KeyboardEvent) => {
					if (event.key === 'n' || event.key === 'p') {
						const total = pointMeshes.length;
						if (total === 0) return;
						setFocused((current) => (current === null ? (event.key === 'n' ? 0 : total - 1) : (current + (event.key === 'n' ? 1 : total - 1)) % total));
						result.stopAutoRotate();
					} else if (event.key === 'Escape') setFocused(null);
				};
				result.canvas.addEventListener('pointerdown', onDown, { capture: true });
				result.canvas.addEventListener('pointermove', onMove);
				result.canvas.addEventListener('pointerup', onUp);
				result.canvas.addEventListener('pointercancel', onUp);
				result.canvas.addEventListener('pointerleave', onLeave);
				result.canvas.addEventListener('keydown', onKey);
				setMode('webgl');
			})
			.catch(() => setMode('fallback'));
		return () => {
			cancelled = true;
			made?.dispose();
			stage.current = null;
			objects.current = null;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Push the React state (query, metric, k, theme) into the scene.
	useEffect(() => {
		const s = stage.current;
		const o = objects.current;
		if (!s || !o || mode !== 'webgl') return;
		const { THREE } = s;
		points.forEach((p, i) => {
			const mesh = o.points[i];
			if (!mesh) return;
			mesh.position.set(p.x * scale, p.y * scale, p.z * scale);
			const material = mesh.material as THREE_NS.MeshLambertMaterial;
			material.color.copy(s.color(`--s${(Math.max(0, groups.indexOf(p.group ?? '')) % 8) + 1}`));
			material.opacity = nearestSet.has(i) || i === hovered || i === focused ? 1 : 0.5;
			mesh.scale.setScalar(radiusOf(i));
		});
		o.query.position.set(query.x * scale, query.y * scale, query.z * scale);
		(o.query.material as THREE_NS.MeshLambertMaterial).color.copy(s.color('--text'));
		(o.axes.material as THREE_NS.LineBasicMaterial).color.copy(s.color('--line-strong'));

		const strong = s.color('--accent');
		const soft = s.color('--line-strong');
		const position: number[] = [];
		const colour: number[] = [];
		const segment = (a: Vec, b: Vec, c: THREE_NS.Color) => {
			position.push(a.x * scale, a.y * scale, a.z * scale, b.x * scale, b.y * scale, b.z * scale);
			colour.push(c.r, c.g, c.b, c.r, c.g, c.b);
		};
		const origin = { x: 0, y: 0, z: 0 };
		for (const n of nearest) {
			// Euclidean: straight lines between points. Cosine: directions from the origin.
			if (metric === 'euclidean') segment(query, points[n.i], strong);
			else segment(origin, points[n.i], strong);
		}
		if (metric === 'cosine') segment(origin, query, soft);
		o.rays.geometry.dispose();
		o.rays.geometry = new THREE.BufferGeometry();
		o.rays.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(position), 3));
		o.rays.geometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colour), 3));

		s.setLabels([
			...points.map((p, i) => ({
				id: `p${i}`,
				text: p.label,
				position: { x: p.x * scale, y: p.y * scale, z: p.z * scale },
				className: nearestSet.has(i) || i === focused ? 'is-strong' : i === hovered ? '' : 'is-dim',
				offset: 2,
				radius: radiusOf(i),
				priority: priorityOf(i),
			})),
			{ id: 'query', text: queryLabel, position: { x: query.x * scale, y: query.y * scale, z: query.z * scale }, className: 'is-query', offset: 4, radius: 3.4, above: true, priority: PRIORITY.query },
			...axes.map((name, i) => ({
				id: `axis${i}`,
				text: name,
				position: { x: i === 0 ? EXTENT + 7 : 0, y: i === 1 ? EXTENT + 7 : 0, z: i === 2 ? EXTENT + 7 : 0 },
				className: 'is-axis',
				offset: -7,
				priority: PRIORITY.axis,
			})),
		]);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mode, points, query, metric, k, themeVersion, scale, hovered, focused]);

	// Flat picture for browsers without WebGL: an oblique projection of the same data.
	const zoom = positive ? 5.4 : 3.2;
	const flat = (p: Vec) => ({
		x: px((positive ? 250 : 320) + (p.x * scale - p.z * scale * 0.45) * zoom),
		y: px((positive ? 300 : 200) - (p.y * scale - p.z * scale * 0.28) * zoom),
	});
	const axisEnds = [
		{ x: limit, y: 0, z: 0 },
		{ x: 0, y: limit, z: 0 },
		{ x: 0, y: 0, z: limit },
	];
	// The flat picture drops overlapping labels by the same rule as the 3D view.
	const flatPoints = points.map((p) => flat(p));
	const flatQuery = flat(query);
	const flatShown = declutter([
		...points.map((p, i) => ({ ...textBox(p.label, flatPoints[i].x, flatPoints[i].y - 11), priority: priorityOf(i) })),
		{ ...textBox(queryLabel, flatQuery.x, flatQuery.y + 22), priority: PRIORITY.query },
		...axisEnds.map((end, i) => ({ ...textBox(axes[i], flat(end).x, flat(end).y - 6, 11), priority: PRIORITY.axis })),
	]);
	const step = limit / 50;
	const id = `vs-${(title ?? 'space').replace(/\W+/g, '-')}`;

	return (
		<Frame name="vector3d" title={title}>
			{groups.length > 1 && (
				<div className="lc-legend">
					{groups.map((group, i) => (
						<span key={group}>
							<i className="lc-key is-dot" style={{ background: seriesColor(i) }} />
							{group || 'other'}
						</span>
					))}
				</div>
			)}
			<div ref={host} className={`lc-3d is-${mode}`} data-label={`${title ?? '3D vector space'}. Drag to rotate, plus and minus to zoom, N and P to step through the points. Move the query point with the sliders below.`}>
				{mode !== 'webgl' && (
					<svg className="lc-3d-fallback" viewBox="0 0 640 400" role="img" aria-label={title ?? 'Vector space'}>
						{axisEnds.map((end, i) => {
							const a = flat(positive ? { x: 0, y: 0, z: 0 } : { x: -end.x, y: -end.y, z: -end.z });
							const b = flat(end);
							return (
								<g key={`axis${i}`}>
									<line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
									<text x={b.x} y={b.y - 6} textAnchor="middle" className="lc-3d-fallback-axis">
										{axes[i]}
									</text>
								</g>
							);
						})}
						{nearest.map((n) => {
							const a = flat(metric === 'cosine' ? { x: 0, y: 0, z: 0 } : query);
							const b = flat(points[n.i]);
							return <line key={n.i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="is-active" />;
						})}
						{points.map((p, i) => {
							const at = flatPoints[i];
							const lit = nearestSet.has(i) || i === focused;
							return (
								<g
									key={i}
									transform={`translate(${at.x},${at.y})`}
									className="lc-3d-fallback-node"
									opacity={lit ? 1 : 0.5}
									role="img"
									aria-label={p.label}
									tabIndex={mode === 'fallback' ? 0 : -1}
									onClick={() => setFocused((current) => (current === i ? null : i))}
								>
									<circle r={lit ? 7 : 5} style={{ fill: seriesColor(Math.max(0, groups.indexOf(p.group ?? ''))) }} />
									<text y={-11} textAnchor="middle" className={flatShown[i] === -1 ? 'is-crowded' : undefined}>
										{p.label}
									</text>
								</g>
							);
						})}
						<g transform={`translate(${flatQuery.x},${flatQuery.y})`} className="lc-3d-fallback-node is-query">
							<circle r={8} />
							<text y={22} textAnchor="middle">
								{queryLabel}
							</text>
						</g>
					</svg>
				)}
			</div>
			<div className="lc-controls">
				<span className="lc-controls-label">Distance:</span>
				<TextButton pressed={metric === 'cosine'} onClick={() => setMetric('cosine')}>
					Cosine
				</TextButton>
				<TextButton pressed={metric === 'euclidean'} onClick={() => setMetric('euclidean')}>
					Euclidean
				</TextButton>
				{mode === 'webgl' && (
					<>
						<TextButton onClick={() => stage.current?.zoom(0.8)}>Zoom in</TextButton>
						<TextButton onClick={() => stage.current?.zoom(1.25)}>Zoom out</TextButton>
					</>
				)}
			</div>
			<p className="lc-quiet lc-hint">
				Move the point "{queryLabel}" with the three sliders below{mode === 'webgl' ? ', or drag it in the view' : ''}. Where labels would overlap only the most relevant one is printed: point at a dot, or select it, to
				read its label.
			</p>
			<div className="lc-sliders is-compact">
				<label className="lc-slider" htmlFor={`${id}-k`}>
					<span className="lc-slider-label">
						Neighbours (k)<strong>{k}</strong>
					</span>
					<input id={`${id}-k`} type="range" min={1} max={Math.max(1, Math.min(10, points.length))} step={1} value={k} onChange={(e) => setK(Number(e.target.value))} />
				</label>
				{(['x', 'y', 'z'] as const).map((axis, i) => (
					<label key={axis} className="lc-slider" htmlFor={`${id}-${axis}`}>
						<span className="lc-slider-label">
							{axes[i]}
							<strong>{formatNumber(query[axis], 2)}</strong>
						</span>
						<input
							id={`${id}-${axis}`}
							type="range"
							min={lower}
							max={limit}
							step={step}
							value={query[axis]}
							onChange={(e) => {
								stage.current?.stopAutoRotate();
								setQuery((q) => ({ ...q, [axis]: Number(e.target.value) }));
							}}
						/>
					</label>
				))}
			</div>
			<p className="lc-detail" aria-live="polite">
				<span className="lc-quiet">{metric === 'cosine' ? 'Most similar by angle (1 = same direction):' : 'Closest by straight-line distance:'}</span>{' '}
				{nearest.map((n, rank) => (
					<span key={n.i} className="lc-rank">
						{rank + 1}. <strong>{points[n.i].label}</strong> {formatNumber(n.value, 2)}
					</span>
				))}
			</p>
		</Frame>
	);
}
