// A module-level array lives as long as the page does. Whatever it holds stays in memory.
const cachedNodes = [];

export function cacheNode(node) {
  cachedNodes.push(node);
  return node;
}

export function cacheSize() {
  return cachedNodes.length;
}

// Tests start each case from an empty cache with this.
export function resetCacheForTests() {
  cachedNodes.length = 0;
}

// A cached node that is no longer in the page is a detached DOM node.
export function countDetached() {
  return cachedNodes.filter((node) => !node.isConnected).length;
}

// TODO(2): Empty the cache so it stops holding nodes. The tests describe the behavior.
export function clearCache() {
  throw new Error("TODO(2): clearCache is not implemented yet");
}
