---
"@dextinity/agent-features": major
---

Remove the `dev-pm` skill

The skill now ships with `dev-process-manager` itself, so it stays in sync with the tool it documents.

**Breaking changes**

Update `dev-process-manager` to the latest version to keep the skill, then reinstall the agent features:

```sh
npm install --save-dev dev-process-manager@latest
npx @dextinity/cli install-agent-features
```

`install-agent-features` discovers the skill in `node_modules/dev-process-manager/skills/` and symlinks it into `.agents/skills/` and `.claude/skills/` as before.

If you don't update `dev-process-manager`, remove the stale copy so agents don't load an outdated version:

```sh
rm -rf .agents/skills/dev-pm .claude/skills/dev-pm
```
