import { describe, expect, it, vi } from "vitest";
import { hasClipboard, hasShare, isCancel, shareOrCopy, type NavigatorLike } from "../src/share";

const data = { title: "My post", url: "https://example.com/post" };

function abortError(): Error {
  const error = new Error("closed");
  error.name = "AbortError";
  return error;
}

describe("hasShare", () => {
  it("is true when navigator has a share function", () => {
    expect(hasShare({ share: async () => {} })).toBe(true);
  });
  it("is false when the member is missing", () => {
    expect(hasShare({})).toBe(false);
  });
  it("is false when the member is not a function", () => {
    expect(hasShare({ share: "yes" } as unknown as NavigatorLike)).toBe(false);
  });
});

describe("hasClipboard", () => {
  it("is true when clipboard.writeText exists", () => {
    expect(hasClipboard({ clipboard: { writeText: async () => {} } })).toBe(true);
  });
  it("is false when clipboard is missing", () => {
    expect(hasClipboard({})).toBe(false);
  });
  it("is false when clipboard exists without writeText", () => {
    expect(hasClipboard({ clipboard: {} } as unknown as NavigatorLike)).toBe(false);
  });
});

describe("isCancel", () => {
  it("recognizes AbortError", () => {
    expect(isCancel(abortError())).toBe(true);
  });
  it("rejects other errors and non-errors", () => {
    expect(isCancel(new Error("boom"))).toBe(false);
    expect(isCancel("AbortError")).toBe(false);
  });
});

describe("shareOrCopy: path 1, Web Share API", () => {
  it("calls navigator.share and reports shared", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn();
    const result = await shareOrCopy({ share, clipboard: { writeText } }, data);
    expect(share).toHaveBeenCalledWith(data);
    expect(writeText).not.toHaveBeenCalled();
    expect(result.outcome).toBe("shared");
  });
  it("treats a closed share sheet as cancelled, not as an error", async () => {
    const writeText = vi.fn();
    const result = await shareOrCopy(
      { share: vi.fn().mockRejectedValue(abortError()), clipboard: { writeText } },
      data,
    );
    expect(result.outcome).toBe("cancelled");
    expect(writeText).not.toHaveBeenCalled();
  });
  it("falls back to copy when share fails for another reason", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const result = await shareOrCopy(
      { share: vi.fn().mockRejectedValue(new Error("NotAllowedError")), clipboard: { writeText } },
      data,
    );
    expect(writeText).toHaveBeenCalledWith(data.url);
    expect(result.outcome).toBe("copied");
  });
});

describe("shareOrCopy: path 2, clipboard", () => {
  it("copies the url when share is missing", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const result = await shareOrCopy({ clipboard: { writeText } }, data);
    expect(writeText).toHaveBeenCalledWith(data.url);
    expect(result.outcome).toBe("copied");
  });
  it("shows the link when the clipboard write is rejected", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const result = await shareOrCopy({ clipboard: { writeText } }, data);
    expect(result.outcome).toBe("link");
  });
});

describe("shareOrCopy: path 3, visible link", () => {
  it("shows the link when neither API exists", async () => {
    const result = await shareOrCopy({}, data);
    expect(result.outcome).toBe("link");
    expect(result.message.length).toBeGreaterThan(0);
  });
});
