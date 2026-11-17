import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { buildSrcdoc, compareOutput } from './activity-logic';
import { Frame, TextButton } from './ui';

export interface CodePlaygroundProps {
	title?: string;
	code: string;
	lang?: 'javascript';
	expected?: string;
	hint?: string;
	timeout?: number;
}

interface Line {
	kind: 'out' | 'err' | 'info';
	text: string;
}

/** Trim blank edges and the indentation shared by every line (MDX template literals). */
export function dedent(source: string): string {
	const lines = String(source ?? '').replace(/\t/g, '  ').replace(/^\s*\n/, '').replace(/\s+$/, '').split('\n');
	const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length), 99);
	return lines.map((l) => l.slice(indent)).join('\n');
}

export default function CodePlayground({ title, code, lang = 'javascript', expected, hint, timeout = 2000 }: CodePlaygroundProps) {
	const initial = dedent(code);
	const runnable = lang === 'javascript';
	const limit = Math.min(Math.max(Number(timeout) || 2000, 200), 5000);
	const [source, setSource] = useState(initial);
	const [output, setOutput] = useState<Line[]>([]);
	const [running, setRunning] = useState(false);
	const [verdict, setVerdict] = useState<string | null>(null);
	const [showHint, setShowHint] = useState(false);
	const [escaped, setEscaped] = useState(false);
	const host = useRef<HTMLDivElement | null>(null);
	const frame = useRef<HTMLIFrameElement | null>(null);
	const run = useRef<{ id: string; timer: number; lines: Line[] } | null>(null);
	const hintId = useId();

	const stop = () => {
		if (run.current) window.clearTimeout(run.current.timer);
		run.current = null;
		frame.current?.remove();
		frame.current = null;
		setRunning(false);
	};

	const finish = (lines: Line[]) => {
		stop();
		if (expected === undefined) return;
		const printed = lines.filter((l) => l.kind === 'out').map((l) => l.text).join('\n');
		const diff = compareOutput(printed, expected);
		setVerdict(diff ? `Not yet. Line ${diff.line}: got "${diff.got}", expected "${diff.want}".` : 'Matches the expected output.');
	};

	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			const job = run.current;
			if (!job || !frame.current || event.source !== frame.current.contentWindow) return;
			const data = event.data as { source?: string; runId?: string; type?: string; text?: string };
			if (!data || data.source !== 'tutor-playground' || data.runId !== job.id) return;
			if (data.type === 'done') {
				finish(job.lines);
				return;
			}
			if (job.lines.length >= 200) return;
			const line: Line = { kind: data.type === 'err' ? 'err' : 'out', text: String(data.text ?? '') };
			job.lines = [...job.lines, line];
			setOutput(job.lines);
		};
		window.addEventListener('message', onMessage);
		return () => {
			window.removeEventListener('message', onMessage);
			stop();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const start = () => {
		if (!runnable || !host.current) return;
		stop();
		setOutput([]);
		setVerdict(null);
		const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
		const iframe = document.createElement('iframe');
		iframe.setAttribute('sandbox', 'allow-scripts');
		iframe.setAttribute('title', 'Code sandbox');
		iframe.setAttribute('aria-hidden', 'true');
		iframe.tabIndex = -1;
		iframe.className = 'lc-play-sandbox';
		iframe.srcdoc = buildSrcdoc(source, id);
		const timer = window.setTimeout(() => {
			const lines = [...(run.current?.lines ?? []), { kind: 'err' as const, text: `Stopped after ${limit} ms (infinite loop?).` }];
			setOutput(lines);
			finish(lines);
		}, limit);
		run.current = { id, timer, lines: [] };
		frame.current = iframe;
		setRunning(true);
		host.current.append(iframe);
	};

	const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
		if (event.key === 'Escape') {
			setEscaped(true);
			return;
		}
		if (event.key === 'Tab' && !escaped && !event.shiftKey) {
			event.preventDefault();
			const area = event.currentTarget;
			const { selectionStart, selectionEnd, value } = area;
			const next = `${value.slice(0, selectionStart)}  ${value.slice(selectionEnd)}`;
			setSource(next);
			requestAnimationFrame(() => area.setSelectionRange(selectionStart + 2, selectionStart + 2));
			return;
		}
		if (event.key !== 'Tab') setEscaped(false);
	};

	const rows = Math.min(Math.max(source.split('\n').length + 1, 4), 24);

	return (
		<Frame name="playground" title={title}>
			<p id={hintId} className="sr-only">
				Code editor. Tab inserts two spaces. Press Escape, then Tab, to leave the editor.
			</p>
			<textarea
				className="lc-play-editor"
				value={source}
				rows={rows}
				spellCheck={false}
				autoCapitalize="off"
				autoCorrect="off"
				aria-label={title ? `Code: ${title}` : 'Code'}
				aria-describedby={hintId}
				onChange={(event) => {
					setSource(event.target.value);
					setVerdict(null);
				}}
				onKeyDown={onKeyDown}
				onBlur={() => setEscaped(false)}
			/>
			{!runnable && <p className="lc-quiet">This code is shown for reading; only JavaScript runs in the browser.</p>}
			<div className="lc-controls">
				{runnable && (
					<TextButton onClick={start} disabled={running}>
						{running ? 'Running…' : 'Run'}
					</TextButton>
				)}
				{running && <TextButton onClick={() => finish([...(run.current?.lines ?? []), { kind: 'info', text: 'Stopped.' }])}>Stop</TextButton>}
				<TextButton
					onClick={() => {
						stop();
						setSource(initial);
						setOutput([]);
						setVerdict(null);
					}}
					disabled={source === initial && output.length === 0}
				>
					Reset code
				</TextButton>
				{hint && (
					<TextButton onClick={() => setShowHint(true)} disabled={showHint}>
						Show hint
					</TextButton>
				)}
			</div>
			{showHint && hint && <p className="lc-caption">{hint}</p>}
			{runnable && (
				<div className="lc-play-output" role="log" aria-live="polite" aria-label="Output">
					{output.length === 0 ? (
						<span className="lc-quiet">{running ? 'Running…' : 'Output appears here after Run.'}</span>
					) : (
						output.map((line, i) => (
							<div key={i} className={`lc-play-line is-${line.kind}`}>
								{line.kind === 'err' ? 'Error: ' : ''}
								{line.text}
							</div>
						))
					)}
				</div>
			)}
			<div aria-live="polite">
				{verdict && (
					<p className="lc-feedback">
						<strong className={verdict.startsWith('Matches') ? 'lc-good' : 'lc-bad'}>{verdict}</strong>
					</p>
				)}
			</div>
			<div ref={host} className="lc-play-host" />
		</Frame>
	);
}
