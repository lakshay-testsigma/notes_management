import type { GeneratedFile } from '../model';

interface FileTreeProps {
  files: GeneratedFile[];
}

export function FileTree({ files }: FileTreeProps) {
  return (
    <section aria-labelledby="files-heading">
      <h2 id="files-heading">Files that land under your home directory</h2>
      <ul>
        {files.map((file) => (
          <li key={file.path}>
            <details>
              <summary>{file.path}</summary>
              <pre>{file.content}</pre>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
