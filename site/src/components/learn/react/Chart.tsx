import { useMemo, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { formatNumber, px, seriesColor, useElementWidth } from './hooks';
import { Frame } from './ui';

type Row = Record<string, number | string | null | undefined>;

export interface ChartProps {
	title?: string;
	type?: 'line' | 'bar' | 'scatter';
	data: Row[];
	/** key of the x value in each row */
	x: string;
	/** key (or keys) of the y values; each key is one series */
	y: string | string[];
	/** series key -> name shown in the legend */
	labels?: Record<string, string>;
	xLabel?: string;
	yLabel?: string;
	yMin?: number;
	yMax?: number;
	height?: number;
	/** scatter only: key of a text label for each point */
	labelKey?: string;
}

export function niceTicks(min: number, max: number, target = 5): number[] {
	if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
	if (min === max) {
		min -= 1;
		max += 1;
	}
	const rough = (max - min) / Math.max(1, target);
	const power = Math.pow(10, Math.floor(Math.log10(rough)));
	const unit = rough / power;
	const step = (unit >= 7.5 ? 10 : unit >= 3.5 ? 5 : unit >= 1.5 ? 2 : 1) * power;
	const ticks: number[] = [];
	for (let v = Math.floor(min / step) * step; v <= max + step * 0.999; v += step) ticks.push(Number(v.toPrecision(12)));
	return ticks;
}

const M = { left: 44, right: 12, top: 12, bottom: 30 };

export default function Chart(props: ChartProps) {
	const { type = 'line', data, x, labels = {}, xLabel, yLabel, labelKey } = props;
	const keys = useMemo(() => (Array.isArray(props.y) ? props.y : [props.y]), [props.y]);
	const [ref, measured] = useElementWidth<HTMLDivElement>();
	const [hover, setHover] = useState<number | null>(null);

	const width = measured && measured > 0 ? measured : 704;
	const height = props.height ?? (width < 480 ? 240 : 300);
	const bottom = M.bottom + (xLabel ? 18 : 0);
	const plotW = Math.max(40, width - M.left - M.right);
	const top = M.top + (yLabel ? 16 : 0);
	const plotH = Math.max(40, height - top - bottom);

	const model = useMemo(() => {
		const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
		const ys = data.flatMap((row) => keys.map((k) => num(row[k]))).filter((v): v is number => v !== null);
		const dataMin = ys.length ? Math.min(...ys) : 0;
		const dataMax = ys.length ? Math.max(...ys) : 1;
		let lo = dataMin;
		if (type === 'bar' || (dataMin >= 0 && dataMin <= 0.4 * dataMax)) lo = Math.min(0, dataMin);
		const yTicks = niceTicks(props.yMin ?? lo, props.yMax ?? dataMax, height < 260 ? 4 : 5);
		const y0 = props.yMin ?? yTicks[0];
		const y1 = props.yMax ?? yTicks[yTicks.length - 1];
		const numericX = type !== 'bar' && data.length > 0 && data.every((row) => num(row[x]) !== null);
		let xTicks: number[] = [];
		let x0 = 0;
		let x1 = 1;
		if (numericX) {
			const xs = data.map((row) => row[x] as number);
			x0 = Math.min(...xs);
			x1 = Math.max(...xs);
			if (type === 'scatter') {
				xTicks = niceTicks(x0, x1, Math.max(2, Math.floor(plotW / 90)));
				x0 = xTicks[0];
				x1 = xTicks[xTicks.length - 1];
			} else {
				xTicks = niceTicks(x0, x1, Math.max(2, Math.floor(plotW / 90))).filter((v) => v >= x0 && v <= x1);
			}
			if (x0 === x1) x1 = x0 + 1;
		}
		return { yTicks: yTicks.filter((v) => v >= y0 && v <= y1), y0, y1, numericX, xTicks, x0, x1 };
	}, [data, keys, x, type, props.yMin, props.yMax, height, plotW]);

	const band = plotW / Math.max(1, data.length);
	const xPos = (i: number) => {
		if (model.numericX) return px(M.left + (((data[i][x] as number) - model.x0) / (model.x1 - model.x0)) * plotW);
		if (type === 'bar') return px(M.left + band * (i + 0.5));
		return px(M.left + (data.length > 1 ? (i / (data.length - 1)) * plotW : plotW / 2));
	};
	const xValue = (v: number) => px(M.left + ((v - model.x0) / (model.x1 - model.x0)) * plotW);
	const yPos = (v: number) => px(top + plotH - ((v - model.y0) / (model.y1 - model.y0 || 1)) * plotH);
	const value = (i: number, key: string) => {
		const v = data[i]?.[key];
		return typeof v === 'number' && Number.isFinite(v) ? v : null;
	};

	// Scatter: every point is its own hover target. Otherwise hover picks a row.
	const points = useMemo(
		() => (type === 'scatter' ? data.flatMap((_, i) => keys.map((key, s) => ({ i, key, s }))).filter((p) => value(p.i, p.key) !== null) : []),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[type, data, keys],
	);
	const count = type === 'scatter' ? points.length : data.length;

	const onMove = (event: PointerEvent<SVGSVGElement>) => {
		const box = event.currentTarget.getBoundingClientRect();
		const px = ((event.clientX - box.left) / box.width) * width;
		const py = ((event.clientY - box.top) / box.height) * height;
		let best: number | null = null;
		let bestDistance = Infinity;
		for (let i = 0; i < count; i++) {
			const d =
				type === 'scatter'
					? Math.hypot(xPos(points[i].i) - px, yPos(value(points[i].i, points[i].key)!) - py)
					: Math.abs(xPos(i) - px);
			if (d < bestDistance) {
				bestDistance = d;
				best = i;
			}
		}
		setHover(type === 'scatter' && bestDistance > 36 ? null : best);
	};
	const onKey = (event: KeyboardEvent) => {
		const delta = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
		if (!delta || count === 0) return;
		event.preventDefault();
		setHover((h) => (h === null ? (delta > 0 ? 0 : count - 1) : Math.min(count - 1, Math.max(0, h + delta))));
	};

	const name = (key: string) => labels[key] ?? key;
	const labelEvery = Math.max(1, Math.ceil(data.length / Math.max(1, Math.floor(plotW / 64))));
	const barWidth = Math.min(24, Math.max(3, (band * 0.72 - (keys.length - 1) * 2) / keys.length));
	const groupWidth = keys.length * barWidth + (keys.length - 1) * 2;
	const baseline = yPos(Math.max(model.y0, Math.min(0, model.y1)));
	const hoverRow = hover === null ? null : type === 'scatter' ? points[hover]?.i : hover;

	return (
		<Frame name="chart" title={props.title}>
			{keys.length > 1 && (
				<div className="lc-legend">
					{keys.map((key, s) => (
						<span key={key}>
							<i className={type === 'line' ? 'lc-key is-line' : 'lc-key'} style={{ background: seriesColor(s) }} />
							{name(key)}
						</span>
					))}
				</div>
			)}
			<div ref={ref} className="lc-graph">
				<svg
					viewBox={`0 0 ${width} ${height}`}
					width={width}
					height={height}
					role="img"
					aria-label={`${props.title ?? 'Chart'}. Use the left and right arrow keys to read values.`}
					tabIndex={0}
					onPointerMove={onMove}
					onPointerLeave={() => setHover(null)}
					onKeyDown={onKey}
					onBlur={() => setHover(null)}
				>
					{yLabel && (
						<text className="lc-axis-title" x={0} y={10}>
							{yLabel}
						</text>
					)}
					{model.yTicks.map((tick) => (
						<g key={tick} className="lc-grid">
							<line x1={M.left} x2={width - M.right} y1={yPos(tick)} y2={yPos(tick)} />
							<text x={M.left - 8} y={yPos(tick) + 4} textAnchor="end">
								{formatNumber(tick)}
							</text>
						</g>
					))}
					<line className="lc-axis" x1={M.left} x2={width - M.right} y1={baseline} y2={baseline} />
					{model.numericX
						? model.xTicks.map((tick) => (
								<text key={tick} className="lc-tick" x={xValue(tick)} y={top + plotH + 18} textAnchor="middle">
									{formatNumber(tick)}
								</text>
							))
						: data.map((row, i) =>
								i % labelEvery === 0 ? (
									<text key={i} className="lc-tick" x={xPos(i)} y={top + plotH + 18} textAnchor="middle">
										{String(row[x] ?? '')}
									</text>
								) : null,
							)}
					{xLabel && (
						<text className="lc-axis-title" x={M.left + plotW / 2} y={height - 4} textAnchor="middle">
							{xLabel}
						</text>
					)}

					{type === 'line' && hover !== null && (
						<line className="lc-crosshair" x1={xPos(hover)} x2={xPos(hover)} y1={top} y2={top + plotH} />
					)}

					{type === 'line' &&
						keys.map((key, s) => {
							const path = data
								.map((_, i) => (value(i, key) === null ? null : `${xPos(i)},${yPos(value(i, key)!)}`))
								.reduce<string>((d, point, i, all) => (point ? `${d}${d && all[i - 1] ? 'L' : 'M'}${point}` : d), '');
							return (
								<g key={key}>
									<path className="lc-line" d={path} style={{ stroke: seriesColor(s) }} />
									{data.map((_, i) =>
										value(i, key) !== null && (data.length <= 24 || i === hover) ? (
											<circle
												key={i}
												className="lc-dot"
												cx={xPos(i)}
												cy={yPos(value(i, key)!)}
												r={i === hover ? 5 : 3.5}
												style={{ fill: seriesColor(s) }}
											/>
										) : null,
									)}
								</g>
							);
						})}

					{type === 'bar' &&
						data.map((_, i) =>
							keys.map((key, s) => {
								const v = value(i, key);
								if (v === null) return null;
								const left = px(xPos(i) - groupWidth / 2 + s * (barWidth + 2));
								const top = yPos(v);
								const up = top <= baseline;
								const r = Math.min(4, barWidth / 2, Math.abs(baseline - top));
								const d = up
									? `M${left},${baseline} V${top + r} Q${left},${top} ${left + r},${top} H${left + barWidth - r} Q${left + barWidth},${top} ${left + barWidth},${top + r} V${baseline} Z`
									: `M${left},${baseline} V${top - r} Q${left},${top} ${left + r},${top} H${left + barWidth - r} Q${left + barWidth},${top} ${left + barWidth},${top - r} V${baseline} Z`;
								return <path key={`${i}-${key}`} className={`lc-bar ${hover === i ? 'is-hover' : ''}`} d={d} style={{ fill: seriesColor(s) }} />;
							}),
						)}

					{type === 'scatter' &&
						points.map((point, p) => (
							<circle
								key={p}
								className="lc-dot"
								cx={xPos(point.i)}
								cy={yPos(value(point.i, point.key)!)}
								r={p === hover ? 6.5 : 4.5}
								style={{ fill: seriesColor(point.s) }}
							/>
						))}
				</svg>
			</div>
			<p className="lc-readout">
				{hoverRow === null || hoverRow === undefined ? (
					<span className="lc-quiet">Point at the chart, or focus it and use the arrow keys, to read exact values.</span>
				) : (
					<>
						{labelKey && data[hoverRow][labelKey] !== undefined && <strong>{String(data[hoverRow][labelKey])} </strong>}
						<span className="lc-quiet">{xLabel ?? x}</span>{' '}
						{typeof data[hoverRow][x] === 'number' ? formatNumber(data[hoverRow][x] as number) : String(data[hoverRow][x] ?? '')}
						{(type === 'scatter' && hover !== null ? [points[hover].key] : keys).map((key) => {
							const s = keys.indexOf(key);
							const v = value(hoverRow, key);
							return (
								<span key={key} className="lc-readout-item">
									<i className={type === 'line' ? 'lc-key is-line' : 'lc-key'} style={{ background: seriesColor(s) }} />
									<span className="lc-quiet">{keys.length > 1 || !yLabel ? name(key) : yLabel}</span> <strong>{v === null ? '–' : formatNumber(v)}</strong>
								</span>
							);
						})}
					</>
				)}
			</p>
			<table className="sr-only">
				<caption>{props.title ?? 'Chart data'}</caption>
				<thead>
					<tr>
						<th>{xLabel ?? x}</th>
						{keys.map((key) => (
							<th key={key}>{name(key)}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.slice(0, 60).map((row, i) => (
						<tr key={i}>
							<td>{String(row[x] ?? '')}</td>
							{keys.map((key) => (
								<td key={key}>{value(i, key) === null ? '' : formatNumber(value(i, key)!)}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</Frame>
	);
}
