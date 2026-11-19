// Ports are the contracts that outer layers implement. JavaScript has no interfaces,
// so each port is a documented shape. Tests use fakes with the same methods.
//
// PageDriver
//   capture(url: string): Promise<Result<RawCapture>>
//
// CaptureStore
//   save(capture: RawCapture): Promise<string>        // returns a file name
//   load(name: string): Promise<Result<RawCapture>>
//
// RawCapture (what the drive and collect layers produce, plain JSON)
//   { schema: 1, url, capturedAt, settings: {...}, loadOutcome,
//     events: [{ method, params }],        // Network.*, Page.*, Runtime.*, Log.*
//     trace:  [{ name, ts, dur?, args? }], // Chrome trace events
//     heapSamples: [{ label, usedSize, totalSize }],
//     collectionErrors: { trace?: string, heap?: string } }
export const CAPTURE_SCHEMA = 1;
