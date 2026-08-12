import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { importEvents } from "../src/core";
import { demo } from "../src/fixtures";
import type { OpsEvent } from "../src/models";

const fixture = (value: OpsEvent) => importEvents([value], structuredClone(demo));

describe("six-tool integration contracts", () => {
  it("accepts the compact Librarian/Traffic dialect", () => {
    const result = fixture({
      schema: "codex-ops-event/v1",
      event: "apply",
      timestamp: "2026-08-11T12:00:00Z",
      project: "Codex Librarian",
      thread_id: "fictional",
    });
    expect(result.projects.some(project => project.id === "codex-librarian")).toBe(true);
  });

  it("accepts the provenance Truth Board/Concierge dialect", () => {
    const result = fixture({
      schema: "codex-ops-event/v1",
      kind: "health.assessed",
      occurred_at: "2026-08-11T12:00:00Z",
      feature: "Development volume",
      payload: { health: "red" },
    });
    expect(result.projects.find(project => project.id === "development-volume")?.status).toBe(
      "blocked",
    );
  });

  it("rejects incomplete legacy events instead of inventing status", () => {
    const result = fixture({
      schema: "codex-ops-event/v1",
      kind: "prompt.rendered",
      project: "Demo",
    });
    expect(result.projects.some(project => project.id === "demo")).toBe(false);
  });

  it("keeps operator commands and repository names synchronized", () => {
    const guide = readFileSync("docs/operator-guide.md", "utf8");
    for (const value of [
      "codex-librarian",
      "codex-prompt-launchpad",
      "production-truth-board",
      "codex-traffic-controller",
      "codex-journey-dashboard",
      "codex-mac-concierge",
    ]) expect(guide).toContain(value);
    for (const command of [
      ".venv/bin/codex-librarian",
      ".venv/bin/prompt-launchpad",
      ".venv/bin/truthboard",
      ".venv/bin/codex-traffic",
      ".venv/bin/mac-concierge",
      "npm run dev",
    ]) expect(guide).toContain(command);
  });
});
