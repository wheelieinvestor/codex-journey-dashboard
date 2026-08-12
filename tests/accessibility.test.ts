import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
describe("accessible shell",()=>{it("has a skip link, semantic main, labels, focus-safe controls, and responsive rules",()=>{const html=readFileSync("index.html","utf8");const app=readFileSync("src/main.ts","utf8");const css=readFileSync("src/style.css","utf8");expect(html).toContain('class="skip"');expect(app).toContain('<main id="main">');expect(app).toContain('aria-label="Primary"');expect(css).toContain("@media(max-width:700px)");expect(css).toContain("prefers-reduced-motion")})});
