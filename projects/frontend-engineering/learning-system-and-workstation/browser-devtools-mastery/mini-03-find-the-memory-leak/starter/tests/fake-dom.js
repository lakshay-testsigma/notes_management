// A tiny stand-in for the browser, enough for the router and the views. No browser needed.
export class FakeNode {
  constructor(tag) {
    this.tag = tag;
    this.children = [];
    this.parent = null;
    this.textContent = "";
  }
  append(...nodes) {
    for (const node of nodes) {
      node.parent = this;
      this.children.push(node);
    }
  }
  replaceChildren(...nodes) {
    for (const child of this.children) child.parent = null;
    this.children = [];
    this.append(...nodes);
  }
  // Connected means: following parents ends at the document body.
  get isConnected() {
    let node = this;
    while (node.parent) node = node.parent;
    return node.tag === "body";
  }
}

export class FakeDocument {
  constructor() {
    this.body = new FakeNode("body");
  }
  createElement(tag) {
    return new FakeNode(tag);
  }
}

export class FakeWindow {
  constructor() {
    this.listeners = new Map();
    this.location = { hash: "" };
    this.innerWidth = 800;
  }
  addEventListener(type, fn) {
    if (!this.listeners.has(type)) this.listeners.set(type, new Set());
    this.listeners.get(type).add(fn);
  }
  removeEventListener(type, fn) {
    this.listeners.get(type)?.delete(fn);
  }
  listenerCount(type) {
    return this.listeners.get(type)?.size ?? 0;
  }
  dispatch(type) {
    for (const fn of [...(this.listeners.get(type) ?? [])]) fn();
  }
  goTo(hash) {
    this.location.hash = hash;
    this.dispatch("hashchange");
  }
}
