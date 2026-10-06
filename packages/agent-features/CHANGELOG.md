# @comet/agent-features

## 9.5.2

## 9.5.1

### Patch Changes

- dd4d2f2: Fix the package being published without any skills and rules

    The `skills/` and `rules/` folders were symlinked to the folders at the repository root. Since pnpm v11 no longer follows symlinked directories when packing, every release since `@comet/agent-features` v9.4.0 contained nothing but the manifest, so `install-agent-features` found no skills or rules to install. The folders are copied into the package when it's built now.

## 9.5.0

## 9.4.0

## 9.3.0

## 9.2.2

## 9.2.1

## 9.2.0

## 9.1.1

## 9.1.0

## 9.0.1

## 9.0.0

### Minor Changes

- ca5b0fa: Add `@comet/agent-features` package containing skills and rules for AI coding agents

## 9.0.0-beta.6

## 9.0.0-beta.5

### Minor Changes

- ca5b0fa: Add `@comet/agent-features` package containing skills and rules for AI coding agents

## 9.0.0-beta.3
