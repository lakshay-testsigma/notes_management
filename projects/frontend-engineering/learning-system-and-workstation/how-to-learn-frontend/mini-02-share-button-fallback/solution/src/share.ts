// The decision logic lives here. It never touches the global `navigator`,
// so tests can pass a fake one and cover every path without a browser.

export interface ShareData {
  title: string;
  url: string;
}

// The small slice of `navigator` this module needs. Both members are optional
// because an older browser or an insecure page may lack them.
export interface NavigatorLike {
  share?: (data: ShareData) => Promise<void>;
  clipboard?: { writeText: (text: string) => Promise<void> };
}

export type ShareOutcome = "shared" | "copied" | "cancelled" | "link";

export interface ShareResult {
  outcome: ShareOutcome;
  message: string; // shown in the visible status line
}

export function hasShare(nav: NavigatorLike): boolean {
  // Test the member, never the browser name.
  return "share" in nav && typeof nav.share === "function";
}

export function hasClipboard(nav: NavigatorLike): boolean {
  // `clipboard` is missing on insecure pages, so check the nested method too.
  return "clipboard" in nav && typeof nav.clipboard?.writeText === "function";
}

// When a person closes the share sheet, the browser rejects with AbortError.
// That is a choice, not a failure.
export function isCancel(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export async function shareOrCopy(nav: NavigatorLike, data: ShareData): Promise<ShareResult> {
  if (hasShare(nav)) {
    try {
      await nav.share!(data);
      return { outcome: "shared", message: "Shared." };
    } catch (error) {
      if (isCancel(error)) {
        return { outcome: "cancelled", message: "Share cancelled." };
      }
      // Any other error: fall through to the copy path.
    }
  }

  if (hasClipboard(nav)) {
    try {
      await nav.clipboard!.writeText(data.url);
      return { outcome: "copied", message: "Link copied to the clipboard." };
    } catch {
      // Permission denied: fall through to the visible link.
    }
  }

  return { outcome: "link", message: "Copy this link by hand:" };
}
