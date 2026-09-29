/**
 * Measures the base memory cost of loading @dextinity/cms-api, i.e. the memory a consumer pays
 * just by `require("@dextinity/cms-api")` before instantiating anything. This is the dominant
 * factor in the API's startup memory (loading dependencies, not DI instantiation).
 *
 * It spawns several isolated worker processes (fresh module cache, forced GC) and reports the
 * MINIMUM heap/RSS delta across them — the minimum is the cleanest signal because transient
 * allocations and GC timing only ever inflate a sample, never deflate it.
 *
 * Usage (from repo root, after building cms-api):
 *   node scripts/measure-cms-api-memory.cjs            # prints JSON {rssBytes, heapBytes, ...}
 *   MEM_SAMPLES=7 node scripts/measure-cms-api-memory.cjs
 *   MEM_PKG_DIR=packages/api/cms-api node scripts/measure-cms-api-memory.cjs
 *
 * Requires the worker to run with --expose-gc; the controller adds that flag automatically.
 */
const { createRequire } = require("module");
const path = require("path");

const pkgDir = path.resolve(process.cwd(), process.env.MEM_PKG_DIR || "packages/api/cms-api");

function runWorker() {
    const req = createRequire(path.join(pkgDir, "noop.js"));
    // Load reflect-metadata first (cms-api's decorators need it) so it isn't counted.
    req("reflect-metadata");
    if (global.gc) {
        global.gc();
        global.gc();
    }
    const before = process.memoryUsage();
    req(path.join(pkgDir, "lib", "index.js"));
    if (global.gc) {
        global.gc();
        global.gc();
    }
    const after = process.memoryUsage();
    process.stdout.write(JSON.stringify({ rss: after.rss - before.rss, heap: after.heapUsed - before.heapUsed }) + "\n");
}

function runController() {
    const { execFileSync } = require("child_process");
    const samples = Number(process.env.MEM_SAMPLES || 5);
    const results = [];
    for (let i = 0; i < samples; i++) {
        const out = execFileSync(process.execPath, ["--expose-gc", __filename], {
            env: { ...process.env, MEM_WORKER: "1" },
            encoding: "utf8",
        });
        results.push(JSON.parse(out.trim().split("\n").pop()));
    }
    const minRss = Math.min(...results.map((r) => r.rss));
    const minHeap = Math.min(...results.map((r) => r.heap));
    process.stdout.write(
        JSON.stringify({
            rssBytes: minRss,
            heapBytes: minHeap,
            rssMB: +(minRss / 1048576).toFixed(1),
            heapMB: +(minHeap / 1048576).toFixed(1),
            samples,
        }) + "\n",
    );
}

if (process.env.MEM_WORKER) {
    runWorker();
} else {
    runController();
}
