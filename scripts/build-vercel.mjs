import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(rootDir, "dist");

const copyEntries = [
  "index.html",
  "src",
  "images",
  "fonts",
  "config",
  "downloads",
  ".nojekyll",
  "baike-brand-vi.pdf"
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const entry of copyEntries) {
  await cp(path.join(rootDir, entry), path.join(outDir, entry), {
    recursive: true,
    force: true
  });
}

await mkdir(path.join(outDir, "api"), { recursive: true });
await cp(
  path.join(rootDir, "api", "baike-home-snapshot.json"),
  path.join(outDir, "api", "baike-home-snapshot.json"),
  { force: true }
);
