interface ReaderTopic {
  slug: string;
  paths: { vault: string };
}
export const READER_STAGES: Record<string, string>;
export function readerFiles(root: string, topic: ReaderTopic, stage: string): string[];
export function indexOrder(root: string, topic: ReaderTopic, stage: string): string[];
export function readingProblems(root: string, topic: ReaderTopic & { reader_order?: Record<string, string[]> }, stage: string): string[];
