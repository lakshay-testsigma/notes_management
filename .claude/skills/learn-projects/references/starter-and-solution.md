# Starter and solution — layout, guidance levels, TODO markers, self-check

Read this before writing any project file.

## 1. Layout

The example uses the backend default stack (TypeScript, Node.js, vitest). Use the
equivalent files of the chosen stack.

```
mini-01-job-queue/
├── README.md
├── starter/
│   ├── package.json          exact versions, scripts: start, test
│   ├── .gitignore            node_modules, dist, .env
│   ├── .env.example          REDIS_URL=redis://localhost:6379
│   ├── docker-compose.yml    only when a service such as Redis is needed
│   ├── src/
│   │   ├── queue.ts          contains TODO(1), TODO(2)
│   │   ├── worker.ts         contains TODO(3)
│   │   └── main.ts           complete: wiring is not the lesson
│   └── tests/
│       └── queue.test.ts     complete: fails until the TODOs are done
└── solution/
    └── (the same files, with every TODO implemented)
```

Rules:

- `starter/` and `solution/` have the same files and the same tests. The learner
  can then compare any file side by side.
- The solution is small: aim for 80 to 300 lines of source code in two to five
  files. A beginner has to be able to read all of it in ten minutes.
- Code that is not the lesson (argument parsing, wiring, connection setup) is
  complete in the starter. The learner's time goes to the concept.
- Comments in the solution explain why a line exists, in one line. They do not
  repeat what the code says.
- Tests do not need the network. When the project needs a service (Redis,
  Postgres), provide a `docker-compose.yml` and say so under `## Prerequisites`,
  or test the logic against a small in-memory fake and keep one clearly marked
  test for the real service.
- Pin exact versions: `"vitest": "3.2.4"`, `redis==5.2.1`. Never `^`, `~`, `>=`,
  or `latest`.

Commands for common stacks:

| Stack | Install | Test | Run |
|-------|---------|------|-----|
| Node.js / TypeScript | `npm --prefix <dir> install` | `npm --prefix <dir> test` | `npm --prefix <dir> start` |
| Python | `python3 -m venv <dir>/.venv && <dir>/.venv/bin/pip install -r <dir>/requirements.txt` | `<dir>/.venv/bin/python -m pytest <dir>` | `<dir>/.venv/bin/python <dir>/src/main.py` |
| Go | (none) | `go -C <dir> test ./...` | `go -C <dir> run .` |

## 2. Guidance levels

The level decides how much the README tasks and the TODO markers tell the
learner.

| Level | README task | TODO marker in the starter |
|-------|-------------|----------------------------|
| guided | Says what to write, where, and in which small steps. | Full signature is present. The comment lists the steps. |
| less guided | States the goal and the acceptance check. | Signature is present. The comment states only the goal. |
| independent | States a requirement. The learner designs the functions. | A file-level TODO. Function names are not given; the tests define the behavior. |

## 3. TODO markers

Every part the learner writes is marked `TODO(n)`, where `n` is the task number
in the README. The body throws a clear error, so that running the starter early
produces a readable message instead of wrong behavior.

Guided:

```ts
// TODO(2): Read up to `count` new entries for this consumer.
//   1. Call XREADGROUP with the group name, the consumer name, and the id ">".
//   2. Use BLOCK 5000 so the call waits for new entries instead of spinning.
//   3. Return an array of { id, fields }. Return [] when the call times out.
export async function readBatch(client: RedisClient, count: number): Promise<Entry[]> {
  throw new Error("TODO(2): readBatch is not implemented yet");
}
```

Less guided:

```ts
// TODO(2): Return up to `count` entries that were never delivered to this group.
export async function readBatch(client: RedisClient, count: number): Promise<Entry[]> {
  throw new Error("TODO(2): readBatch is not implemented yet");
}
```

Independent (at the top of an otherwise empty file):

```ts
// TODO(1): Implement the consumer in this file.
// The tests in tests/consumer.test.ts describe the required behavior.
// You choose the functions and their names; export what the tests import.
```

Use the comment syntax of the language (`#` in Python, `//` in Go). Use three to
six TODOs per project. Fewer than three is a fill-in-the-blank; more than six no
longer fits in three hours.

## 4. Deriving the starter from the solution

1. Copy `solution/` to `starter/` (without `node_modules`, `.venv`, or build
   output).
2. For each function the learner must write, replace its body with the `throw`
   line and put the `TODO(n)` comment above it.
3. Leave imports, types, wiring, and tests untouched.
4. Install and run the starter's tests. Expected result: the test runner starts,
   and tests fail with the `TODO(n) ... not implemented yet` messages. If
   anything fails for another reason (a missing import, a type error), fix the
   starter.

## 5. Self-check before `unit ... done`

Answer each line with yes. If one is no, fix it first.

- The solution's tests were run in this session and all passed.
- The starter's tests were run in this session and failed only on TODO errors.
- Every `TODO(n)` in the starter has a task `n` in the README, and the reverse.
- The README has all ten headings in the required order.
- Hints appear only under `## Hints`.
- All dependency versions are exact.
- No file contains a secret, a real API key, or an absolute path from this
  machine.
- `starter/.gitignore` and `solution/.gitignore` exist.
- The project needs no account and no paid service.
- The use case paragraph names a real situation, and `## What this proves` names
  one concept from the topic.
