import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(rootDir, "dist");
const buildVersion = getBuildVersion();

const copyEntries = [
  "index.html",
  "src",
  "images",
  "fonts",
  "vendor",
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

await replaceBuildVersion(outDir);

function getBuildVersion() {
  try {
    return execSync("git rev-parse --short HEAD", { cwd: rootDir, encoding: "utf8" }).trim();
  } catch {
    return Date.now().toString(36);
  }
}

async function replaceBuildVersion(directory) {
  const entries = await readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      await replaceBuildVersion(entryPath);
      continue;
    }

    if (![".html", ".js", ".css"].includes(path.extname(entry.name))) continue;

    const content = await readFile(entryPath, "utf8");
    if (!content.includes("__BUILD_VERSION__")) continue;

    await writeFile(entryPath, content.replaceAll("__BUILD_VERSION__", buildVersion));
  }
}
