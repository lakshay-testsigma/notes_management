/**
 * Sample data for /playground/. Each export is the props of one shared
 * component, written the way a lesson author would write them in MDX.
 */

export const flow = {
	title: 'Retrieval-augmented generation, one question',
	nodes: [
		{ id: 'user', label: 'User', kind: 'pill' as const },
		{ id: 'embed', label: 'Embedder' },
		{ id: 'cache', label: 'Answer cache', kind: 'store' as const },
		{ id: 'db', label: 'Vector database', kind: 'store' as const },
		{ id: 'llm', label: 'Language model' },
	],
	edges: [
		{ from: 'user', to: 'embed' },
		{ from: 'embed', to: 'cache' },
		{ from: 'embed', to: 'db' },
		{ from: 'cache', to: 'llm' },
		{ from: 'db', to: 'llm' },
	],
	steps: [
		{ from: 'user', to: 'embed', packet: 'question', caption: 'The question is turned into a vector.' },
		{
			from: 'embed',
			to: 'cache',
			packet: 'vector',
			caption: 'The cache is checked for a question that means the same thing. This one is new.',
			fallback: { from: 'embed', to: 'db', packet: 'vector', caption: 'There is no cache, so the search goes straight to the database.' },
		},
		{ from: 'embed', to: 'db', packet: 'vector', caption: 'The database returns the chunks whose vectors are closest.' },
		{ from: 'db', to: 'llm', packet: 'top 3 chunks', caption: 'The chunks are placed in the prompt next to the question.' },
		{ from: 'llm', to: 'user', packet: 'answer', caption: 'The model answers from the retrieved text and cites it.' },
	],
	breakable: ['cache', 'db'],
	brokenCaptions: { db: 'Without the vector database nothing can be retrieved. The model would have to answer from memory, so the flow stops.' },
};

export const system = {
	title: 'A small web service',
	nodes: [
		{ id: 'client', label: 'Browser', kind: 'pill' as const, detail: 'Sends requests and renders responses.' },
		{ id: 'api', label: 'API server', detail: 'Checks who is asking, validates input, and decides which data is needed.' },
		{ id: 'cache', label: 'Cache', kind: 'store' as const, detail: 'Keeps recent answers in memory so repeated questions are fast.' },
		{ id: 'db', label: 'Database', kind: 'store' as const, detail: 'The source of truth. Slower than the cache, never wrong.' },
		{ id: 'queue', label: 'Job queue', kind: 'store' as const, detail: 'Holds slow work, such as sending email, so the request can finish early.' },
		{ id: 'worker', label: 'Worker', detail: 'Takes jobs from the queue and runs them in the background.' },
	],
	edges: [
		{ from: 'client', to: 'api', label: 'HTTPS' },
		{ from: 'api', to: 'cache', label: 'read' },
		{ from: 'api', to: 'db', label: 'query' },
		{ from: 'api', to: 'queue', label: 'enqueue' },
		{ from: 'queue', to: 'worker' },
	],
	initial: 'api',
};

export const sequence = {
	title: 'Logging in',
	actors: ['Browser', 'API', 'Database'],
	messages: [
		{ from: 'Browser', to: 'API', label: 'POST /login', note: 'Email and password travel over HTTPS' },
		{ from: 'API', to: 'Database', label: 'find user by email' },
		{ from: 'Database', to: 'API', label: 'user row', kind: 'reply' as const },
		{ from: 'API', to: 'API', label: 'compare password hash', note: 'The plain password is never stored' },
		{ from: 'API', to: 'Browser', label: '200 + session cookie', kind: 'reply' as const },
	],
};

export const machine = {
	title: 'An order',
	initial: 'cart',
	states: [
		{ id: 'cart', label: 'In cart', detail: 'Nothing has been charged.' },
		{ id: 'paid', label: 'Paid', detail: 'Money is taken; the warehouse is told.' },
		{ id: 'shipped', label: 'Shipped', detail: 'The parcel is with the courier.' },
		{ id: 'refunded', label: 'Refunded', detail: 'Money returned. This state is final.' },
	],
	transitions: [
		{ from: 'cart', to: 'paid', event: 'pay' },
		{ from: 'paid', to: 'shipped', event: 'ship' },
		{ from: 'paid', to: 'refunded', event: 'cancel', detail: 'Cancelled before shipping, so the refund is automatic.' },
		{ from: 'shipped', to: 'refunded', event: 'return' },
	],
};

export const graph = {
	title: 'Memory of an AI agent',
	editable: true,
	groups: [
		{ id: 'core', label: 'Agent' },
		{ id: 'memory', label: 'Memory' },
		{ id: 'tool', label: 'Tools' },
	],
	nodes: [
		{ id: 'agent', label: 'Agent loop', group: 'core', size: 1.5, detail: 'Reads the goal, decides the next step, calls a tool, looks at the result, repeats.' },
		{ id: 'planner', label: 'Planner', group: 'core', detail: 'Breaks the goal into steps.' },
		{ id: 'working', label: 'Working memory', group: 'memory', detail: 'The current conversation and scratch notes. Lost when the task ends.' },
		{ id: 'episodic', label: 'Episodic memory', group: 'memory', detail: 'What happened in earlier tasks, stored as searchable records.' },
		{ id: 'semantic', label: 'Semantic memory', group: 'memory', detail: 'Facts and documents, stored as vectors.' },
		{ id: 'vector', label: 'Vector database', group: 'memory', detail: 'Finds the stored items closest in meaning to a query.' },
		{ id: 'search', label: 'Web search', group: 'tool', detail: 'Looks things up outside the agent.' },
		{ id: 'code', label: 'Code runner', group: 'tool', detail: 'Runs code and returns the output.' },
	],
	links: [
		{ source: 'agent', target: 'planner' },
		{ source: 'agent', target: 'working' },
		{ source: 'agent', target: 'episodic' },
		{ source: 'agent', target: 'semantic' },
		{ source: 'episodic', target: 'vector' },
		{ source: 'semantic', target: 'vector' },
		{ source: 'agent', target: 'search' },
		{ source: 'agent', target: 'code' },
		{ source: 'planner', target: 'working' },
	],
};

export const space = {
	title: 'Sentences as points',
	axes: ['cooking', 'travel', 'money'] as [string, string, string],
	k: 3,
	metric: 'cosine' as const,
	query: { label: 'cheap flights', x: 0.1, y: 0.8, z: 0.6 },
	points: [
		{ label: 'bake bread', x: 0.95, y: 0.05, z: 0.1, group: 'cooking' },
		{ label: 'knife skills', x: 0.8, y: 0.02, z: 0.25, group: 'cooking' },
		{ label: 'street food in Hanoi', x: 0.7, y: 0.65, z: 0.15, group: 'cooking' },
		{ label: 'train passes', x: 0.02, y: 0.9, z: 0.45, group: 'travel' },
		{ label: 'packing light', x: 0.05, y: 0.85, z: 0.1, group: 'travel' },
		{ label: 'budget airlines', x: 0.03, y: 0.8, z: 0.7, group: 'travel' },
		{ label: 'index funds', x: 0.02, y: 0.05, z: 0.95, group: 'money' },
		{ label: 'travel insurance', x: 0.02, y: 0.6, z: 0.75, group: 'money' },
	],
};

export const lineChart = {
	title: 'Training and validation loss',
	type: 'line' as const,
	data: [
		{ epoch: 1, train: 2.31, validation: 2.35 },
		{ epoch: 2, train: 1.62, validation: 1.71 },
		{ epoch: 3, train: 1.18, validation: 1.33 },
		{ epoch: 4, train: 0.91, validation: 1.12 },
		{ epoch: 5, train: 0.72, validation: 1.02 },
		{ epoch: 6, train: 0.58, validation: 0.99 },
		{ epoch: 7, train: 0.47, validation: 1.01 },
		{ epoch: 8, train: 0.39, validation: 1.06 },
	],
	x: 'epoch',
	y: ['train', 'validation'],
	labels: { train: 'Training loss', validation: 'Validation loss' },
	xLabel: 'Epoch',
	yLabel: 'Loss',
};

export const barChart = {
	title: 'Median response time by cache setting',
	type: 'bar' as const,
	data: [
		{ setting: 'No cache', ms: 240 },
		{ setting: 'Page cache', ms: 95 },
		{ setting: 'Query cache', ms: 60 },
		{ setting: 'Both', ms: 22 },
	],
	x: 'setting',
	y: 'ms',
	yLabel: 'Milliseconds',
};

export const scatterChart = {
	title: 'Model size against accuracy',
	type: 'scatter' as const,
	data: [
		{ name: 'tiny', params: 5, accuracy: 71 },
		{ name: 'small', params: 22, accuracy: 79 },
		{ name: 'base', params: 86, accuracy: 84 },
		{ name: 'large', params: 304, accuracy: 87 },
		{ name: 'huge', params: 632, accuracy: 88 },
	],
	x: 'params',
	y: 'accuracy',
	labelKey: 'name',
	xLabel: 'Parameters (millions)',
	yLabel: 'Accuracy (%)',
};

export const params = {
	title: 'Learning rate and how fast the loss falls',
	params: [
		{ name: 'rate', label: 'Learning rate', min: 0.01, max: 0.5, step: 0.01, value: 0.1 },
		{ name: 'floor', label: 'Best possible loss', min: 0, max: 0.5, step: 0.05, value: 0.1 },
		{ name: 'warmup', label: 'Use warm-up', type: 'toggle' as const, value: false },
	],
	chart: {
		x: { name: 'step', label: 'Training step', min: 0, max: 60 },
		series: [{ label: 'Loss', expr: 'floor + (1 - floor) * exp(-rate * (warmup ? max(0, step - 10) : step))' }],
		yLabel: 'Loss',
		yMin: 0,
		yMax: 1,
	},
	outputs: [{ label: 'Steps to halve the gap', expr: 'ln(2) / rate + (warmup ? 10 : 0)', digits: 1 }],
};

export const code = {
	title: 'Retry with backoff',
	lang: 'ts',
	code: `
async function fetchWithRetry(url: string, tries = 3): Promise<Response> {
  let wait = 200;
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const response = await fetch(url);
      if (response.ok) return response;
    } catch {
      // network error: fall through and retry
    }
    await new Promise((done) => setTimeout(done, wait));
    wait *= 2;
  }
  throw new Error("gave up after " + tries + " tries");
}
`,
	steps: [
		{ lines: [1, 2] as [number, number], title: 'Setup', caption: 'Three tries by default, starting with a 200 ms wait.' },
		{ lines: [4, 9] as [number, number], title: 'One attempt', caption: 'A good response returns at once. A bad one, or a network error, falls through.' },
		{ lines: [10, 11] as [number, number], title: 'Back off', caption: 'Wait, then double the wait, so a struggling server gets room to recover.' },
		{ lines: 13, title: 'Give up', caption: 'After the last try the caller gets a clear error instead of waiting forever.' },
	],
};

export const timeline = {
	title: 'Attention is all you need, before and after',
	events: [
		{ when: '2014', title: 'Attention for translation', detail: 'A translation model learns to look back at the source sentence while writing each word.' },
		{ when: '2017', title: 'The Transformer', detail: 'Recurrence is removed entirely; attention alone connects every word to every other word.' },
		{ when: '2018', title: 'Pre-training', detail: 'Models are trained once on large text collections and then adapted to many tasks.' },
		{ when: '2020', title: 'Scaling up', detail: 'Much larger models show that the same architecture keeps improving with size and data.' },
		{ when: '2022', title: 'Chat assistants', detail: 'Transformer language models reach the general public as conversational assistants.' },
	],
};

export const mermaid = {
	title: 'A mermaid diagram',
	chart: `
sequenceDiagram
  participant C as Client
  participant S as Server
  C->>S: GET /notes
  S-->>C: 200 OK
`,
	caption: 'Mermaid is good for quick sketches. Prefer the animated components when order or motion is the point.',
};

export const quiz = {
	question: 'Why does a vector database return the "nearest" chunks rather than exact matches?',
	options: [
		'Exact matching is too slow',
		'Meaning is compared, so different words with the same meaning still match',
		'Vectors cannot be compared exactly',
	],
	answer: 1,
	explanation: 'Text is turned into vectors that sit close together when the meaning is similar, so a search by distance finds related text even when no word is shared.',
};

export const multiQuiz = {
	question: 'Which of these belong in a lesson page?',
	options: ['At least one visual component', 'A quote block for important notes', 'At least one activity', 'Around 110 to 260 words of prose'],
	answer: [0, 2, 3],
	explanation: 'Quote blocks and callout boxes are not used. An important remark is a plain paragraph that starts with a bold "Note."',
};

export const predict = {
	prompt: 'A cache sits in front of a database. The cache goes down. What happens to requests?',
	options: ['They all fail', 'They still succeed, but slower', 'Nothing changes'],
	correct: 1,
	answer: 'They still succeed, but slower.',
	reasoning: 'The database is the source of truth. The cache only saves time, so losing it costs speed and puts more load on the database.',
};

export const predictOpen = {
	prompt: 'You double the learning rate of a model that was training smoothly. Describe what you expect the loss curve to do.',
	answer: 'It falls faster at first, and may start to bounce or even rise.',
	reasoning: 'Bigger steps reach the low region sooner but can overshoot it. Past a certain rate the steps are too large to settle.',
};

export const order = {
	prompt: 'Put the steps of answering a question with retrieval in order.',
	steps: ['Turn the question into a vector', 'Find the closest stored chunks', 'Put the chunks into the prompt', 'Generate the answer', 'Show the answer with its sources'],
};

export const match = {
	prompt: 'Match each HTTP status to its meaning.',
	pairs: [
		{ term: '200', definition: 'The request worked' },
		{ term: '301', definition: 'The resource has moved for good' },
		{ term: '404', definition: 'Nothing lives at this address' },
		{ term: '500', definition: 'The server failed while handling the request' },
	],
};
