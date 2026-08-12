# Verification

Verified on 2026-08-11:

| Check | Command | Result |
|---|---|---|
| Dependencies | `npm install` | 0 vulnerabilities |
| Lint | `npm run lint` | passed |
| Types | `npm run typecheck` | passed, strict TypeScript |
| Unit and contract tests | `npm test` | 8 passed |
| Scanner fixture tests | `npm run test:scanner` | 2 passed; immutable DB fixture, canonical event, redaction, grouping IDs |
| Production build | `npm run build` | passed; 15.24 kB JS and 10.07 kB CSS before gzip |
| Browser flow | `npm run test:e2e` | passed in Chromium: Today, correction persistence, Journey navigation, mobile menu |
| Real onboarding scan | `python3 tools/scan_local.py --repo-root "/Volumes/Development Recovery/Development" --output /tmp/codex-journey-release-review.json` | passed; 400 bounded Codex records, 37 Git repos, 24 uniquely grouped projects; no source writes |
| Visual evidence | `node tools/screenshot.mjs` | desktop and 390 px mobile screenshots generated and inspected |

Screenshots: [desktop](dashboard.png) and [mobile](dashboard-mobile.png). The live GitHub CI URL and commit SHA are added to the release handoff. The generated real snapshot stays in `/tmp` and is not committed because its provenance is private.

GitHub CI passed all required checks on the verified release lineage: <https://github.com/wheelieinvestor/codex-journey-dashboard/actions/runs/31555532872>.
