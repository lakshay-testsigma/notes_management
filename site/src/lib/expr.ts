/**
 * A tiny, safe math-expression evaluator for ParamPlayground.
 *
 * Expressions are plain strings such as `"exp(-rate * x)"`. They are parsed
 * into closures; nothing is ever passed to `eval` or `new Function`, and only
 * the names listed below (plus the caller's variables) are reachable.
 *
 * Supported: numbers, + - * / % ^, parentheses, comparisons (< <= > >= == !=),
 * && || !, the ternary `a ? b : c`, the constants `pi` and `e`, and the
 * functions in FUNCTIONS. True is 1 and false is 0.
 */
export type Scope = Record<string, number>;
export type Compiled = (scope: Scope) => number;

const FUNCTIONS: Record<string, (...args: number[]) => number> = {
	sin: Math.sin,
	cos: Math.cos,
	tan: Math.tan,
	tanh: Math.tanh,
	exp: Math.exp,
	ln: Math.log,
	log: Math.log,
	log2: Math.log2,
	log10: Math.log10,
	sqrt: Math.sqrt,
	abs: Math.abs,
	floor: Math.floor,
	ceil: Math.ceil,
	round: Math.round,
	sign: Math.sign,
	min: Math.min,
	max: Math.max,
	pow: Math.pow,
	clamp: (x, lo, hi) => Math.min(hi, Math.max(lo, x)),
	sigmoid: (x) => 1 / (1 + Math.exp(-x)),
	relu: (x) => Math.max(0, x),
	step: (x) => (x >= 0 ? 1 : 0),
};

const CONSTANTS: Record<string, number> = { pi: Math.PI, e: Math.E };

type Token = { type: 'num'; value: number } | { type: 'id'; value: string } | { type: 'op'; value: string };

function tokenize(source: string): Token[] {
	const tokens: Token[] = [];
	const pattern = /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+)|([A-Za-z_][A-Za-z0-9_]*)|(<=|>=|==|!=|&&|\|\||[-+*/%^()<>!?:,]))/y;
	let position = 0;
	while (position < source.length) {
		if (/^\s*$/.test(source.slice(position))) break;
		pattern.lastIndex = position;
		const match = pattern.exec(source);
		if (!match) throw new Error(`Unexpected character "${source.slice(position).trim()[0]}"`);
		if (match[1] !== undefined) tokens.push({ type: 'num', value: Number(match[1]) });
		else if (match[2] !== undefined) tokens.push({ type: 'id', value: match[2] });
		else tokens.push({ type: 'op', value: match[3] });
		position = pattern.lastIndex;
	}
	return tokens;
}

const BINARY: Record<string, [number, (a: number, b: number) => number]> = {
	'||': [1, (a, b) => (a !== 0 || b !== 0 ? 1 : 0)],
	'&&': [2, (a, b) => (a !== 0 && b !== 0 ? 1 : 0)],
	'==': [3, (a, b) => (a === b ? 1 : 0)],
	'!=': [3, (a, b) => (a !== b ? 1 : 0)],
	'<': [4, (a, b) => (a < b ? 1 : 0)],
	'<=': [4, (a, b) => (a <= b ? 1 : 0)],
	'>': [4, (a, b) => (a > b ? 1 : 0)],
	'>=': [4, (a, b) => (a >= b ? 1 : 0)],
	'+': [5, (a, b) => a + b],
	'-': [5, (a, b) => a - b],
	'*': [6, (a, b) => a * b],
	'/': [6, (a, b) => a / b],
	'%': [6, (a, b) => a % b],
};

/** Parse an expression once; call the result with the variable values. Throws on bad syntax. */
export function compile(source: string): Compiled {
	if (typeof source !== 'string' || source.length > 500) throw new Error('Expression is missing or too long');
	const tokens = tokenize(source);
	let i = 0;
	const peek = () => tokens[i];
	const isOp = (value: string) => peek()?.type === 'op' && peek().value === value;
	const expect = (value: string) => {
		if (!isOp(value)) throw new Error(`Expected "${value}"`);
		i++;
	};

	function ternary(): Compiled {
		const condition = binary(1);
		if (!isOp('?')) return condition;
		i++;
		const yes = ternary();
		expect(':');
		const no = ternary();
		return (scope) => (condition(scope) !== 0 ? yes(scope) : no(scope));
	}

	function binary(minLevel: number): Compiled {
		let left = unary();
		for (;;) {
			const token = peek();
			const entry = token?.type === 'op' ? BINARY[token.value] : undefined;
			if (!entry || entry[0] < minLevel) return left;
			i++;
			const right = binary(entry[0] + 1);
			const [, apply] = entry;
			const lhs = left;
			left = (scope) => apply(lhs(scope), right(scope));
		}
	}

	function unary(): Compiled {
		if (isOp('-')) {
			i++;
			const operand = unary();
			return (scope) => -operand(scope);
		}
		if (isOp('+')) {
			i++;
			return unary();
		}
		if (isOp('!')) {
			i++;
			const operand = unary();
			return (scope) => (operand(scope) === 0 ? 1 : 0);
		}
		return power();
	}

	function power(): Compiled {
		const base = primary();
		if (!isOp('^')) return base;
		i++;
		const exponent = unary(); // right associative: 2^3^2 = 2^(3^2)
		return (scope) => Math.pow(base(scope), exponent(scope));
	}

	function primary(): Compiled {
		const token = tokens[i++];
		if (!token) throw new Error('Expression ended too early');
		if (token.type === 'num') return () => token.value;
		if (token.type === 'op' && token.value === '(') {
			const inner = ternary();
			expect(')');
			return inner;
		}
		if (token.type === 'id') {
			const name = token.value;
			if (isOp('(')) {
				i++;
				const fn = Object.hasOwn(FUNCTIONS, name) ? FUNCTIONS[name] : null;
				if (!fn) throw new Error(`Unknown function "${name}"`);
				const args: Compiled[] = [];
				if (!isOp(')')) {
					do args.push(ternary());
					while (isOp(',') && ++i);
				}
				expect(')');
				return (scope) => fn(...args.map((arg) => arg(scope)));
			}
			if (Object.hasOwn(CONSTANTS, name)) return (scope) => (Object.hasOwn(scope, name) ? scope[name] : CONSTANTS[name]);
			return (scope) => {
				if (!Object.hasOwn(scope, name)) throw new Error(`Unknown name "${name}"`);
				return scope[name];
			};
		}
		throw new Error(`Unexpected "${token.value}"`);
	}

	const root = ternary();
	if (i < tokens.length) throw new Error(`Unexpected "${tokens[i].value}"`);
	return root;
}

/** Compile and evaluate in one go; returns NaN instead of throwing. */
export function evaluate(source: string, scope: Scope): number {
	try {
		return compile(source)(scope);
	} catch {
		return Number.NaN;
	}
}
