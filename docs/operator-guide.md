# Codex Ops operator guide

Codex Journey is the human-facing hub for six independent local tools. They share evidence, not authority: an event or export can inform Journey, but it never grants permission to rename a thread, deploy code, clean a worktree, repair a Mac, or activate production.

## Repository map

| Tool | Local repository | Command | Primary role | Mutation boundary |
|---|---|---|---|---|
| Prompt Launchpad | `codex-ops/codex-prompt-launchpad` | `.venv/bin/prompt-launchpad` | Create durable `/goal` workspaces | Writes only its configured workspace; skill installation requires `--yes` |
| Codex Librarian | `codex-ops/codex-librarian` | `.venv/bin/codex-librarian` | Propose concise thread names | Dry-run by default; apply needs dual approval through app-server |
| Traffic Controller | `codex-ops/codex-traffic-controller` | `.venv/bin/codex-traffic` | Explain repository, worktree, and review traffic | Read-only; cleanup manifests are never executable or eligible |
| Production Truth Board | `codex-ops/production-truth-board` | `.venv/bin/truthboard` | Separate code, merge, deploy, activation, and verification | Read-only evidence viewer |
| Mac Concierge | `codex-ops/codex-mac-concierge` | `.venv/bin/mac-concierge` | Diagnose workstation and configured runtimes | Read-only; recovery commands remain inert text |
| Codex Journey | `codex-ops/codex-journey-dashboard` | `npm run dev` | Prioritize and reflect across evidence | Advisory; local corrections only |

All six public GitHub repositories are under `wheelieinvestor`, use `main` as the default branch, and should be cloned as sibling directories under one `codex-ops` folder. The relative paths above are documentation conveniences; scripts that operate on real data should receive explicit physical paths.

## Normal operating flow

1. Start in Prompt Launchpad. Create or refine a durable goal, validate it, and paste the output of `resume` into a fresh Codex chat. Pin the Launchpad chat manually; current app-server support does not expose pin mutation.
2. Run Codex Librarian in dry-run mode to propose names. Review its artifact separately. Applying names is a distinct, explicitly approved operation.
3. Use Traffic Controller during parallel implementation and review. Its board can explain worktrees and duplicate review threads, but its cleanup plan is historical evidence only.
4. Use Production Truth Board for anything described as live. Treat implemented, merged, deployed, active, observed once, and recurring verified as separate gates.
5. Use Mac Concierge to diagnose local readiness and configured runtimes. It may recommend a recovery action but cannot execute one.
6. Import supported evidence into Journey and make prioritization corrections there. Journey is the overview, not the source of production or cleanup authority.

## Safe event pipeline

Create private artifacts outside the repositories:

```bash
OPS_RUN_DIR="$(mktemp -d)"

codex-traffic \
  --root "/absolute/path/to/development" \
  --output "$OPS_RUN_DIR/traffic-event.jsonl" \
  export --format event

mac-concierge \
  --config "/absolute/path/to/mac-concierge.yaml" \
  export --format events > "$OPS_RUN_DIR/mac-events.json"

npm run scan -- \
  --repo-root "/absolute/path/to/development" \
  --event "$OPS_RUN_DIR/traffic-event.jsonl" \
  --output "$OPS_RUN_DIR/journey.json"
```

Mac Concierge currently exports a JSON object containing an `events` array, while Journey's scanner accepts JSONL records. Convert it locally without altering semantics:

```bash
python3 - "$OPS_RUN_DIR/mac-events.json" "$OPS_RUN_DIR/mac-events.jsonl" <<'PY'
import json, pathlib, sys
source = json.loads(pathlib.Path(sys.argv[1]).read_text())
pathlib.Path(sys.argv[2]).write_text("".join(json.dumps(item) + "\n" for item in source["events"]))
PY
```

Then repeat `--event "$OPS_RUN_DIR/mac-events.jsonl"`. Librarian already produces a JSONL audit ledger. Launchpad documents an event shape but does not emit an event stream in version 0.1. Production Truth Board has an event library contract, but its CLI currently exports resolved board JSON or Markdown rather than Ops JSONL. Import its board JSON through an explicit future adapter; do not relabel it as an Ops event.

## Starting the local dashboards

Run each command from its repository after installing its documented dependencies:

```text
Truth Board       http://127.0.0.1:8741
Mac Concierge     http://127.0.0.1:8751
Traffic Controller http://127.0.0.1:8765
Codex Journey     http://127.0.0.1:5173
```

Keep these listeners on loopback. Do not expose them through a tunnel or non-loopback bind without a separate security review and explicit authorization.

## What remains manual

- Pinning the Launchpad chat.
- Approving each Librarian name mutation.
- Connecting a Traffic Controller review graph to a concrete Codex export.
- Configuring truthful Production Truth Board manifests and disabled live adapters.
- Configuring Mac Concierge with exact local paths and expected services.
- Reviewing Journey's initial project grouping and correcting inferred status.
- Any cleanup, deployment, scheduler activation, broker write, message, filing, or external share.

