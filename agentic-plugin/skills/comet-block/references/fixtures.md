# Block Fixture Rules

Detailed rules for creating and maintaining block fixture services that generate realistic seed data for Comet blocks. Load this file when creating a new block, editing an existing block, or managing fixture services.

---

## Overview

Block fixtures are NestJS `@Injectable()` services that generate realistic seed data for development databases using `@faker-js/faker`. Each block fixture service maps 1:1 to an API block and implements a `generateBlockInput()` method that returns a populated block input shape.

---

## When to Create Fixtures

- Create a fixture service whenever a new block is created.
- Fixtures populate development databases with realistic test data so developers and editors can see how content looks without manually entering data.
- Each block fixture service corresponds to exactly one API block.

---

## File Structure and Naming

- **File:** `{block-name}-block-fixture.service.ts` (kebab-case)
- **Class:** `{BlockName}BlockFixtureService`
- **Location:** Discover the existing fixtures directory structure in the project. Fixtures typically live in `api/src/db/fixtures/generators/blocks/{category}/`.
- **Categories** typically mirror block types (e.g., `layout`, `media`, `navigation`, `teaser`, `text-and-content`). Place the new fixture in the category that best matches the block's purpose.

---

## Core Type and Interface

Projects define a shared `BlockFixture` type that every fixture service must satisfy:

```ts
import { type Block, type ExtractBlockInputFactoryProps } from "@comet/cms-api";

export type BlockFixture = {
    generateBlockInput: () => Promise<ExtractBlockInputFactoryProps<Block>>;
};
```

Every fixture service must implement `generateBlockInput()` returning `Promise<ExtractBlockInputFactoryProps<typeof TheBlock>>`. The service is decorated with `@Injectable()` and composes child fixture services via constructor injection.

---

## Fixture Patterns by Block Type

### 1. Composite Block Fixture

For blocks created with `createBlock()`. Inject child fixture services via the constructor, generate each field with faker, and delegate child blocks to their fixture services.

```ts
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { DamImageBlock, type ExtractBlockInputFactoryProps } from "@comet/cms-api";
import { MyItemBlock } from "@src/documents/pages/blocks/my-item.block";
import { type BlockFixture } from "../block-fixture.type";
import { DamImageBlockFixtureService } from "../media/dam-image-block-fixture.service";
import { RichTextBlockFixtureService } from "../text-and-content/rich-text-block-fixture.service";

// Import the enum directly from the block file
import { Variant } from "@src/documents/pages/blocks/my-item.block";

@Injectable()
export class MyItemBlockFixtureService implements BlockFixture {
    constructor(
        private readonly damImageBlockFixtureService: DamImageBlockFixtureService,
        private readonly richTextBlockFixtureService: RichTextBlockFixtureService,
    ) {}

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof MyItemBlock>> {
        return {
            title: faker.lorem.words({ min: 3, max: 9 }),
            variant: faker.helpers.arrayElement(Object.values(Variant)),
            image: await this.damImageBlockFixtureService.generateBlockInput(),
            description: await this.richTextBlockFixtureService.generateBlockInput(),
        };
    }
}
```

### 2. List Block Fixture

For blocks created with `createListBlock()`. Accept optional `min`/`max` parameters to control the number of generated items. Each item has a `key`, `visible` flag, and `props` delegated to the item fixture service.

```ts
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { type ExtractBlockInputFactoryProps } from "@comet/cms-api";
import { MyListBlock } from "@src/documents/pages/blocks/my-list.block";
import { type BlockFixture } from "../block-fixture.type";
import { MyItemBlockFixtureService } from "./my-item-block-fixture.service";

@Injectable()
export class MyListBlockFixtureService implements BlockFixture {
    constructor(private readonly myItemBlockFixtureService: MyItemBlockFixtureService) {}

    async generateBlockInput(settings: { min?: number; max?: number } = {}): Promise<ExtractBlockInputFactoryProps<typeof MyListBlock>> {
        const { min = 2, max = 6 } = settings;
        const itemCount = faker.number.int({ min, max });

        const blocks = [];
        for (let i = 0; i < itemCount; i++) {
            blocks.push({
                key: faker.string.uuid(),
                visible: true,
                props: await this.myItemBlockFixtureService.generateBlockInput(),
            });
        }

        return { blocks };
    }
}
```

### 3. Blocks Block Fixture

For blocks created with `createBlocksBlock()`. Define a `Record<string, BlockFixture>` mapping each supported block type key to its fixture service. Iterate over all types and generate entries.

```ts
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { type ExtractBlockInputFactoryProps } from "@comet/cms-api";
import { MyContentBlock } from "@src/documents/pages/blocks/my-content.block";
import { type BlockFixture } from "../block-fixture.type";
import { RichTextBlockFixtureService } from "../text-and-content/rich-text-block-fixture.service";
import { HeadingBlockFixtureService } from "../text-and-content/heading-block-fixture.service";
import { SpaceBlockFixtureService } from "../layout/space-block-fixture.service";

@Injectable()
export class MyContentBlockFixtureService implements BlockFixture {
    private readonly blockFixtures: Record<string, BlockFixture>;

    constructor(
        private readonly richTextBlockFixtureService: RichTextBlockFixtureService,
        private readonly headingBlockFixtureService: HeadingBlockFixtureService,
        private readonly spaceBlockFixtureService: SpaceBlockFixtureService,
    ) {
        this.blockFixtures = {
            richText: this.richTextBlockFixtureService,
            heading: this.headingBlockFixtureService,
            space: this.spaceBlockFixtureService,
        };
    }

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof MyContentBlock>> {
        const blocks = [];

        for (const [type, fixtureService] of Object.entries(this.blockFixtures)) {
            blocks.push({
                key: faker.string.uuid(),
                visible: true,
                type,
                props: await fixtureService.generateBlockInput(),
            });
        }

        return { blocks };
    }
}
```

### 4. One-Of / Union Block Fixture

For blocks created with `createOneOfBlock()` or `createLinkBlock()`. Generate all possible types in the `attachedBlocks` array and randomly select one as `activeType`.

```ts
import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { type ExtractBlockInputFactoryProps } from "@comet/cms-api";
import { MyOneOfBlock } from "@src/documents/pages/blocks/my-one-of.block";
import { type BlockFixture } from "../block-fixture.type";
import { DamImageBlockFixtureService } from "../media/dam-image-block-fixture.service";
import { DamVideoBlockFixtureService } from "../media/dam-video-block-fixture.service";

@Injectable()
export class MyOneOfBlockFixtureService implements BlockFixture {
    private readonly blockFixtures: Record<string, BlockFixture>;

    constructor(
        private readonly damImageBlockFixtureService: DamImageBlockFixtureService,
        private readonly damVideoBlockFixtureService: DamVideoBlockFixtureService,
    ) {
        this.blockFixtures = {
            image: this.damImageBlockFixtureService,
            damVideo: this.damVideoBlockFixtureService,
        };
    }

    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof MyOneOfBlock>> {
        const attachedBlocks = [];

        for (const [type, fixtureService] of Object.entries(this.blockFixtures)) {
            attachedBlocks.push({
                type,
                props: await fixtureService.generateBlockInput(),
            });
        }

        const activeType = faker.helpers.arrayElement(Object.keys(this.blockFixtures));

        return { attachedBlocks, activeType };
    }
}
```

### 5. Simple / Empty Block Fixture

Blocks with no data fields return an empty object.

```ts
import { Injectable } from "@nestjs/common";
import { type ExtractBlockInputFactoryProps } from "@comet/cms-api";
import { MySpacerBlock } from "@src/documents/pages/blocks/my-spacer.block";
import { type BlockFixture } from "../block-fixture.type";

@Injectable()
export class MySpacerBlockFixtureService implements BlockFixture {
    async generateBlockInput(): Promise<ExtractBlockInputFactoryProps<typeof MySpacerBlock>> {
        return {};
    }
}
```

---

## Faker.js Guidelines for Realistic Values

Match the faker method to the field's semantic purpose. A headline should be a few words, not a paragraph. A link label should be 1–3 words. List item counts should be small.

| Field Semantic              | Faker Method                                        | Notes                                                           |
| --------------------------- | --------------------------------------------------- | --------------------------------------------------------------- |
| Title / headline            | `faker.lorem.words({ min: 3, max: 9 })`             | Short phrase, not a sentence                                    |
| Eyebrow / label             | `faker.lorem.words({ min: 2, max: 5 })`             | Compact label text                                              |
| Link text / button text     | `faker.lorem.words({ min: 1, max: 3 })`             | Very short                                                      |
| Sentence (fact, caption)    | `faker.lorem.sentence()`                            | Single sentence                                                 |
| Paragraph / body text       | `faker.lorem.paragraph()`                           | Inside RichText Draft content blocks                            |
| Anchor name                 | `faker.word.words(3)`                               | Short identifier                                                |
| Enum                        | `faker.helpers.arrayElement(Object.values(MyEnum))` | Import the enum from the block file                             |
| Boolean                     | `faker.datatype.boolean()`                          |                                                                 |
| Number (percentage/overlay) | `faker.number.int({ min: 50, max: 90 })`            | Constrain to a realistic range                                  |
| Number (list item count)    | `faker.number.int({ min: 2, max: 6 })`              | Small, realistic set                                            |
| Block key (UUID)            | `faker.string.uuid()`                               | Used for `key` in list/blocks entries                           |
| URL                         | `faker.internet.url()`                              | Or use `faker.helpers.arrayElement([...])` with predefined URLs |
| SEO title                   | `faker.word.words(2)`                               |                                                                 |
| SEO meta description        | `faker.word.words(20)`                              |                                                                 |

---

## RichText (Draft.js) Fixture Pattern

RichText blocks use Draft.js structure. Generate the content inline using `draftContent` with `blocks` and `entityMap`.

> **Important:** The `type` value in each Draft.js block must match a block type actually defined in the project's `RichTextBlock`. **Always check the project's Admin-side `RichTextBlock` configuration** (its `blocktypeMap` and `standardBlockType`) before writing fixture data. The examples below use `"paragraph-standard"` and `"header-one"` as illustrations — these types may not exist in the current project. Even `"unstyled"` (the Draft.js default) may be absent if the project overrides `standardBlockType` with a custom type. Use whichever type the project actually defines.

### Paragraph Content

```ts
// "paragraph-standard" is an example — use the actual paragraph block type from the project's RichTextBlock definition
const generateParagraphRichText = () => ({
    draftContent: {
        blocks: [
            {
                key: faker.string.uuid(),
                text: faker.lorem.paragraph(),
                type: "paragraph-standard",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
        ],
        entityMap: {},
    },
});
```

### Heading Content

```ts
// "header-one" is an example — verify that heading block types exist in the project's RichTextBlock definition
const generateHeadingRichText = () => ({
    draftContent: {
        blocks: [
            {
                key: faker.string.uuid(),
                text: faker.lorem.words({ min: 3, max: 9 }),
                type: "header-one",
                depth: 0,
                inlineStyleRanges: [],
                entityRanges: [],
                data: {},
            },
        ],
        entityMap: {},
    },
});
```

### Notes

- **Always check the project's `RichTextBlock` configuration** to determine which block types are valid. The `type` field must exactly match a type that the block defines — either through `blocktypeMap` or as a standard Draft.js type that is explicitly supported.
- `"paragraph-standard"` and `"paragraph-small"` are project-defined custom types and will not exist in every project.
- `"header-one"` through `"header-six"` are standard Draft.js types but only valid if the project's RichTextBlock actually includes them in `supports`.
- `"unstyled"` is the Draft.js default but may be suppressed if the project sets a custom `standardBlockType` — in that case it is not a valid choice for fixture data either.
- Always include `key`, `depth: 0`, `inlineStyleRanges: []`, `entityRanges: []`, and `data: {}`.
- Wrap the content in `{ draftContent: { blocks: [...], entityMap: {} } }`.

---

## Registration and Parent Fixture Wiring

After creating a fixture service, perform these steps:

### 1. Register in the fixtures module

Add the new fixture service as a provider in the project's `fixtures.module.ts`:

```ts
// api/src/db/fixtures/fixtures.module.ts
import { MyItemBlockFixtureService } from "./generators/blocks/teaser/my-item-block-fixture.service";

@Module({
    providers: [
        // ... existing providers
        MyItemBlockFixtureService,
    ],
})
export class FixturesModule {}
```

### 2. Wire into the parent block's fixture

The new block is always registered in a parent block (typically a blocks-block like a page content block). Find the parent block's fixture service and add the new fixture there:

1. Inject the new fixture service into the parent fixture's constructor.
2. Add a new entry in the parent fixture's `blockFixtures` record, mapping the block's type key (the same camelCase key used in `supportedBlocks`) to the new fixture service.

```ts
// In the parent blocks-block fixture service
constructor(
    // ... existing injections
    private readonly myItemBlockFixtureService: MyItemBlockFixtureService,
) {
    this.blockFixtures = {
        // ... existing entries
        myItem: this.myItemBlockFixtureService,
    };
}
```

### 3. If the parent has no fixture

Check whether the parent blocks-block already has a fixture service. If it does not, ask the user whether a fixture service should be created for the parent block as well, or whether fixtures should be skipped entirely for this block.

### 4. Composite block parent

If the new block is a child of another composite block (not a blocks-block), inject the new fixture into that parent fixture's constructor and call its `generateBlockInput()` in the parent's own `generateBlockInput()` method.

---

## Editing Existing Block Fixtures

Whenever an existing block is modified, its fixture must be updated to match.

| Change Type             | Fixture Action                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Field added**         | Add the new field to `generateBlockInput()` with an appropriate faker call.                                                                                   |
| **Field removed**       | Remove the field from `generateBlockInput()`.                                                                                                                 |
| **Field type changed**  | Update the faker call or child fixture delegation to match the new type.                                                                                      |
| **Enum values changed** | Update the enum import. No other fixture change is usually needed since `faker.helpers.arrayElement(Object.values(...))` picks from all values automatically. |
| **Block renamed**       | Rename the fixture service class, file, and all references (imports, constructor injections, module registration, parent fixture wiring).                     |

---

## Deleting a Block's Fixtures

When a block is deleted:

1. Delete the fixture service file.
2. Remove it from `fixtures.module.ts` providers.
3. Remove it from any parent fixture service (constructor injection, `blockFixtures` record entry, and import).
4. If the deleted block had child fixture services that are no longer used by any other fixture, delete those too.

---

## Conditional Logic Patterns

Some blocks have fields that depend on other field values. Reflect this in fixtures.

**Boolean-dependent fields:**

```ts
const autoplay = faker.datatype.boolean();

return {
    autoplay,
    showControls: !autoplay,
    // ...
};
```

**Enum-dependent optional fields:**

```ts
const variant = faker.helpers.arrayElement(Object.values(Variant));

return {
    variant,
    subtitle: variant === "expanded" ? faker.lorem.words({ min: 3, max: 9 }) : undefined,
    // ...
};
```

**Optional settings parameter for controlling generation behavior:**

```ts
async generateBlockInput(
    settings: { min?: number; max?: number; includeOptional?: boolean } = {},
): Promise<ExtractBlockInputFactoryProps<typeof MyBlock>> {
    const { min = 2, max = 6, includeOptional = true } = settings;
    // ...
}
```

---

## Cross-references

| Topic                                                | File                               |
| ---------------------------------------------------- | ---------------------------------- |
| Block creation workflow and registration             | [SKILL.md](../SKILL.md)            |
| API block patterns, decorators, field rules          | [api-patterns.md](api-patterns.md) |
| Enum/select patterns and enum imports                | [select.md](select.md)             |
| RichText block structure (relevant to Draft.js data) | [rich-text.md](rich-text.md)       |
| Image block types and selection                      | [image.md](image.md)               |
