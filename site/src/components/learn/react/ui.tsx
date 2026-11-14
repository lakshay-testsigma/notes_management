import type { ReactNode } from 'react';

/** The only control style lesson components use: a plain text button. */
export function TextButton(props: {
	children: ReactNode;
	onClick?: () => void;
	pressed?: boolean;
	disabled?: boolean;
	label?: string;
}) {
	return (
		<button
			type="button"
			className="lc-btn"
			onClick={props.onClick}
			disabled={props.disabled}
			aria-pressed={props.pressed}
			aria-label={props.label}
		>
			{props.children}
		</button>
	);
}

/** Wrapper every lesson component shares: spacing plus an optional small title. */
export function Frame(props: { name: string; title?: string; children: ReactNode }) {
	return (
		<figure className={`lc lc-${props.name}`}>
			{props.title && <figcaption className="lc-title">{props.title}</figcaption>}
			{props.children}
		</figure>
	);
}
