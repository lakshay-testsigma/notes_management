// Writes one JSON object per line. Every call can carry a requestId.
export class Logger {
  constructor(write = (line) => process.stdout.write(line + "\n"), clock = () => new Date()) {
    this.write = write;
    this.clock = clock;
  }

  info(event, fields = {}) {
    this.#log("info", event, fields);
  }

  warn(event, fields = {}) {
    this.#log("warn", event, fields);
  }

  error(event, fields = {}) {
    this.#log("error", event, fields);
  }

  #log(level, event, fields) {
    this.write(JSON.stringify({ time: this.clock().toISOString(), level, event, ...fields }));
  }
}
