#!/usr/bin/env node
// Assigns unique ports so multiple instances of this project can run in parallel.
// Prefers the base ports (no offset) and only falls back to an offset when those are taken.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";

const ENV_FILE = ".env";
const ENV_LOCAL_FILE = ".env.local";
const OFFSET_STEP = 100;
const MAX_OFFSET = 900;

function fail(message: string): never {
    console.error(`Error: ${message}`);
    process.exit(1);
}

function readPortEntries(): { name: string; basePort: number }[] {
    if (!existsSync(ENV_FILE)) {
        fail(`No ${ENV_FILE} file found in ${process.cwd()}`);
    }

    return readFileSync(ENV_FILE, "utf8")
        .split("\n")
        .map((line) => /^([A-Z_]+_PORT)=(\d+)$/.exec(line.trim()))
        .filter((match) => match !== null)
        .map((match) => ({ name: match[1], basePort: Number(match[2]) }));
}

// Node sets SO_REUSEADDR, so a wildcard bind coexists with specific-address binds (and vice versa).
// Probe all three addresses to also catch localhost-only listeners like Vite's dev server.
async function portIsFree(port: number): Promise<boolean> {
    for (const host of ["0.0.0.0", "127.0.0.1", "::1"]) {
        const free = await new Promise<boolean>((resolve) => {
            const server = createServer();
            server.once("error", (error: NodeJS.ErrnoException) => resolve(error.code !== "EADDRINUSE"));
            server.once("listening", () => server.close(() => resolve(true)));
            server.listen(port, host);
        });
        if (!free) return false;
    }
    return true;
}

async function findFreeOffset(entries: { name: string; basePort: number }[]): Promise<number> {
    for (let offset = 0; offset <= MAX_OFFSET; offset += OFFSET_STEP) {
        let conflict: { name: string; port: number } | undefined;

        for (const { name, basePort } of entries) {
            const port = basePort + offset;
            if (!(await portIsFree(port))) {
                conflict = { name, port };
                break;
            }
        }

        if (!conflict) return offset;

        console.error(`Offset +${offset} has a port conflict (${conflict.name}=${conflict.port} in use), trying next...`);
    }

    fail(`Could not find a free port offset (tried 0-${MAX_OFFSET})`);
}

function writeEnvLocal(entries: { name: string; basePort: number }[], offset: number): void {
    const existingLines = existsSync(ENV_LOCAL_FILE) ? readFileSync(ENV_LOCAL_FILE, "utf8").split("\n") : [];

    // Drop any existing port assignments from .env.local to avoid duplicates/stale offsets
    const names = new Set(entries.map((entry) => entry.name));
    const keptLines = existingLines.filter((line) => !names.has(line.split("=")[0].trim()));

    while (keptLines.length > 0 && keptLines[keptLines.length - 1] === "") {
        keptLines.pop();
    }

    // Offset 0 means the base ports are free, so no overrides are written and the .env defaults apply
    const portLines = offset === 0 ? [] : entries.map(({ name, basePort }) => `${name}=${basePort + offset}`);
    const lines = [...keptLines, ...portLines];

    if (lines.length === 0 && existingLines.length === 0) return;

    writeFileSync(ENV_LOCAL_FILE, lines.length > 0 ? `${lines.join("\n")}\n` : "");
}

async function main(): Promise<void> {
    const entries = readPortEntries();
    if (entries.length === 0) {
        fail(`No *_PORT entries found in ${ENV_FILE}`);
    }

    const offset = await findFreeOffset(entries);
    writeEnvLocal(entries, offset);

    if (offset === 0) {
        console.error(`All base ports are free, using no offset (${ENV_FILE} defaults apply)`);
    } else {
        console.error(`Ports offset by +${offset} written to ${ENV_LOCAL_FILE}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
