# Codex Ops event contract

Journey accepts newline-delimited records whose `schema` is `codex-ops-event/v1`. The canonical envelope is:

```json
{"schema":"codex-ops-event/v1","kind":"deployment.completed","occurred_at":"2026-08-11T12:00:00Z","feature":"Fictional Project","producer":"production-truth-board","payload":{}}
```

For compatibility, the legacy aliases `event`, `timestamp`, and `project` are also accepted. The scanner converts valid events into visible project evidence. Failure/block signals create blockers, while explicit merge/deploy event kinds can establish those matching states. No generic activity event establishes deployed, activated, or verified.
