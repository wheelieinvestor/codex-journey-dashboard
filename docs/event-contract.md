# Codex Ops event contract

Journey accepts newline-delimited records whose `schema` is `codex-ops-event/v1`. It recognizes the common event envelope:

```json
{"schema":"codex-ops-event/v1","event":"scan","timestamp":"2026-08-11T12:00:00Z","project":"Fictional Project","artifact":"local/path"}
```

Required fields are `schema`, `event`, and ISO timestamp. `project` enables grouping; records without it remain countable provenance but do not invent a project. `scan` and `proposal` demonstrate activity. `apply` may support `implemented` when confidence is adequate. `failure` may create a blocker. A consumer must not translate any event directly to deployed, activated, or verified without evidence specific to those states.
