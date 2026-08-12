#!/usr/bin/env python3
"""Create a redacted Journey snapshot using read-only local evidence."""
from __future__ import annotations
import argparse, hashlib, json, os, re, sqlite3, subprocess, tempfile
from datetime import datetime, timezone
from pathlib import Path

SECRET = re.compile(r"(?i)(token|password|secret|api[_-]?key|authorization)\s*[:=]\s*\S+|\b(?:sk|gh[oprsu]|xoxb)[-_][\w-]{8,}|(?:postgres(?:ql)?|redis)://\S+")
def redact(value: str) -> str: return SECRET.sub("[REDACTED]", value)
def slug(value: str) -> str: return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", value.lower()))
def project_id(path: str) -> str:
    return f"{slug(Path(path).name or 'codex')}-{hashlib.sha256(str(Path(path)).encode()).hexdigest()[:8]}"
def git_evidence(root: Path) -> list[dict]:
    result=[]
    for git in sorted(root.glob("**/.git"))[:60]:
        repo=git.parent
        try:
            line=subprocess.run(["git","log","-1","--format=%H%x09%cI%x09%s"],cwd=repo,text=True,capture_output=True,timeout=3,check=True).stdout.strip().split("\t",2)
            if len(line)==3: result.append({"repo":repo.name,"sha":line[0],"at":line[1],"label":redact(line[2])[:100]})
        except (subprocess.SubprocessError,OSError): pass
    return result
def scan(codex_home: Path, repo_root: Path, events: list[Path]) -> dict:
    threads=[]; db=codex_home/"state_5.sqlite"
    if db.exists():
        con=sqlite3.connect(f"file:{db.resolve()}?mode=ro&immutable=1",uri=True)
        try:
            for row in con.execute("SELECT id,cwd,title,name,updated_at,archived FROM threads WHERE archived=0 ORDER BY updated_at DESC LIMIT 400"):
                threads.append({"id":row[0],"cwd":row[1],"label":redact(row[3] or row[2])[:80],"at":datetime.fromtimestamp(row[4],timezone.utc).isoformat()})
        except sqlite3.Error:
            pass
        finally: con.close()
    ops=[]
    for path in events:
        if path.exists():
            for line in path.read_text(errors="replace").splitlines():
                try:
                    item=json.loads(line)
                    if item.get("schema")=="codex-ops-event/v1":
                        name=item.get("event") or item.get("kind"); timestamp=item.get("timestamp") or item.get("occurred_at"); project=item.get("project") or item.get("feature")
                        if name and timestamp and project: ops.append({"event":redact(str(name)),"timestamp":str(timestamp),"project":redact(str(project)),"artifact":redact(str(item.get("artifact") or ""))[:240]})
                except json.JSONDecodeError: continue
    grouped={}
    for t in threads:
        project=str(Path(t["cwd"]).resolve())
        grouped.setdefault(project,[]).append(t)
    projects=[]
    for path,items in sorted(grouped.items(),key=lambda x:x[1][0]["at"],reverse=True)[:24]:
        name=Path(path).name or "Codex"
        projects.append({"id":project_id(path),"name":name.replace("-"," ").title(),"area":"Local work","status":"started","summary":f"{len(items)} recent Codex thread(s); status needs evidence review.","next":"Review the newest thread and repository state","updatedAt":items[0]["at"],"score":{"impact":3,"urgency":2,"unlock":2,"staleness":1,"risk":1,"effort":2},"milestones":[],"evidence":[{"id":hashlib.sha256(items[0]["id"].encode()).hexdigest()[:12],"type":"codex","label":items[0]["label"],"at":items[0]["at"],"confidence":.6}]})
    for item in ops:
        event=item["event"].lower(); status="blocked" if "fail" in event or "block" in event else "deployed" if "deploy" in event else "merged" if "merge" in event else "implemented" if "complete" in event or "apply" in event else "started"
        projects.append({"id":f"{slug(item['project'])}-ops","name":item["project"],"area":"Codex Ops","status":status,"summary":"Imported from a versioned Codex Ops event.","next":"Review event evidence and confirm the next independent gate","updatedAt":item["timestamp"],"score":{"impact":3,"urgency":2,"unlock":2,"staleness":1,"risk":1,"effort":2},"milestones":[],"evidence":[{"id":hashlib.sha256(json.dumps(item,sort_keys=True).encode()).hexdigest()[:12],"type":"ops","label":item["event"],"at":item["timestamp"],"confidence":.8}]})
    return {"schema":"codex-journey/v1","generatedAt":datetime.now(timezone.utc).isoformat(),"projects":projects,"ideas":[],"meta":{"threadCount":len(threads),"git":git_evidence(repo_root),"opsEvents":ops}}
def main():
    p=argparse.ArgumentParser();p.add_argument("--codex-home",type=Path,default=Path(os.getenv("CODEX_HOME",Path.home()/".codex")));p.add_argument("--repo-root",type=Path,default=Path.cwd().parents[1]);p.add_argument("--event",action="append",type=Path,default=[]);p.add_argument("--output",type=Path,default=Path("public/local-snapshot.json"));a=p.parse_args()
    payload=scan(a.codex_home,a.repo_root,a.event);a.output.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp=tempfile.mkstemp(prefix="journey-",dir=a.output.parent,text=True)
    with os.fdopen(fd,"w") as f: json.dump(payload,f,indent=2);f.write("\n")
    os.replace(tmp,a.output);print(f"Wrote {len(payload['projects'])} projects to {a.output} (read-only scan)")
if __name__=="__main__": main()
