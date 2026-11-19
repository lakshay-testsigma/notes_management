import { type BundleDownloader, type GeneratedBundle } from '../../src/features/configurator/model';

export class FakeBundleDownloader implements BundleDownloader {
  downloaded: { bundle: GeneratedBundle; filename: string } | null = null;

  download(bundle: GeneratedBundle, filename: string): void {
    this.downloaded = { bundle, filename };
  }
}
