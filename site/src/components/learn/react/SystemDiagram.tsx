import { useState } from 'react';
import { GraphCanvas, type Direction, type GEdge, type GNode } from './graph';
import { Frame } from './ui';

export interface SystemDiagramProps {
	title?: string;
	nodes: GNode[];
	edges: GEdge[];
	direction?: Direction;
	/** id of the node that starts selected */
	initial?: string;
}

export default function SystemDiagram({ title, nodes, edges, direction, initial }: SystemDiagramProps) {
	const [selected, setSelected] = useState<string | null>(initial ?? null);
	const node = nodes.find((n) => n.id === selected) ?? null;
	const labelOf = (id: string) => nodes.find((n) => n.id === id)?.label ?? id;

	const nodeClass: Record<string, string> = {};
	const edgeClass: Record<number, string> = {};
	if (node) {
		const near = new Set([node.id]);
		edges.forEach((edge, i) => {
			if (edge.from === node.id || edge.to === node.id) {
				edgeClass[i] = 'is-active';
				near.add(edge.from).add(edge.to);
			} else edgeClass[i] = 'is-dim';
		});
		for (const n of nodes) nodeClass[n.id] = n.id === node.id ? 'is-selected' : near.has(n.id) ? '' : 'is-dim';
	}

	const sendsTo = node ? [...new Set(edges.filter((e) => e.from === node.id && e.to !== node.id).map((e) => labelOf(e.to)))] : [];
	const receives = node ? [...new Set(edges.filter((e) => e.to === node.id && e.from !== node.id).map((e) => labelOf(e.from)))] : [];

	return (
		<Frame name="system" title={title}>
			<GraphCanvas
				nodes={nodes}
				edges={edges}
				direction={direction}
				ariaLabel={title ?? 'System diagram'}
				nodeClass={nodeClass}
				edgeClass={edgeClass}
				onNodeClick={(id) => setSelected((current) => (current === id ? null : id))}
				pressed={selected}
			/>
			<div className="lc-detail" aria-live="polite">
				{node ? (
					<>
						<p>
							<strong>{node.label}.</strong> {node.detail}
						</p>
						{(sendsTo.length > 0 || receives.length > 0) && (
							<p className="lc-quiet">
								{sendsTo.length > 0 && <>Sends to {sendsTo.join(', ')}. </>}
								{receives.length > 0 && <>Receives from {receives.join(', ')}.</>}
							</p>
						)}
					</>
				) : (
					<p className="lc-quiet">Select a part of the diagram to read what it does.</p>
				)}
			</div>
		</Frame>
	);
}
