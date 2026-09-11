---
name: dev-pm
description: Run, restart, stop, and inspect logs/status of long-running development processes via dev-pm (dev-process-manager). Use when starting/stopping/restarting services, tailing logs of those processes, or checking which services are running. Do not use for one-off scripts (`npm run X` is fine for those) — dev-pm is for processes that stay alive.
---

# dev-pm Skill

`dev-pm` (`dev-process-manager`) supervises long-running dev processes (servers, watchers, codegen, storybook, docker, …). Available scripts and groups are defined in `dev-pm.config.ts` at the repo root — read it to discover what can be started.

## Critical rules

1. **Always invoke through the package manager:** `npm exec -- dev-pm <command>`. Never call `dev-pm` directly. If `pnpm` is the active package manager for the project (e.g. a `pnpm-lock.yaml` is present), use `pnpm exec -- dev-pm <command>` instead.
2. **Never use streaming flags from a tool call — they hang.** `logs` requires `-n` / `--lines <N>`; `status` must not get `--interval`; `start` / `restart` must not get `--follow`.
3. **Services may already be running.** dev-pm runs as a daemon across sessions — check `status` before starting things again. Same applies to build watchers ("the build watcher is running" means dev-pm is supervising a `build:watch` script); if absent, build the affected package manually.
4. **dev-pm owns _all_ long-running tasks — including docker.** If a project uses dev-pm, assume every long-lived process (servers, watchers, codegen, **and** `docker compose up`) is wired into `dev-pm.config.ts`. Don't reach for `docker compose up` / `docker compose down` directly — start/stop the corresponding dev-pm script (commonly named `docker`). Exceptions exist; only treat something as outside scope after confirming it's not in `dev-pm.config.ts`.

## Commands

Script/group names below are placeholders; the authoritative list is `dev-pm.config.ts`.

### `start [patterns...]`

```bash
npm exec -- dev-pm start <script>      # one script
npm exec -- dev-pm start @<group>      # a group
npm exec -- dev-pm start <a> <b>       # multiple patterns
```

- `@`-prefix → group name (from `group: [...]` in the config). Bare → script `name`. Globs (minimatch) work too, e.g. `api-*`.
- Already-running scripts are a no-op — safe to call again. To force a restart, use `restart`.

### `status` / `list`

```bash
npm exec -- dev-pm status              # all scripts
npm exec -- dev-pm status <pattern>    # filter
```

First stop when troubleshooting "is X running?".

**Reading the output:**

- **Status:**
    - `Running` — script is up.
    - `Waiting` — `waitOn` condition unmet (e.g. api waiting for the database, site waiting for the api). Will start when the dependency is ready; if it stays here, the dependency failed — check its logs.
    - `Backoff` — process crashed; dev-pm is sleeping before respawn. Wait grows as `min(1.3 ^ restartCount, 10)` seconds, capped at 10s. Flapping `Backoff` means broken — read logs and fix the cause; restarting won't help.
    - `Stopped` — not running (never started or manually stopped).
- **Restarts:** healthy scripts sit at `0`. Anything `> 0` means dev-pm respawned a crash — pull logs (`logs --lines 300 <name>`).

### `logs` / `log`

```bash
npm exec -- dev-pm logs --lines 200 <script>
npm exec -- dev-pm log -n 500 <pattern>
```

Pick a line count for the question — 100–200 for a quick check, 500+ for startup/error history.

### `restart [patterns...]`

```bash
npm exec -- dev-pm restart <script>
npm exec -- dev-pm restart @<group>
```

Use after rebuilding a package whose consumers cache the old build, or after editing config the running process loaded at startup.

### `stop [patterns...]`

```bash
npm exec -- dev-pm stop <script>
npm exec -- dev-pm stop @<group>
```

Stops the matched scripts; the daemon stays alive.

### `shutdown` / `halt`

```bash
npm exec -- dev-pm shutdown
```

Stops everything and shuts down the daemon. Only when the user explicitly asks to "stop everything" / "kill dev-pm". Don't use as a "reset state" hammer — prefer `restart <pattern>`.

## Discovering scripts and groups

`dev-pm.config.ts` exports a `scripts` array. Each entry has:

- `name` — identifier for start/stop/logs.
- `group` — group names usable with the `@` prefix.
- `script` — underlying shell command (informational; don't run directly).
- `waitOn` — files / TCP ports the script waits for (explains startup ordering).

When the user names a service vaguely ("the api"), grep `dev-pm.config.ts` for the matching `name` rather than guessing.

## Common workflows

- **"Why isn't service X responding?"** → `status` → `logs --lines 200 <name>` → `restart <name>` after fixing the cause.
- **"Edited a package, running service isn't picking it up"** → confirm the package's build watcher is in `status`; if not, build the package or start its watcher; then `restart` the consumer.
- **"Verify service X still boots"** → `start <name>`, poll `logs --lines N` until the ready line or an error appears.
