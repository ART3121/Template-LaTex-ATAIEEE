import { createWriteStream } from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const ROOT_DIR = process.cwd();
const TEXLIVE_RELEASE = "2020";
const ARCHIVE_BASE_URL = `https://ftp.math.utah.edu/pub/tex/historic/systems/texlive/${TEXLIVE_RELEASE}/tlnet-final/archive`;
const FMT_BASE_URL = "https://raw.githubusercontent.com/SwiftLaTeX/Texlive-Ondemand/master";
const ROOT_PACKAGES = [
  "latex",
  "l3packages",
  "amsmath",
  "amsfonts",
  "graphics",
  "tools",
  "cm",
  "geometry",
  "caption",
  "booktabs",
  "setspace",
  "xcolor",
  "titlesec",
  "enumitem",
  "tcolorbox",
  "pgf",
  "tikzpagenodes",
  "listings",
  "listingsutf8",
  "stringenc",
  "pdfescape",
  "ifoddpage",
  "environ",
  "everyshi",
  "etoolbox",
  "oberdiek",
  "ltxcmds",
  "pdftexcmds",
  "fp",
  "atveryend",
  "trimspaces",
];
const RUNTIME_PREFIXES = [
  "bibtex/",
  "dvips/",
  "fonts/",
  "makeindex/",
  "metafont/",
  "tex/",
  "web2c/",
];
const ARCHIVES_DIR = path.join(ROOT_DIR, "texlive", "cache", TEXLIVE_RELEASE, "archives");
const EXTRACT_DIR = path.join(ROOT_DIR, "texlive", "cache", TEXLIVE_RELEASE, "extract");
const PDFTEX_DIR = path.join(ROOT_DIR, "texlive", "local", "pdftex");
const PDFTEX_FILES_DIR = path.join(PDFTEX_DIR, "files");

function isPackageName(value) {
  return /^[A-Za-z0-9][A-Za-z0-9+_.-]*$/.test(value)
    && !value.startsWith("collection-")
    && !value.startsWith("scheme-")
    && !value.startsWith("setting_")
    && !value.endsWith(".ARCH")
    && value !== "texlive.infra";
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function downloadFile(url, destination) {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Falha ao baixar ${url} (${response.status}).`);
  }

  await ensureDir(path.dirname(destination));
  await pipeline(response.body, createWriteStream(destination));
}

async function downloadArchive(pkgName) {
  const archivePath = path.join(ARCHIVES_DIR, `${pkgName}.tar.xz`);
  try {
    await fs.access(archivePath);
    return archivePath;
  } catch {
    await downloadFile(`${ARCHIVE_BASE_URL}/${pkgName}.tar.xz`, archivePath);
    return archivePath;
  }
}

async function extractArchive(pkgName, archivePath) {
  const pkgExtractDir = path.join(EXTRACT_DIR, pkgName);
  const tlpobjPath = path.join(pkgExtractDir, "tlpkg", "tlpobj", `${pkgName}.tlpobj`);

  try {
    await fs.access(tlpobjPath);
    return { pkgExtractDir, tlpobjPath };
  } catch {
    await fs.rm(pkgExtractDir, { force: true, recursive: true });
    await ensureDir(pkgExtractDir);
    await execFileAsync("tar", ["-xf", archivePath, "-C", pkgExtractDir], {
      cwd: ROOT_DIR,
    });
    return { pkgExtractDir, tlpobjPath };
  }
}

async function collectPackage(pkgName, queue, seen, extractedDirs) {
  if (seen.has(pkgName)) {
    return;
  }

  seen.add(pkgName);
  const archivePath = await downloadArchive(pkgName);
  const { pkgExtractDir, tlpobjPath } = await extractArchive(pkgName, archivePath);
  extractedDirs.push(pkgExtractDir);

  const tlpobj = await fs.readFile(tlpobjPath, "utf8");
  for (const line of tlpobj.split(/\r?\n/)) {
    if (!line.startsWith("depend ")) {
      continue;
    }

    const dependency = line.slice("depend ".length).trim();
    if (isPackageName(dependency) && !seen.has(dependency)) {
      queue.push(dependency);
    }
  }
}

async function walkFiles(rootDir, relativeDir = "") {
  const currentDir = path.join(rootDir, relativeDir);
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryRelativePath = relativeDir
      ? path.posix.join(relativeDir.replaceAll("\\", "/"), entry.name)
      : entry.name;
    const entryAbsolutePath = path.join(rootDir, entryRelativePath);

    if (entry.isDirectory()) {
      files.push(...(await walkFiles(rootDir, entryRelativePath)));
      continue;
    }

    if (entry.isFile()) {
      files.push({
        absolutePath: entryAbsolutePath,
        relativePath: entryRelativePath.replaceAll("\\", "/"),
      });
    }
  }

  return files;
}

async function writePdftexMap(manifest) {
  const mapFiles = (await walkFiles(PDFTEX_FILES_DIR))
    .filter(({ relativePath }) => relativePath.endsWith(".map"))
    .filter(({ relativePath }) => !relativePath.endsWith("pdftex.map"))
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));

  if (!mapFiles.length) {
    return;
  }

  const targetRelativePath = path.posix.join("files", "fonts", "map", "pdftex", "updmap", "pdftex.map");
  const targetAbsolutePath = path.join(PDFTEX_DIR, targetRelativePath);
  const parts = [];

  for (const file of mapFiles) {
    const content = await fs.readFile(file.absolutePath, "utf8");
    parts.push(`% ${file.relativePath.replaceAll("\\", "/")}`);
    parts.push(content.trimEnd());
    parts.push("");
  }

  await ensureDir(path.dirname(targetAbsolutePath));
  await fs.writeFile(targetAbsolutePath, parts.join("\n"), "utf8");
  manifest["pdftex.map"] = targetRelativePath;
}

async function copyRuntimeFiles(extractedDirs) {
  const manifest = {};
  const duplicates = new Map();

  await fs.rm(PDFTEX_FILES_DIR, { force: true, recursive: true });
  await ensureDir(PDFTEX_FILES_DIR);

  for (const extractedDir of extractedDirs) {
    const files = await walkFiles(extractedDir);
    for (const file of files) {
      if (!RUNTIME_PREFIXES.some((prefix) => file.relativePath.startsWith(prefix))) {
        continue;
      }

      const targetPath = path.join(PDFTEX_FILES_DIR, file.relativePath);
      await ensureDir(path.dirname(targetPath));
      await fs.copyFile(file.absolutePath, targetPath);

      const basename = path.basename(file.relativePath);
      if (!manifest[basename]) {
        manifest[basename] = path.posix.join("files", file.relativePath);
      } else if (manifest[basename] !== path.posix.join("files", file.relativePath)) {
        const current = duplicates.get(basename) || new Set([manifest[basename]]);
        current.add(path.posix.join("files", file.relativePath));
        duplicates.set(basename, current);
      }
    }
  }

  await writePdftexMap(manifest);

  const fmtPath = path.join(PDFTEX_DIR, "swiftlatexpdftex.fmt");
  await downloadFile(`${FMT_BASE_URL}/swiftlatexpdftex.fmt`, fmtPath);
  manifest["swiftlatexpdftex.fmt"] = "swiftlatexpdftex.fmt";

  await fs.writeFile(
    path.join(PDFTEX_DIR, "manifest.json"),
    JSON.stringify(
      {
        duplicates: Object.fromEntries(
          [...duplicates.entries()].map(([key, value]) => [key, [...value].sort()]),
        ),
        files: manifest,
      },
      null,
      2,
    ),
    "utf8",
  );

  return {
    fileCount: Object.keys(manifest).length,
    duplicateCount: duplicates.size,
  };
}

async function main() {
  await ensureDir(ARCHIVES_DIR);
  await ensureDir(EXTRACT_DIR);
  await ensureDir(PDFTEX_DIR);

  const queue = [...ROOT_PACKAGES];
  const seen = new Set();
  const extractedDirs = [];

  while (queue.length) {
    const pkgName = queue.shift();
    await collectPackage(pkgName, queue, seen, extractedDirs);
  }

  const summary = await copyRuntimeFiles(extractedDirs);
  console.log(
    JSON.stringify(
      {
        packages: [...seen].sort(),
        ...summary,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
