import type { ProgressiveSceneProps } from '../components/learn/react/progressive-scene';

// Synthetic teaching traces, not benchmarks or a live distributed simulation.
export const cacheScene: ProgressiveSceneProps = {
	title: 'Build a cache-aside read path',
	intro: 'Advance one change at a time. Select a block to inspect its role. Timings are illustrative, not measured.',
	nodes: [
		{ id: 'browser', label: 'Browser', kind: 'client', position: [-1, 0], detail: 'Asks the application for a product. It does not read the application cache directly.' },
		{ id: 'app', label: 'Product API', position: [0, -1], detail: 'Owns the read path: checks the cache, fetches a missing product, and fills the cache.' },
		{ id: 'db', label: 'Product store', kind: 'store', position: [1, 0], detail: 'Holds the authoritative product record in this example.' },
		{ id: 'cache', label: 'Read cache', kind: 'store', position: [0, 1], detail: 'Holds a temporary copy. A missing or expired entry sends this read back to the product store.' },
	],
	edges: [
		{ id: 'request', from: 'browser', to: 'app', label: 'Request a product' },
		{ id: 'read', from: 'app', to: 'db', label: 'Read the authoritative record' },
		{ id: 'lookup', from: 'app', to: 'cache', label: 'Look up the cached product' },
		{ id: 'hit', from: 'cache', to: 'app', label: 'Return the cached product' },
	],
	steps: [
		{ title: 'Start with the reader', description: 'A browser needs a product. No backend has been introduced yet.', nodes: ['browser'], edges: [], focus: ['browser'], changes: ['The reader appears. No request has been sent.'], metrics: [{ label: 'Product store reads', value: '0' }] },
		{ title: 'Add the application', description: 'The browser sends its request to the Product API. The API owns the data access policy.', nodes: ['browser','app'], edges: ['request'], focus: ['app'], changes: ['Product API added.', 'The request now has a destination.'], metrics: [{ label: 'Product store reads', value: '0' }] },
		{ title: 'Read without a cache', description: 'The API reads the product from the authoritative store. Each repeated request would repeat this read.', nodes: ['browser','app','db'], edges: ['request','read'], focus: ['db'], changes: ['Product store added.', 'The first database read is needed.'], metrics: [{ label: 'Product store reads', value: '1' }, { label: 'Example response', value: '80 ms' }] },
		{ title: 'Introduce the cache', description: 'For this new request, the API checks an empty cache, then reads the store. The API writes the returned product into the cache.', nodes: ['browser','app','db','cache'], edges: ['request','lookup','read'], focus: ['cache'], changes: ['Read cache added; the first lookup misses.', 'The API fills the cache after reading the store.'], metrics: [{ label: 'Product store reads', value: '2' }, { label: 'Cache state after read', value: 'Product stored' }] },
		{ title: 'Repeat the read', description: 'The same product is still cached. The API can return it without a new product-store read. This snapshot shows the cache-hit path.', nodes: ['browser','app','db','cache'], edges: ['request','lookup','hit'], focus: ['cache','app'], changes: ['The store stays in place, but its read path is inactive.', 'The read count stays at two.'], metrics: [{ label: 'Product store reads', value: '2' }, { label: 'Example response', value: '8 ms' }] },
		{ title: 'The cache becomes unavailable', description: 'This example chooses a fallback policy: bypass the failed cache and read the store. Other systems may reject the request to protect the store.', nodes: ['browser','app','db','cache'], edges: ['request','read'], failed: ['cache'], focus: ['db'], changes: ['Read cache marked unavailable.', 'Traffic bypasses the cache; the store read count increases.'], metrics: [{ label: 'Product store reads', value: '3' }, { label: 'Example response', value: '80 ms' }] },
	],
};

export const buildScene: ProgressiveSceneProps = {
	title: 'Follow a frontend build',
	intro: 'Predict which artifact appears next, then advance. This is a simplified teaching trace, not a running compiler.',
	nodes: [
		{ id:'source', label:'Source files', kind:'queue', position:[-1,0], detail:'Application modules import other modules and assets. This trace omits type checking and development-server behavior.' },
		{ id:'bundler', label:'Bundler', position:[0,-1], detail:'Resolves imports, transforms input modules and produces deployable output in the configured build.' },
		{ id:'output', label:'Build output', kind:'store', position:[1,0], detail:'Generated HTML, JavaScript, styles and assets can be published to a web server.' },
		{ id:'browser', label:'Browser', kind:'client', position:[0,1], detail:'Loads the delivered output. Building a bundle is different from executing that bundle in a browser.' },
	],
	edges:[
		{ id:'input',from:'source',to:'bundler',label:'Resolve and transform source' },
		{ id:'emit',from:'bundler',to:'output',label:'Emit build artifacts' },
		{ id:'load',from:'output',to:'browser',label:'Serve artifacts to the browser' },
	],
	steps:[
		{ title:'Author the source',description:'Modules exist as source files. A production build has not run.',nodes:['source'],edges:[],changes:['Only the source files exist.'] },
		{ title:'Resolve and transform',description:'The bundler follows imports and transforms modules according to its configuration.',nodes:['source','bundler'],edges:['input'],focus:['bundler'],changes:['Bundler added.', 'Source files become inputs to the build.'] },
		{ title:'Emit output',description:'The build writes deployable artifacts. The browser has not executed them yet.',nodes:['source','bundler','output'],edges:['emit'],focus:['output'],changes:['Build output added.', 'Build-time work has produced files.'] },
		{ title:'Load at runtime',description:'A web server delivers the output to the browser. Runtime begins after the build.',nodes:['source','bundler','output','browser'],edges:['load'],focus:['browser'],changes:['Browser added.', 'The active path is now delivery, not compilation.'] },
	],
};
