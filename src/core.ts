import type { Correction, JourneyData, OpsEvent, Project, Score, Status } from "./models";

const statusOrder: Record<Status, number> = { started: 1, "in progress": 2, waiting: 2, blocked: 2, implemented: 3, merged: 4, deployed: 5, activated: 6, verified: 7, paused: 0, abandoned: 0 };
export function score(input: Score): number {
  return Math.round((input.impact * 3 + input.urgency * 2.5 + input.unlock * 2 + input.staleness - input.risk * 1.5 - input.effort) * 10) / 10;
}
export function scoreExplanation(value: Score): string {
  return `Impact ${value.impact}×3 + urgency ${value.urgency}×2.5 + unlock ${value.unlock}×2 + staleness ${value.staleness} − risk ${value.risk}×1.5 − effort ${value.effort}`;
}
export function rank(projects: Project[]): Project[] {
  return [...projects].filter(p => !["verified", "abandoned"].includes(p.status)).sort((a,b) => score(b.score)-score(a.score) || a.name.localeCompare(b.name));
}
export function applyCorrections(data: JourneyData, corrections: Correction[]): JourneyData {
  return { ...data, projects: data.projects.map(project => {
    const correction = corrections.filter(c => c.projectId === project.id).at(-1);
    return correction ? { ...project, status: correction.status ?? project.status, area: correction.area ?? project.area, summary: correction.note ? `${project.summary} · Your note: ${correction.note}` : project.summary } : project;
  })};
}
export function transitionStatus(current: Status, incoming: Status, confidence: number): Status {
  if (confidence < .7 || incoming === "abandoned") return current;
  return statusOrder[incoming] >= statusOrder[current] ? incoming : current;
}
export function importEvents(events: OpsEvent[], current: JourneyData): JourneyData {
  const projects = [...current.projects];
  for (const event of events) {
    if (event.schema !== "codex-ops-event/v1" || !event.project) continue;
    const id = slug(event.project); const found = projects.find(p => p.id === id);
    const nextStatus: Status = event.event === "apply" ? "implemented" : event.event === "failure" ? "blocked" : "started";
    const evidence = { id: `event-${projects.length}-${event.timestamp}`, type: "ops" as const, label: `${event.event} event`, at: event.timestamp, confidence: .8 };
    if (found) { found.status = transitionStatus(found.status, nextStatus, .8); found.evidence = [...found.evidence, evidence]; }
    else projects.push({ id, name: event.project, area: "Imported", status: nextStatus, summary: "Imported from Codex Ops event stream.", next: "Review imported evidence", updatedAt: event.timestamp, score: {impact:3,urgency:2,unlock:2,staleness:1,risk:1,effort:2}, evidence:[evidence], milestones:[] });
  }
  return { ...current, projects };
}
export function conflicts(project: Project): boolean {
  const labels = project.evidence.map(e => e.label.toLowerCase());
  return labels.some(x => x.includes("deploy")) && labels.some(x => x.includes("disabled"));
}
export function stale(project: Project, now = Date.now()): boolean { return now - Date.parse(project.updatedAt) > 14*864e5; }
export function redact(text: string): string { return text.replace(/\b(?:sk|gh[op]|xoxb)[-_][\w-]{8,}\b/gi,"[REDACTED]").replace(/(token|password|secret|api[_-]?key)\s*[:=]\s*\S+/gi,"$1=[REDACTED]"); }
export function exportMarkdown(data: JourneyData): string {
  const top = rank(data.projects).slice(0,3);
  return redact(`# Codex Journey context\nGenerated: ${data.generatedAt}\n\n## Next priorities\n${top.map((p,i)=>`${i+1}. **${p.name}** — ${p.next} (${p.status}; score ${score(p.score)})`).join("\n")}\n\n## Waiting on me\n${data.projects.filter(p=>p.status==="waiting"||p.gate).map(p=>`- ${p.name}: ${p.blocker ?? p.gate}`).join("\n") || "- None"}\n`);
}
export function slug(value: string): string { return value.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
