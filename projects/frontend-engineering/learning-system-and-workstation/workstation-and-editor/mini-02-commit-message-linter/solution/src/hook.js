// Git adds "#" lines to the message file; Git removes them after the hook runs.
export function stripComments(text) {
  return text.split("\n").filter((line) => !line.startsWith("#")).join("\n").trim();
}

// Exit 1 only for error-level problems. Warnings print but do not block.
export function exitCodeFor(result) {
  return result.errors.length > 0 ? 1 : 0;
}
