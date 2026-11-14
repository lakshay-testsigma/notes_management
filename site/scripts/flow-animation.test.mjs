import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { test } from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const source = readFileSync(new URL('../src/components/learn/react/FlowAnimation.tsx', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
}).outputText;

// Synthetic fixtures deliberately live with the regression, independent of any
// learner's generated notes. Removing a topic must not remove test coverage.
function haltedRoute() {
  return {
    nodes: ['input', 'question', 'lookup', 'processor', 'output'].map(id => ({ id, label: id === 'lookup' ? 'Lookup' : id })),
    breakable: ['lookup'],
    brokenCaptions: { lookup: 'The flow ends here because Lookup is unavailable.' },
    steps: [
      { from: 'input', to: 'question', caption: 'Accept input.' },
      { from: 'question', to: 'lookup', caption: 'Fetch supporting data.', fallback: { from: 'question', to: 'processor', caption: 'Continue with only unverified input.' } },
      { from: 'lookup', to: 'processor', caption: 'Process verified input.', fallback: { from: 'processor', to: 'output', caption: 'Produce an unverified result.' } },
      { from: 'lookup', to: 'output', caption: 'Validate support.', fallback: { from: 'output', to: 'input', caption: 'The unverified result fails validation.' } },
      { from: 'output', to: 'lookup', caption: 'Require the dependency before continuing.' },
      { from: 'question', to: 'processor', caption: 'Prepare the verified response.' },
      { from: 'processor', to: 'output', caption: 'Validate the response.' },
      { from: 'output', to: 'input', caption: 'Return the verified result.' },
    ],
  };
}
function independentRoute() {
  return {
    nodes: ['producer', 'store', 'worker', 'reader'].map(id => ({ id, label: id === 'worker' ? 'Worker' : id })),
    breakable: ['worker'],
    steps: [
      { from: 'producer', to: 'store', caption: 'Store a record.' },
      { from: 'store', to: 'worker', caption: 'Deliver work.', fallback: { from: 'producer', to: 'store', caption: 'The offline worker does not remove the stored record.' } },
      { from: 'store', to: 'reader', caption: 'An independent reader replays the record.' },
      { from: 'producer', to: 'store', caption: 'The next record appends.' },
    ],
  };
}

// Exercise the real component's handlers and effects. Leave animation frames
// pending so every click lands before the packet tween finishes, deterministically.
function mount(props) {
  const slots = [];
  let cursor = 0, pendingEffects = [], dirty = false, tree;
  const same = (a, b) => a && b && a.length === b.length && a.every((value, i) => value === b[i]);
  const hooks = {
    useState(initial) {
      const slot = cursor++;
      if (!(slot in slots)) slots[slot] = initial;
      return [slots[slot], (value) => {
        const next = typeof value === 'function' ? value(slots[slot]) : value;
        if (next !== slots[slot]) { slots[slot] = next; dirty = true; }
      }];
    },
    useRef(initial) { return slots[cursor++] ??= { current: initial }; },
    useMemo(compute) { cursor++; return compute(); },
    useEffect(effect, deps) {
      const slot = cursor++;
      if (!same(slots[slot], deps)) { slots[slot] = deps; pendingEffects.push(effect); }
    },
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name === 'react') return hooks;
      if (name === 'react/jsx-runtime') {
        const jsx = (type, props) => ({ type, props });
        return { jsx, jsxs: jsx };
      }
      if (name === './hooks') return { useReducedMotion: () => false };
      return {}; // GraphCanvas and UI wrappers do not affect navigation state.
    },
    requestAnimationFrame: () => 1,
    cancelAnimationFrame() {},
    setTimeout() { assert.fail('Playback must wait for the pending animation frame'); },
    clearTimeout() {},
  });
  function render() {
    do {
      dirty = false; cursor = 0; pendingEffects = [];
      tree = exports.default(props);
      for (const effect of pendingEffects) effect();
    } while (dirty);
  }
  function find(node, predicate) {
    if (!node || typeof node !== 'object') return null;
    if (predicate(node)) return node;
    for (const child of [node.props?.children].flat(Infinity)) {
      const found = find(child, predicate);
      if (found) return found;
    }
    return null;
  }
  const button = (label) => find(tree, (node) => node.props?.children === label && typeof node.props?.onClick === 'function');
  const text = (node) => typeof node === 'string' || typeof node === 'number' ? String(node)
    : [node?.props?.children].flat(Infinity).map((child) => child ? text(child) : '').join('');
  render();
  return {
    button,
    click(label) { button(label).props.onClick(); render(); },
    caption() { return text(find(tree, (node) => node.props?.className === 'lc-caption')); },
  };
}

test('A disabled dependency follows fallback steps and cannot bypass a halt during a tween', () => {
  const flow = mount(haltedRoute());
  flow.click('Lookup');
  assert.equal(flow.button('Lookup').props.pressed, true);
  flow.click('Step'); flow.click('Step');
  assert.match(flow.caption(), /only unverified input/);
  flow.click('Step');
  assert.match(flow.caption(), /unverified result/);
  flow.click('Step');
  assert.match(flow.caption(), /fails validation/);
  flow.click('Step');
  const stopped = flow.caption();
  assert.match(stopped, /flow ends here/);
  assert.equal(flow.button('Step').props.disabled, true);
  flow.click('Step'); // Also guard the handler itself against a queued click.
  assert.equal(flow.caption(), stopped);
  flow.click('Back');
  assert.match(flow.caption(), /fails validation/);
  flow.click('Restart');
  assert.match(flow.caption(), /Lookup is switched off/);
  flow.click('Lookup');
  assert.equal(flow.button('Lookup').props.pressed, false);
  for (let n = 0; n < 8; n++) flow.click('Step');
  assert.match(flow.caption(), /verified result/);
  assert.equal(flow.button('Step').props.disabled, true);
});

test('A disabled worker allows an independent reader route to finish', () => {
  const flow = mount(independentRoute());
  flow.click('Worker');
  flow.click('Step'); flow.click('Step');
  assert.match(flow.caption(), /offline worker does not remove the stored record/);
  assert.equal(flow.button('Step').props.disabled, false);
  flow.click('Step');
  assert.match(flow.caption(), /independent reader replays/);
  flow.click('Step');
  assert.match(flow.caption(), /next record appends/);
  assert.equal(flow.button('Step').props.disabled, true);
});
