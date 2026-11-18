import { useEffect, useId, useRef, useState } from 'react';
import { useElementWidth, useReducedMotion } from './hooks';
import { Frame, TextButton } from './ui';
import { sceneSnapshot, type ProgressiveSceneProps } from './progressive-scene';

/** Isometric SVG: depth cues without making the learner operate a camera. */
export default function ProgressiveScene(props: ProgressiveSceneProps) {
	const [index, setIndex] = useState(0);
	const [selected, setSelected] = useState<string | null>(null);
	const [paused, setPaused] = useState(false);
	const [replay, setReplay] = useState(0);
	const [transcript, setTranscript] = useState(false);
	const [host, measured] = useElementWidth<HTMLDivElement>();
	const reduced = useReducedMotion();
	const svg = useRef<SVGSVGElement>(null);
	const uid = useId().replace(/:/g, '');
	const width = measured ?? 680, height = width < 480 ? 330 : 380;
	const snapshot = sceneSnapshot(props, index), step = snapshot.step;
	const positions = props.nodes.map(n => ({ id: n.id, x: n.position[0] - n.position[1], y: (n.position[0] + n.position[1]) * 0.52 }));
	const xs = positions.map(p => p.x), ys = positions.map(p => p.y);
	const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
	// Fit the complete scene once. Adding a node never moves the existing ones.
	const scale = Math.min((width - 126) / Math.max(1, maxX - minX), (height - 150) / Math.max(1, maxY - minY), 105);
	const point = (id: string) => {
		const p = positions.find(n => n.id === id)!;
		return { x: width / 2 + (p.x - (minX + maxX) / 2) * scale, y: height / 2 + (p.y - (minY + maxY) / 2) * scale };
	};
	const node = snapshot.nodes.find(n => n.id === selected);
	const go = (at: number) => { setIndex(at); setSelected(null); setReplay(0); };
	useEffect(() => {
		const visibility = () => { if (document.hidden) setPaused(true); };
		document.addEventListener('visibilitychange', visibility);
		return () => document.removeEventListener('visibilitychange', visibility);
	}, []);
	useEffect(() => {
		const el = host.current;
		if (!el) return;
		const update = (visible: boolean) => {
			if (paused || reduced || !visible || document.hidden) svg.current?.pauseAnimations();
			else svg.current?.unpauseAnimations();
		};
		update(true);
		const observer = new IntersectionObserver(entries => update(entries[entries.length-1].isIntersecting));
		observer.observe(el);
		return () => observer.disconnect();
	}, [paused, reduced, index, replay]);
	return <Frame name="progressive-scene" title={props.title}>
		<p className="lc-quiet">{props.intro}</p>
		{step.metrics && <dl className="lc-scene-metrics">{step.metrics.map(m => <div key={m.label}><dt>{m.label}</dt><dd>{m.value}</dd></div>)}</dl>}
		<div ref={host} className={`lc-scene-stage${paused || reduced ? ' is-still' : ''}`}>
			<svg ref={svg} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={`${props.title}: ${step.title}. Select a block to inspect it.`}>
				<defs><marker id={`${uid}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent)" /></marker></defs>
				<g className="lc-scene-grid" aria-hidden="true">{[-2,-1,0,1,2].map(i => <g key={i}><path d={`M ${width/2-190} ${height/2+i*24-95} l 380 190`} /><path d={`M ${width/2+190} ${height/2+i*24-95} l -380 190`} /></g>)}</g>
				{snapshot.edges.map(edge => {
					const a = point(edge.from), b = point(edge.to);
					const dx = b.x-a.x, dy = b.y-a.y, length = Math.hypot(dx,dy) || 1;
					const start = { x:a.x+dx/length*43, y:a.y+dy/length*30 };
					const end = { x:b.x-dx/length*46, y:b.y-dy/length*32 };
					const path = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
					return <g key={`${edge.id}-${index}-${replay}`} className="lc-scene-edge" data-edge={edge.id}>
						<title>{edge.label}: {props.nodes.find(n=>n.id===edge.from)?.label} to {props.nodes.find(n=>n.id===edge.to)?.label}</title>
						<path d={path} markerEnd={`url(#${uid}-arrow)`} />
						<circle r="4" className="lc-scene-packet" cx={reduced ? end.x : 0} cy={reduced ? end.y : 0} aria-hidden="true">
							{!reduced && <animateMotion dur="1.8s" repeatCount="indefinite" path={path} />}
						</circle>
					</g>;
				})}
				{[...snapshot.nodes].sort((a,b)=>point(a.id).y-point(b.id).y).map(n => {
					const p = point(n.id), failed = step.failed?.includes(n.id), focused = step.focus?.includes(n.id);
					const words = n.label.split(' '), split = Math.ceil(words.length/2);
					const lines = width < 480 && n.label.length > 13 ? [words.slice(0,split).join(' '), words.slice(split).join(' ')] : [n.label];
					return <g key={n.id} transform={`translate(${p.x}, ${p.y})`}>
						<g key={`${n.id}-${replay}`} className={`lc-scene-node${focused ? ' is-focused' : ''}${failed ? ' is-failed' : ''}`} data-node={n.id} role="button" tabIndex={0} aria-label={`Inspect ${n.label}${failed ? ' (unavailable)' : ''}`} aria-pressed={selected === n.id}
							onClick={()=>setSelected(n.id)} onKeyDown={e=>{ if(e.key==='Enter'||e.key===' ') {e.preventDefault();setSelected(n.id);} }}>
							<title>{n.detail}</title>
							<g className="lc-scene-body">
								<path className="lc-scene-left" d="M -39 -10 L 0 11 L 0 36 L -39 15 Z" />
								<path className="lc-scene-right" d="M 0 11 L 39 -10 L 39 15 L 0 36 Z" />
								<path className="lc-scene-top" d="M 0 -31 L 39 -10 L 0 11 L -39 -10 Z" />
								{n.kind === 'store' ? <g className="lc-scene-symbol"><path d="M -13 -17 v 14 c 0 8 26 8 26 0 v -14"/><ellipse cx="0" cy="-17" rx="13" ry="5"/><path d="M -13 -10 c 0 8 26 8 26 0"/></g>
								: n.kind === 'queue' ? <g className="lc-scene-symbol">{[-12,0,12].map(x=><rect key={x} x={x-4} y="-17" width="8" height="13" rx="1"/>)}</g>
								: n.kind === 'client' ? <g className="lc-scene-symbol"><rect x="-16" y="-23" width="32" height="20" rx="2"/><path d="M -20 1 h 40 M 0 -3 v 4"/></g>
								: <g className="lc-scene-symbol"><path d="M -14 -18 h 28 M -14 -12 h 28 M -14 -6 h 28"/></g>}
							</g>
							<text className="lc-scene-label" textAnchor="middle" y="58">{lines.filter(Boolean).map((line,i)=><tspan key={i} x="0" dy={i ? 17 : 0}>{line}</tspan>)}</text>
							{failed && <text textAnchor="middle" className="lc-scene-failure" y="-41">Unavailable</text>}
						</g>
					</g>;
				})}
			</svg>
		</div>
		<nav className="lc-controls lc-scene-steps" aria-label={`${props.title} steps`}>{props.steps.map((s,i)=><TextButton key={i} pressed={i===index} onClick={()=>go(i)} label={`Step ${i+1}: ${s.title}`}>{i+1}</TextButton>)}</nav>
		<div className="lc-controls">
			<TextButton disabled={index===0} onClick={()=>go(index-1)}>Back</TextButton>
			<TextButton disabled={index===props.steps.length-1} onClick={()=>go(index+1)}>Next</TextButton>
			<TextButton onClick={()=>{setReplay(r=>r+1);setPaused(false);}}>Replay step</TextButton>
			<TextButton disabled={reduced} pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused ? 'Resume traffic' : 'Pause traffic'}</TextButton>
			<TextButton onClick={()=>{go(0);setPaused(false);setTranscript(false);}}>Reset</TextButton>
		</div>
		<div aria-live="polite" aria-atomic="true" className="lc-scene-explanation">
			<p className="lc-caption"><span className="lc-count">{index+1} / {props.steps.length}</span><strong>{step.title}</strong></p>
			<p>{step.description}</p>
			<p className="lc-quiet">What changed</p><ul>{step.changes.map((change,i)=><li key={i}>{change}</li>)}</ul>
			{step.edges.length > 0 && <p className="lc-quiet">Active paths: {snapshot.edges.map(e=>e.label).join('; ')}.</p>}
			{node && <p className="lc-scene-inspector"><strong>{node.label}.</strong> {node.detail}</p>}
		</div>
		<TextButton pressed={transcript} onClick={()=>setTranscript(v=>!v)}>{transcript ? 'Hide sequence' : 'Read full sequence'}</TextButton>
		{transcript && <ol className="lc-scene-transcript">{props.steps.map((s,i)=><li key={i}><strong>{s.title}.</strong> {s.description} {s.changes.join(' ')}</li>)}</ol>}
	</Frame>;
}
