import { useMemo, useState } from 'react';
import { compile, type Compiled, type Scope } from '../../../lib/expr';
import Chart from './Chart';
import { formatNumber } from './hooks';
import { Frame } from './ui';

interface Param {
	name: string;
	label?: string;
	type?: 'slider' | 'toggle';
	min?: number;
	max?: number;
	step?: number;
	value?: number | boolean;
	unit?: string;
}

interface Output {
	label: string;
	expr: string;
	digits?: number;
	unit?: string;
}

interface PlotSpec {
	x: { name?: string; label?: string; min: number; max: number; steps?: number };
	series: { label: string; expr: string }[];
	yLabel?: string;
	yMin?: number;
	yMax?: number;
}

export interface ParamPlaygroundProps {
	title?: string;
	params: Param[];
	chart?: PlotSpec;
	outputs?: Output[];
}

function safeCompile(expr: string): { run: Compiled | null; error: string | null } {
	try {
		return { run: compile(expr), error: null };
	} catch (error) {
		return { run: null, error: `Could not read "${expr}": ${(error as Error).message}.` };
	}
}

const run = (fn: Compiled | null, scope: Scope) => {
	if (!fn) return Number.NaN;
	try {
		return fn(scope);
	} catch {
		return Number.NaN;
	}
};

export default function ParamPlayground({ title, params, chart, outputs = [] }: ParamPlaygroundProps) {
	const initial = () => Object.fromEntries(params.map((p) => [p.name, p.type === 'toggle' ? (p.value ? 1 : 0) : Number(p.value ?? p.min ?? 0)]));
	const [values, setValues] = useState<Scope>(initial);

	const compiled = useMemo(
		() => ({
			series: (chart?.series ?? []).map((s) => ({ ...s, ...safeCompile(s.expr) })),
			outputs: outputs.map((o) => ({ ...o, ...safeCompile(o.expr) })),
		}),
		[chart, outputs],
	);
	const errors = [...compiled.series, ...compiled.outputs].map((c) => c.error).filter(Boolean);

	const xName = chart?.x.name ?? 'x';
	const xs = useMemo(() => {
		if (!chart) return [];
		const steps = Math.min(400, Math.max(2, chart.x.steps ?? 80));
		return Array.from({ length: steps + 1 }, (_, i) => chart.x.min + ((chart.x.max - chart.x.min) * i) / steps);
	}, [chart]);

	const rows = useMemo(
		() =>
			xs.map((xv) => {
				const scope = { ...values, [xName]: xv };
				const row: Record<string, number | null> = { [xName]: Number(xv.toPrecision(6)) };
				compiled.series.forEach((s, i) => {
					const v = run(s.run, scope);
					row[`s${i}`] = Number.isFinite(v) ? v : null;
				});
				return row;
			}),
		[xs, values, compiled, xName],
	);

	// A fixed y axis, taken from the corners of the parameter space, so the curve
	// moves when a slider moves instead of the axis rescaling under it.
	const range = useMemo(() => {
		if (!chart || (chart.yMin !== undefined && chart.yMax !== undefined)) return { min: chart?.yMin, max: chart?.yMax };
		const sliders = params.filter((p) => p.type !== 'toggle').slice(0, 5);
		let lo = Infinity;
		let hi = -Infinity;
		for (let mask = 0; mask < 1 << sliders.length; mask++) {
			const scope: Scope = { ...initial() };
			sliders.forEach((p, i) => (scope[p.name] = mask & (1 << i) ? (p.max ?? 1) : (p.min ?? 0)));
			for (const toggles of [0, 1]) {
				params.filter((p) => p.type === 'toggle').forEach((p) => (scope[p.name] = toggles));
				for (let i = 0; i < xs.length; i += 4) {
					for (const s of compiled.series) {
						const v = run(s.run, { ...scope, [xName]: xs[i] });
						if (Number.isFinite(v)) {
							lo = Math.min(lo, v);
							hi = Math.max(hi, v);
						}
					}
				}
			}
		}
		if (!Number.isFinite(lo) || !Number.isFinite(hi)) return { min: chart.yMin, max: chart.yMax };
		return { min: chart.yMin ?? lo, max: chart.yMax ?? hi };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [chart, params, compiled, xs, xName]);

	const labels = Object.fromEntries(compiled.series.map((s, i) => [`s${i}`, s.label]));

	return (
		<Frame name="params" title={title}>
			<div className="lc-sliders">
				{params.map((p) => {
					const id = `pp-${title ?? ''}-${p.name}`.replace(/\W+/g, '-');
					if (p.type === 'toggle') {
						return (
							<label key={p.name} className="lc-toggle" htmlFor={id}>
								<input
									id={id}
									type="checkbox"
									checked={values[p.name] === 1}
									onChange={(e) => setValues((v) => ({ ...v, [p.name]: e.target.checked ? 1 : 0 }))}
								/>
								<span>{p.label ?? p.name}</span>
							</label>
						);
					}
					return (
						<label key={p.name} className="lc-slider" htmlFor={id}>
							<span className="lc-slider-label">
								{p.label ?? p.name}
								<strong>
									{formatNumber(values[p.name])}
									{p.unit ? ` ${p.unit}` : ''}
								</strong>
							</span>
							<input
								id={id}
								type="range"
								min={p.min ?? 0}
								max={p.max ?? 1}
								step={p.step ?? ((p.max ?? 1) - (p.min ?? 0)) / 100}
								value={values[p.name]}
								onChange={(e) => setValues((v) => ({ ...v, [p.name]: Number(e.target.value) }))}
							/>
						</label>
					);
				})}
			</div>
			{compiled.outputs.length > 0 && (
				<p className="lc-outputs" aria-live="polite">
					{compiled.outputs.map((o, i) => (
						<span key={i}>
							<span className="lc-quiet">{o.label}</span>{' '}
							<strong>
								{formatNumber(run(o.run, values), o.digits ?? 3)}
								{o.unit ? ` ${o.unit}` : ''}
							</strong>
						</span>
					))}
				</p>
			)}
			{chart && (
				<Chart
					type="line"
					data={rows}
					x={xName}
					y={compiled.series.map((_, i) => `s${i}`)}
					labels={labels}
					xLabel={chart.x.label ?? xName}
					yLabel={chart.yLabel}
					yMin={range.min}
					yMax={range.max}
				/>
			)}
			{errors.map((error, i) => (
				<p key={i} className="lc-error">
					{error}
				</p>
			))}
		</Frame>
	);
}
