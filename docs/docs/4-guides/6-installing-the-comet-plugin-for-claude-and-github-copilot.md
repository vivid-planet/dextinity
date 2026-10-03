---
title: Installing the COMET plugin for Claude and GitHub Copilot
---

# Installing the Comet agentic plugin in Claude and GitHub Copilot

Comet ships an AI agent plugin that bundles its [agent skills](https://agentskills.io/) (e.g. `comet-block`, `comet-mail-react`) into a single installable unit. The same plugin works with [Claude Code](https://docs.claude.com/en/docs/claude-code/overview), the [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli), and [VS Code Copilot](https://code.visualstudio.com/docs/copilot/customization/agent-plugins) (preview) — all three tools discover plugins via `.claude-plugin/plugin.json` and load `SKILL.md` files following the [agent skills specification](https://agentskills.io/specification).

If you use a different agent (JetBrains Copilot, CI environments, …), use [Installing agent skills](./5-installing-agent-skills.md) instead — see [Other agents](#other-agents) below for the matrix.

## Prerequisites

- [Claude Code](https://docs.claude.com/en/docs/claude-code/setup), the [GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/getting-started-with-copilot-cli/installing-copilot-cli), and/or [VS Code](https://code.visualstudio.com/) with the [GitHub Copilot extension](https://marketplace.visualstudio.com/items?itemName=GitHub.copilot) installed and signed in.
- Network access to `github.com` (the plugin is fetched from the public Comet repository).
- For VS Code, the agent plugins feature is in **Preview** and gated by the `chat.plugins.enabled` setting. Your organization may need to enable it.

## Install

### Claude Code

Register the Comet marketplace once per machine:

```text
/plugin marketplace add vivid-planet/comet
```

Then install the `comet` plugin from it:

```text
/plugin install comet@comet-plugin-marketplace
```

Reload Claude Code to activate the plugin:

```text
/reload-plugins
```

### GitHub Copilot CLI

The plugin lives in the `agentic-plugin/` subdirectory of the Comet repository, so install it via the `OWNER/REPO:PATH` syntax:

```sh
copilot plugin install vivid-planet/comet:agentic-plugin
```

Verify it was registered:

```sh
copilot plugin list
```

### VS Code (GitHub Copilot)

Add the Comet marketplace to the `chat.plugins.marketplaces` setting in your user or workspace `settings.json`:

```json
{
    "chat.plugins.marketplaces": ["vivid-planet/comet"]
}
```

Open the **Extensions** view (`Ctrl+Shift+X` / `Cmd+Shift+X`), filter with `@agentPlugins`, find **comet**, and click **Install**. VS Code clones the repository and registers the plugin — no per-project setup is required.

After install, the bundled skills become available to the agent automatically — there is no per-project setup.

## What's included

The plugin currently provides these agent skills:

| Skill              | Use when working with…                              |
| ------------------ | --------------------------------------------------- |
| `comet-block`      | Comet blocks (API, Admin, Site) and block fixtures  |
| `comet-mail-react` | HTML emails built with `@comet/mail-react` and MJML |

New skills are added over time; updating the plugin (see below) pulls them in.

## Updating

**Claude Code** refreshes installed marketplaces on startup. To update manually:

```text
/plugin marketplace update comet-plugin-marketplace
/plugin update comet
/reload-plugins
```

**Copilot CLI:**

```sh
copilot plugin update comet
```

**VS Code:** updates are pulled automatically; trigger a manual refresh from the Extensions view.

## Uninstalling

**Claude Code:**

```text
/plugin uninstall comet
/plugin marketplace remove comet-plugin-marketplace
```

**Copilot CLI:**

```sh
copilot plugin uninstall comet
```

**VS Code:** uninstall from the Extensions view, or remove `vivid-planet/comet` from `chat.plugins.marketplaces` in your settings.

## Local development

The plugin lives in the Comet repository under [`agentic-plugin/`](https://github.com/vivid-planet/comet/tree/main/agentic-plugin):

```
agentic-plugin/
├── .claude-plugin/
│   └── plugin.json     # plugin manifest (loaded by Claude Code, Copilot CLI, and VS Code)
└── skills/
    ├── comet-block/
    │   └── SKILL.md
    └── comet-mail-react/
        └── SKILL.md
```

To test plugin changes against a local checkout without publishing, point the agent at the directory:

```sh
# Claude Code
claude --plugin-dir /path/to/comet/agentic-plugin
```

Changes take effect after restarting the agent (or running `/reload-plugins` in Claude Code).

## Other agents

The plugin install (this guide) works for Claude Code, Copilot CLI, and VS Code Copilot. Other agents read the same `SKILL.md` files but discover them differently:

| Agent                              | How to consume the skills                                                                                                                                                         |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Claude Code**                    | Plugin install (this guide).                                                                                                                                                      |
| **GitHub Copilot CLI**             | Plugin install (this guide).                                                                                                                                                      |
| **VS Code Copilot (agent mode)**   | Plugin install (this guide, Preview).                                                                                                                                             |
| **JetBrains Copilot (agent mode)** | Use [Installing agent skills](./5-installing-agent-skills.md) (preview). Enable via _Settings → GitHub Copilot → Chat → Agent_. Plugin install is not yet supported in JetBrains. |
| **CI / other agents**              | Use [Installing agent skills](./5-installing-agent-skills.md) to symlink/copy the skill folders into `.claude/skills/` and `.agents/skills/` at install time.                     |

JetBrains Copilot only auto-discovers project-level skill paths today; personal/global skills (`~/.claude/skills/`, etc.) are [not yet recognized](https://github.com/microsoft/copilot-intellij-feedback/issues/1517). Marketplace plugin install in JetBrains is an open [feature request](https://github.com/microsoft/copilot-intellij-feedback/issues/1539) — until it lands, the agent-skills flow is the way.
