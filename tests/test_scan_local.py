import importlib.util
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("scan_local", Path(__file__).parents[1] / "tools/scan_local.py")
scan_local = importlib.util.module_from_spec(SPEC)
assert SPEC and SPEC.loader
SPEC.loader.exec_module(scan_local)


class ScannerTests(unittest.TestCase):
    def test_read_only_fixture_and_canonical_event(self):
        with tempfile.TemporaryDirectory() as raw:
            root = Path(raw); home = root / "codex"; home.mkdir(); repo = root / "repos"; repo.mkdir()
            db = sqlite3.connect(home / "state_5.sqlite")
            db.execute("CREATE TABLE threads(id TEXT,cwd TEXT,title TEXT,name TEXT,updated_at INTEGER,archived INTEGER)")
            db.execute("INSERT INTO threads VALUES(?,?,?,?,?,?)", ("thread-secret", str(repo / "same"), "token=hunter2", None, 1700000000, 0)); db.commit(); db.close()
            event = root / "events.jsonl"
            event.write_text(json.dumps({"schema":"codex-ops-event/v1","kind":"deployment.completed","occurred_at":"2026-01-01T00:00:00Z","feature":"Truth Board","payload":{}})+"\n")
            result = scan_local.scan(home, repo, [event])
            encoded = json.dumps(result)
            self.assertNotIn("hunter2", encoded)
            self.assertTrue(any(p["status"] == "deployed" for p in result["projects"]))
            self.assertTrue(any(p["id"].endswith("-ops") for p in result["projects"]))

    def test_same_named_roots_have_distinct_ids(self):
        self.assertNotEqual(scan_local.project_id("/one/app"), scan_local.project_id("/two/app"))


if __name__ == "__main__":
    unittest.main()
