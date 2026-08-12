# Privacy and security

- Scans are local, bounded, read-only, and atomic.
- Codex opens in immutable SQLite mode; Git commands are read-only.
- No raw prompts, diffs, environment variables, credentials, database URLs, or full session files enter snapshots.
- Common token and credential shapes are redacted from labels and Markdown exports.
- Imported snapshots are schema-checked and sanitized; evidence links accept only HTTP(S).
- `public/local-snapshot.json` is ignored by Git.
- Corrections remain in local browser storage.
- No code path archives threads, mutates repositories, calls production, creates issues, schedules work, sends messages, or activates gates.

The demo loads Google Fonts when online and falls back to system fonts offline; no personal data is sent with that request. Remove the import or self-host fonts for a fully network-silent deployment.

Conflicting and stale evidence is visibly labeled. Low-confidence Codex metadata starts a project but cannot establish completion. Review generated snapshots before importing or sharing them.
