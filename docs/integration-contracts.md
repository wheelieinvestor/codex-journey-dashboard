# Cross-repository integration contracts

## `codex-ops-event/v1`

Two compatible envelope dialects exist in version 0.1. Journey accepts both:

| Field | Compact dialect | Provenance dialect |
|---|---|---|
| Event name | `event` | `kind` |
| Time | `timestamp` | `occurred_at` |
| Project grouping | `project` | `feature` |
| Producer | optional | `producer` |
| Details | top-level bounded fields | `payload` |

Every record must contain `schema: "codex-ops-event/v1"`, a nonblank event name, a parseable timestamp, and a nonblank project/feature before Journey creates project evidence. Unknown fields are ignored. Secret-shaped content is redacted. Events are evidence, never commands.

### Producer compatibility

| Producer | Dialect | Transport today | Journey compatibility |
|---|---|---|---|
| Librarian | Compact | Append-only JSONL ledger | Direct with `--event`; records without project remain provenance-only and do not invent projects |
| Launchpad | Legacy compact example missing time | Documentation only | Not directly importable until producer adds a timestamp and emits JSONL |
| Traffic Controller | Compact plus `kind` | One JSON event via `export --format event` | Schema-valid; no project today, so it does not invent a Journey project |
| Production Truth Board | Provenance | Library-generated events, no CLI event export | Shape supported; transport adapter still required |
| Mac Concierge | Provenance | JSON object wrapping an `events` array | Shape supported after local conversion to JSONL |
| Journey | Both | JSONL import into scanner/client normalization | Consumer only in version 0.1 |

Event names do not, by themselves, prove a production lifecycle gate. Journey may map explicit `deploy`, `merge`, `apply`, or failure terminology to a cautious candidate status, but the user must confirm it and Production Truth Board remains authoritative for production distinctions.

## Other integration seams

| From | To | Contract | Current state |
|---|---|---|---|
| Launchpad | Librarian | Suggested name `<TYPE> — <short title>` | Compatible; Librarian may preserve a good explicit name |
| Launchpad | Codex agent | Absolute `goal.md`, context file, and launcher | Compatible; files survive chat compaction |
| Librarian | Codex | `thread/name/set` JSON-RPC | Implemented behind dual approval; experimental app-server compatibility caveat |
| Codex export | Traffic Controller | Thread list or `{ "threads": [...] }`, common snake/camel-case parent fields | Implemented; still needs an explicit export generated outside this suite |
| Traffic Controller | Journey | `codex-ops-event/v1` summary and board JSON | Event import is compatible but project-neutral; richer board adapter is future work |
| Truth Board | Journey | `production-truth-board/v1` resolved feature export | Documented target; direct importer is future work |
| Mac Concierge | Journey | Health events | Event shape compatible; JSON-array-to-JSONL transport conversion needed |

## Contract policy

- Producers must never place raw prompts, diffs, credentials, or environment values in shared events.
- Consumers fail closed on unsupported schemas and must not execute event content.
- A successful build, chat, event, or export cannot be promoted to deployed, activated, or verified without evidence specific to that state.
- Versioned contract changes require fixtures and consumer tests before release.
