/** A label that wants a free rectangle on the screen (or in an SVG viewBox). */
export interface LabelBox {
	width: number;
	height: number;
	/**
	 * Top-left corners the label may take, best first. Most labels have one
	 * (under their dot); a label of a 3D point has a second one above the dot.
	 */
	places: { x: number; y: number }[];
	/** higher wins; equal priorities go to a label that is already showing, then to the earlier one in the list */
	priority?: number;
	/** index in `places` the label has now, or -1 when it is hidden: keeps a turning view from flickering */
	current?: number;
}

/**
 * Label priorities shared by the 3D components. The pointed-at (or picked)
 * label always wins, then the query point, then the selected node, then the
 * nearest neighbours, then the axis names, then every other label in the
 * order it was given.
 */
export const PRIORITY = { hover: 1000, query: 900, selected: 800, near: 600, axis: 400, plain: 0 } as const;

/**
 * Decide which labels to show when some would print on top of each other.
 * Labels are taken in order of priority; each takes the first of its places
 * that is clear of every label placed before it (grown by `gap` sideways), and
 * is hidden when none is. A label keeps the place it already has when it can.
 * `null` entries (labels that are off screen) are never placed.
 * Returns, per input, the index of the place taken or -1 for "hide".
 */
export function declutter(boxes: (LabelBox | null)[], gap = 3): number[] {
	const order = boxes
		.map((box, index) => ({ box, index }))
		.filter((item): item is { box: LabelBox; index: number } => item.box !== null)
		.sort((a, b) => (b.box.priority ?? 0) - (a.box.priority ?? 0) || Number((b.box.current ?? -1) >= 0) - Number((a.box.current ?? -1) >= 0) || a.index - b.index);
	const result = boxes.map(() => -1);
	const taken: { x: number; y: number; width: number; height: number }[] = [];
	for (const { box, index } of order) {
		const tries = box.places.map((_place, i) => i);
		const current = box.current ?? -1;
		if (current > 0 && current < tries.length) tries.unshift(...tries.splice(current, 1));
		for (const i of tries) {
			const { x, y } = box.places[i];
			const clear = taken.every((other) => x >= other.x + other.width + gap || other.x >= x + box.width + gap || y >= other.y + other.height || other.y >= y + box.height);
			if (!clear) continue;
			result[index] = i;
			taken.push({ x, y, width: box.width, height: box.height });
			break;
		}
	}
	return result;
}

/**
 * Rectangle of a centred text in the flat SVG fallbacks, where the text cannot
 * be measured (it is rendered on the server too). `baseline` is the y of the text.
 */
export function textBox(text: string, centerX: number, baseline: number, fontSize = 13): Pick<LabelBox, 'width' | 'height' | 'places'> {
	const width = text.length * fontSize * 0.56;
	return { width, height: fontSize * 1.3, places: [{ x: centerX - width / 2, y: baseline - fontSize }] };
}
