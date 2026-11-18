/**
 * Turn a roadmap item name into a name that a file system accepts.
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Name the note file after the day and the roadmap item.
 */
export function noteFileName(date: string, topic: string): string {
  return `${date}-${toSlug(topic)}.md`;
}
