# Architecture and data model

The Vite/TypeScript client renders versioned `codex-journey/v1` snapshots. Typed models cover projects, milestones, decisions, blockers, approval gates, evidence, suggestions, and corrections. Corrections live under versioned browser local storage and overlay inferred data.

`tools/scan_local.py` is an intentionally separate ingestion boundary. It opens Codex SQLite with `mode=ro&immutable=1`, limits thread metadata, reads only the latest Git commit per repository, accepts versioned Ops events, redacts bounded labels, and atomically replaces an ignored snapshot. It never writes to a source system.

The v1 structured store is the first migration. Future incompatible snapshots must add a new schema version and a pure migration function rather than silently reinterpret fields. Atomic temporary-file replacement prevents partial imports. Every evidence record carries type, timestamp, label, and confidence; origin links are optional.

Production Truth Board exports can be mapped to the same evidence records. GitHub is represented through imported/local evidence today; a future local adapter should remain read-only and cache provenance rather than expose credentials to the browser.
