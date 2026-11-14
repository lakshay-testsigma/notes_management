import type * as THREE_NS from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { declutter, type LabelBox } from './declutter';
import { readToken } from './hooks';

type Three = typeof THREE_NS;

export interface StageLabel {
	id: string;
	text: string;
	position: { x: number; y: number; z: number };
	className?: string;
	/** pixels below the projected point */
	offset?: number;
	/** radius of the sphere the label belongs to, in scene units; the label is placed below it */
	radius?: number;
	/** place the label above the point instead of below it */
	above?: boolean;
	/**
	 * Who keeps its place when labels would overlap on screen (see PRIORITY in
	 * ./declutter). Higher wins; equal priorities go to the label that is already
	 * showing, then to the one that comes first in the list. The others fade out.
	 */
	priority?: number;
}

export interface Stage {
	THREE: Three;
	scene: THREE_NS.Scene;
	camera: THREE_NS.PerspectiveCamera;
	canvas: HTMLCanvasElement;
	controls: OrbitControls;
	/** Run on every rendered frame, before drawing. */
	onFrame: (callback: () => void) => void;
	setLabels: (labels: StageLabel[]) => void;
	/** Mesh under a pointer event, out of `targets`. */
	pick: (event: { clientX: number; clientY: number }, targets: THREE_NS.Object3D[]) => THREE_NS.Object3D | null;
	ray: (event: { clientX: number; clientY: number }) => THREE_NS.Ray;
	color: (token: string) => THREE_NS.Color;
	zoom: (factor: number) => void;
	/** Point the camera at `center` from far enough to see a sphere of `radius`. */
	fit: (center: { x: number; y: number; z: number }, radius: number) => void;
	stopAutoRotate: () => void;
	dispose: () => void;
}

export function webglAvailable(): boolean {
	try {
		const canvas = document.createElement('canvas');
		return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
	} catch {
		return false;
	}
}

/**
 * A small three.js scene inside `host`: transparent canvas, orbit controls,
 * HTML labels that follow 3D points, keyboard control, and a render loop that
 * only runs while the canvas is on screen. Returns null when WebGL is missing,
 * so the caller can show its static fallback.
 */
export async function createStage(host: HTMLElement, options: { distance: number; autoRotate: boolean }): Promise<Stage | null> {
	if (!webglAvailable()) return null;
	const THREE = await import('three');
	const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');

	let renderer: THREE_NS.WebGLRenderer;
	try {
		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
	} catch {
		return null;
	}
	renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
	renderer.setClearColor(0x000000, 0);
	const canvas = renderer.domElement;
	canvas.className = 'lc-3d-canvas';
	canvas.tabIndex = 0;
	canvas.setAttribute('role', 'application');
	canvas.setAttribute('aria-label', host.dataset.label ?? '3D view. Drag to rotate, use plus and minus to zoom, arrow keys to turn.');
	host.append(canvas);

	const labelLayer = document.createElement('div');
	labelLayer.className = 'lc-3d-labels';
	host.append(labelLayer);

	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 4000);
	camera.position.set(options.distance * 0.55, options.distance * 0.4, options.distance * 0.75);
	scene.add(new THREE.AmbientLight(0xffffff, 1.9));
	const lamp = new THREE.DirectionalLight(0xffffff, 1.5);
	scene.add(lamp);

	const controls = new OrbitControls(camera, canvas);
	controls.enableDamping = true;
	controls.dampingFactor = 0.09;
	controls.enablePan = false;
	controls.enableZoom = false; // wheel zoom only after the learner clicks into the view
	controls.minDistance = options.distance * 0.25;
	controls.maxDistance = options.distance * 2.4;
	controls.autoRotate = options.autoRotate;
	controls.autoRotateSpeed = 0.7;
	// Vertical swipes keep scrolling the page on touch screens.
	canvas.style.touchAction = 'pan-y';

	const stopAutoRotate = () => {
		controls.autoRotate = false;
	};
	const activate = () => {
		stopAutoRotate();
		controls.enableZoom = true;
	};
	const deactivate = () => {
		controls.enableZoom = false;
	};
	canvas.addEventListener('pointerdown', activate);
	canvas.addEventListener('pointerleave', deactivate);
	canvas.addEventListener('blur', deactivate);

	const zoom = (factor: number) => {
		const offset = camera.position.clone().sub(controls.target);
		const length = Math.min(controls.maxDistance, Math.max(controls.minDistance, offset.length() * factor));
		camera.position.copy(controls.target).add(offset.setLength(length));
	};
	const fit = (center: { x: number; y: number; z: number }, radius: number) => {
		const distance = (radius / Math.sin((camera.fov * Math.PI) / 360)) * 1.08;
		const direction = camera.position.clone().sub(controls.target).normalize();
		controls.target.set(center.x, center.y, center.z);
		camera.position.copy(controls.target).add(direction.multiplyScalar(distance));
		controls.minDistance = distance * 0.3;
		controls.maxDistance = distance * 2.4;
	};
	const onKey = (event: KeyboardEvent) => {
		const turn = { ArrowLeft: [-0.12, 0], ArrowRight: [0.12, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }[event.key];
		if (turn) {
			const offset = camera.position.clone().sub(controls.target);
			const spherical = new THREE.Spherical().setFromVector3(offset);
			spherical.theta += turn[0];
			spherical.phi = Math.min(Math.PI - 0.15, Math.max(0.15, spherical.phi + turn[1]));
			camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));
		} else if (event.key === '+' || event.key === '=') zoom(0.85);
		else if (event.key === '-' || event.key === '_') zoom(1.18);
		else return;
		stopAutoRotate();
		event.preventDefault();
	};
	canvas.addEventListener('keydown', onKey);

	let width = 1;
	let height = 1;
	const resize = () => {
		const box = host.getBoundingClientRect();
		width = Math.max(1, Math.round(box.width));
		height = Math.max(1, Math.round(box.height));
		renderer.setSize(width, height, false);
		camera.aspect = width / height;
		camera.updateProjectionMatrix();
	};
	resize();
	const resizeObserver = new ResizeObserver(resize);
	resizeObserver.observe(host);

	const labelNodes = new Map<string, HTMLElement>();
	/** Measured size of each label, and the text + class it was measured for. */
	const labelSizes = new Map<string, { key: string; width: number; height: number }>();
	/**
	 * Where each label is: 0 = its usual place, 1 = the other side of its dot,
	 * -1 = hidden, because a more important label needs the room.
	 */
	const labelPlace = new Map<string, number>();
	let labels: StageLabel[] = [];
	let declutterDue = true;
	let declutteredAt = 0;
	const setLabels = (next: StageLabel[]) => {
		labels = next;
		const keep = new Set(next.map((l) => l.id));
		for (const [id, el] of labelNodes) {
			if (!keep.has(id)) {
				el.remove();
				labelNodes.delete(id);
				labelSizes.delete(id);
				labelPlace.delete(id);
			}
		}
		for (const label of next) {
			let el = labelNodes.get(label.id);
			if (!el) {
				el = document.createElement('span');
				labelLayer.append(el);
				labelNodes.set(label.id, el);
				// A new label starts hidden and fades in once it is known to have room.
				labelPlace.set(label.id, -1);
			}
			if (el.textContent !== label.text) el.textContent = label.text;
			el.className = `lc-3d-label ${label.className ?? ''}${labelPlace.get(label.id) === -1 ? ' is-crowded' : ''}`;
		}
		declutterDue = true;
	};
	const projected = new THREE.Vector3();
	const world = new THREE.Vector3();
	/** Screen position of each label this frame (x = centre, tops = [usual, other side]); `null` when off screen. */
	let placed: ({ x: number; tops: number[] } | null)[] = [];
	const placeLabels = () => {
		placed = labels.map((label) => {
			const el = labelNodes.get(label.id);
			if (!el) return null;
			projected.set(label.position.x, label.position.y, label.position.z).project(camera);
			const visible = projected.z < 1 && Math.abs(projected.x) < 1.1 && Math.abs(projected.y) < 1.1;
			el.style.display = visible ? '' : 'none';
			if (!visible) return null;
			let x = (projected.x * 0.5 + 0.5) * width;
			// A label near the left or right edge is pulled in, so it is never cut off (phones).
			const half = (labelSizes.get(label.id)?.width ?? 0) / 2;
			if (half > 0 && half * 2 < width - 8) x = Math.min(width - half - 4, Math.max(half + 4, x));
			const anchor = (-projected.y * 0.5 + 0.5) * height;
			let gap = label.offset ?? 10;
			const tops = [anchor + gap];
			if (label.radius) {
				// A label of a sphere sits just under it, or just above it when that is the only free side.
				const depth = camera.position.distanceTo(world.set(label.position.x, label.position.y, label.position.z));
				gap += (label.radius * height) / (2 * Math.tan((camera.fov * Math.PI) / 360) * Math.max(depth, 1));
				const above = anchor - gap - (labelSizes.get(label.id)?.height ?? 15);
				tops[0] = label.above ? above : anchor + gap;
				tops[1] = label.above ? anchor + gap : above;
			}
			const y = tops[Math.max(0, labelPlace.get(label.id) ?? 0)] ?? tops[0];
			el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translateX(-50%)`;
			return { x, tops };
		});
	};
	/**
	 * Labels of points that sit close together on screen would print on top of
	 * each other. A few times a second the label rectangles are compared and, in
	 * every overlapping set, the most important label keeps its place; another
	 * moves to the far side of its dot if that is free, and otherwise fades out
	 * until the view turns or the learner points at its dot.
	 */
	const declutterLabels = () => {
		// Read every size first, then write classes, so the browser lays out once.
		for (const label of labels) {
			const el = labelNodes.get(label.id);
			if (!el || el.style.display === 'none') continue;
			const key = `${label.text}\n${label.className ?? ''}`;
			if (labelSizes.get(label.id)?.key !== key) labelSizes.set(label.id, { key, width: el.offsetWidth, height: el.offsetHeight });
		}
		const boxes = labels.map((label, i): LabelBox | null => {
			const at = placed[i];
			const size = labelSizes.get(label.id);
			if (!at || !size || size.width === 0) return null;
			return {
				width: size.width,
				height: size.height,
				places: at.tops.map((y) => ({ x: at.x - size.width / 2, y })),
				priority: label.priority,
				current: labelPlace.get(label.id),
			};
		});
		const places = declutter(boxes);
		labels.forEach((label, i) => {
			// An off-screen label keeps its state, so it does not blink when it returns.
			if (!boxes[i]) return;
			labelPlace.set(label.id, places[i]);
			labelNodes.get(label.id)?.classList.toggle('is-crowded', places[i] === -1);
		});
	};

	const raycaster = new THREE.Raycaster();
	const pointer = new THREE.Vector2();
	const aim = (event: { clientX: number; clientY: number }) => {
		const box = canvas.getBoundingClientRect();
		pointer.set(((event.clientX - box.left) / box.width) * 2 - 1, -((event.clientY - box.top) / box.height) * 2 + 1);
		raycaster.setFromCamera(pointer, camera);
	};

	const callbacks: (() => void)[] = [];
	let frame = 0;
	let onScreen = true;
	let disposed = false;
	const loop = () => {
		if (disposed) return;
		frame = requestAnimationFrame(loop);
		if (!onScreen || document.hidden) return;
		controls.update();
		lamp.position.copy(camera.position);
		for (const callback of callbacks) callback();
		renderer.render(scene, camera);
		placeLabels();
		const now = performance.now();
		if (declutterDue || now - declutteredAt > 120) {
			declutterDue = false;
			declutteredAt = now;
			declutterLabels();
		}
	};
	// Several changes can arrive in one call (a fast scroll past the view): the last one is the current state.
	const visibility = new IntersectionObserver((entries) => {
		onScreen = entries[entries.length - 1]?.isIntersecting ?? onScreen;
	});
	visibility.observe(host);
	frame = requestAnimationFrame(loop);

	return {
		THREE,
		scene,
		camera,
		canvas,
		controls,
		onFrame: (callback) => callbacks.push(callback),
		setLabels,
		pick: (event, targets) => {
			aim(event);
			return raycaster.intersectObjects(targets, false)[0]?.object ?? null;
		},
		ray: (event) => {
			aim(event);
			return raycaster.ray;
		},
		color: (token) => new THREE.Color(readToken(token) || '#888888'),
		zoom,
		fit,
		stopAutoRotate,
		dispose: () => {
			disposed = true;
			cancelAnimationFrame(frame);
			resizeObserver.disconnect();
			visibility.disconnect();
			canvas.removeEventListener('keydown', onKey);
			controls.dispose();
			scene.traverse((object) => {
				const mesh = object as THREE_NS.Mesh;
				mesh.geometry?.dispose?.();
				const material = mesh.material as THREE_NS.Material | THREE_NS.Material[] | undefined;
				if (Array.isArray(material)) material.forEach((m) => m.dispose());
				else material?.dispose?.();
			});
			renderer.dispose();
			renderer.forceContextLoss();
			canvas.remove();
			labelLayer.remove();
		},
	};
}
