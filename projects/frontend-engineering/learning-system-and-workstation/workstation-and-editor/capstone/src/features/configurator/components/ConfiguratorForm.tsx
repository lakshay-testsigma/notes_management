// The one page: a form over the useConfigurator hook. Function components only;
// the domain, generator, storage, and downloader behind it are classes.

import { useConfigurator, type ConfiguratorServices } from '../hooks/useConfigurator';
import type { Logger } from '../../../shared/lib/Logger';
import { EDITORS, SHELLS } from '../model';
import { Button } from '../../../shared/ui/Button';
import { SelectField } from '../../../shared/ui/SelectField';
import { TextField } from '../../../shared/ui/TextField';
import { Checklist } from './Checklist';
import { FileTree } from './FileTree';

interface ConfiguratorFormProps {
  services: ConfiguratorServices;
  title: string;
  logger: Logger;
}

const SHELL_OPTIONS = SHELLS.map((shell) => ({ value: shell, label: shell }));
const EDITOR_OPTIONS = EDITORS.map((editor) => ({ value: editor, label: editor }));

export function ConfiguratorForm({ services, title, logger }: ConfiguratorFormProps) {
  const { draft, fieldErrors, status, bundle, setField, generate, download, reset } =
    useConfigurator(services, logger);

  return (
    <main>
      <h1>{title}</h1>
      <p>
        Choose your shell, git identity, editor, and Node version to receive a ready dotfiles
        repository.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          generate();
        }}
      >
        <SelectField
          id="shell"
          label="Shell"
          value={draft.shell}
          options={SHELL_OPTIONS}
          error={fieldErrors.shell}
          onChange={(value) => setField('shell', value)}
        />
        <TextField
          id="gitName"
          label="Git name"
          value={draft.gitName}
          error={fieldErrors.gitName}
          onChange={(value) => setField('gitName', value)}
        />
        <TextField
          id="gitEmail"
          label="Git email"
          value={draft.gitEmail}
          error={fieldErrors.gitEmail}
          onChange={(value) => setField('gitEmail', value)}
        />
        <SelectField
          id="editor"
          label="Editor"
          value={draft.editor}
          options={EDITOR_OPTIONS}
          error={fieldErrors.editor}
          onChange={(value) => setField('editor', value)}
        />
        <TextField
          id="nodeVersion"
          label="Node version"
          value={draft.nodeVersion}
          error={fieldErrors.nodeVersion}
          onChange={(value) => setField('nodeVersion', value)}
        />
        <div>
          <Button type="submit">Generate dotfiles</Button>
          <Button type="button" onClick={reset}>
            Reset
          </Button>
        </div>
        {status === 'error' && fieldErrors.form ? (
          <p role="alert">{fieldErrors.form}</p>
        ) : null}
      </form>

      {bundle && status === 'ready' ? (
        <section aria-label="Generated dotfiles">
          <Checklist items={bundle.checklist} />
          <FileTree files={bundle.files} />
          <Button type="button" onClick={download}>
            Download install.sh
          </Button>
        </section>
      ) : null}
    </main>
  );
}
