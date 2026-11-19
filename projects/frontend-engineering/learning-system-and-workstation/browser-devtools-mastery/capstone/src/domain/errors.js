// Each failure the inspector can report is its own class, so the interface layer can map it.
export class InspectorError extends Error {
  constructor(message, code) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class InvalidUrlError extends InspectorError {
  constructor(message) {
    super(message, "invalid_url");
  }
}

export class ChromeLaunchError extends InspectorError {
  constructor(message) {
    super(message, "chrome_launch_failed");
  }
}

export class CdpCommandError extends InspectorError {
  constructor(message) {
    super(message, "cdp_command_failed");
  }
}

export class CdpTimeoutError extends InspectorError {
  constructor(method, ms) {
    super(`CDP command ${method} got no reply in ${ms} ms`, "cdp_timeout");
  }
}

export class TargetCrashedError extends InspectorError {
  constructor() {
    super("The page crashed or the connection closed", "target_crashed");
  }
}

export class MissingTraceDataError extends InspectorError {
  constructor(what) {
    super(`The trace has no ${what}`, "missing_trace_data");
  }
}

export class CaptureFormatError extends InspectorError {
  constructor(message) {
    super(message, "bad_capture");
  }
}
