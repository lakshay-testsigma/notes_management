// The production download adapter: triggers a browser download of the
// installer, behind the BundleDownloader port.

import { type BundleDownloader, type GeneratedBundle } from '../../features/configurator/model';

export class BrowserBundleDownloader implements BundleDownloader {
  download(bundle: GeneratedBundle, filename: string): void {
    const blob = new Blob([bundle.installScript], { type: 'text/x-shellscript' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }
}
