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

// TODO(1): Return true when `nav` has a `share` member that is a function.
// Use the `in` operator. Do not read the browser name.
export function hasShare(nav: NavigatorLike): boolean {
  throw new Error("TODO(1): hasShare is not implemented yet");
}

// TODO(2): Return true when `nav.clipboard.writeText` is a function.
// The `clipboard` member is missing on insecure pages, so handle that.
export function hasClipboard(nav: NavigatorLike): boolean {
  throw new Error("TODO(2): hasClipboard is not implemented yet");
}

// TODO(3): Return true when `error` is an Error named "AbortError".
// The browser raises it when a person closes the share sheet.
export function isCancel(error: unknown): boolean {
  throw new Error("TODO(3): isCancel is not implemented yet");
}

// TODO(4): Share with the Web Share API when it exists; otherwise copy
// `data.url`; otherwise ask the person to copy the link by hand.
// Return a ShareResult. Closing the share sheet is "cancelled", not an error.
// Any other failure moves on to the next path.
export async function shareOrCopy(nav: NavigatorLike, data: ShareData): Promise<ShareResult> {
  throw new Error("TODO(4): shareOrCopy is not implemented yet");
}
