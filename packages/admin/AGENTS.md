# Admin Packages

This directory contains all admin-related packages for the Dextinity framework.

## Packages

| Package                     | Description                                                              |
| --------------------------- | ------------------------------------------------------------------------ |
| `@dextinity/admin`              | Core admin components and framework (React, MUI, Apollo, Final Form)     |
| `@dextinity/admin-babel-preset` | Shared Babel preset for transpiling admin packages                       |
| `@dextinity/admin-color-picker` | Color picker form field component                                        |
| `@dextinity/admin-date-time`    | Date/time picker form field components                                   |
| `@dextinity/admin-icons`        | SVG icon library as React components                                     |
| `@dextinity/admin-rte`          | Rich text editor component (Draft.js-based)                              |
| `@dextinity/admin-generator`    | CLI tool that generates admin CRUD UIs from GraphQL schemas              |
| `@dextinity/cms-admin`          | Admin UI for CMS features (pages, blocks, content management)            |
| `@dextinity/brevo-admin`        | Admin UI for Brevo email/marketing integration                           |

## Storybook

There are two Storybook instances relevant to admin packages:

### `@dextinity/admin` Storybook (package-level)

Located in `admin/.storybook/`. Contains stories specific to the core admin package.

- Stories are located in `admin/src/**/__stories__/*.stories.tsx` and `admin/src/**/*.mdx`
- Runs on port **26646**

```bash
# From packages/admin/admin/
pnpm run storybook

# Build static storybook
pnpm run build-storybook
```

### Root Storybook (repo-level)

Located in `storybook/` at the repo root. Aggregates stories across multiple Dextinity packages and references the `@dextinity/admin` Storybook.

- Runs on port **26638**

```bash
# From storybook/
pnpm run storybook
```

## Tests

All packages use **Vitest** as the test framework.

### Which packages have tests

| Package              | Test Environment | Setup File       |
| -------------------- | ---------------- | ---------------- |
| `@dextinity/admin`       | jsdom            | vitest.setup.ts  |
| `@dextinity/admin-rte`   | jsdom            | —                |
| `@dextinity/admin-generator` | node (default) | —            |
| `@dextinity/cms-admin`   | jsdom            | vitest.setup.ts  |

The remaining packages (`admin-babel-preset`, `admin-color-picker`, `admin-date-time`, `admin-icons`, `brevo-admin`) do not have tests.

### Running tests

```bash
# Run tests for a single package (from package directory)
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests from the repo root
pnpm --filter @dextinity/admin run test
pnpm --filter @dextinity/admin-rte run test
pnpm --filter @dextinity/admin-generator run test
pnpm --filter @dextinity/cms-admin run test

# Update snapshots (admin-generator only)
cd admin-generator && pnpm run test:updateSnapshot
```

### Test conventions

- Test files are co-located with source code, typically in the same directory or a `__tests__/` subdirectory
- File naming: `*.test.ts(x)` or `*.spec.ts(x)`
- Packages testing React components (`admin`, `admin-rte`, `cms-admin`) use the `jsdom` environment and `@testing-library/react`
- `admin-generator` tests use snapshot testing to verify generated output
