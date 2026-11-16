---
"@dextinity/cms-admin": major
"@dextinity/cms-api": major
---

Remove deprecated `SpaceBlock`

The block has been deprecated since v6.8.0: it offered a single free-form pixel height, which doesn't fit projects that define spacing through a design system.
Use `createSpaceBlock` instead, which builds a block with a project-specific set of spacing options.

**Example**

API

```ts
// Before
import { SpaceBlock } from "@dextinity/cms-api";

// After
import { createSpaceBlock } from "@dextinity/cms-api";

export enum Spacing {
    d100 = "d100",
    d200 = "d200",
}

export const SpaceBlock = createSpaceBlock({ spacing: Spacing });
```

Admin

```tsx
// Before
import { SpaceBlock } from "@dextinity/cms-admin";

// After
import { createSpaceBlock } from "@dextinity/cms-admin";

const options = [
    { value: "d100", label: "Dynamic 100" },
    { value: "d200", label: "Dynamic 200" },
];

export const SpaceBlock = createSpaceBlock<SpaceBlockData["spacing"]>({ defaultValue: options[0].value, options });
```

**Migrating existing data**

The stored `height` has no equivalent in the factory block, so map it to the closest spacing option in a block migration:

```ts
// migrations/1-height-to-spacing.migration.ts
import { BlockMigration, type BlockMigrationInterface } from "@dextinity/cms-api";

const heights: Record<Spacing, number> = { [Spacing.d100]: 50, [Spacing.d200]: 100 };

export class HeightToSpacingMigration extends BlockMigration<(from: { height: number }) => { spacing: Spacing }> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate({ height }: { height: number }) {
        const [spacing] = Object.entries(heights).sort(([, a], [, b]) => Math.abs(a - height) - Math.abs(b - height))[0];

        return { spacing: spacing as Spacing };
    }
}
```

```ts
export const SpaceBlock = createSpaceBlock(
    { spacing: Spacing },
    { name: "Space", migrate: { version: 1, migrations: typeSafeBlockMigrationPipe([HeightToSpacingMigration]) } },
);
```
