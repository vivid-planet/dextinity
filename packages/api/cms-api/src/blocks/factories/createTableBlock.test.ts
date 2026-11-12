import { describe, expect, it } from "vitest";

import { ExternalLinkBlock } from "../externalLink/external-link.block.js";
import { BlockMigration } from "../migrations/BlockMigration.js";
import type { BlockMigrationInterface } from "../migrations/types.js";
import { typeSafeBlockMigrationPipe } from "../migrations/typeSafeBlockMigrationPipe.js";
import { createRichTextBlock } from "./createRichTextBlock.js";
import { createTableBlock } from "./createTableBlock.js";

class FailingMigration extends BlockMigration<(from: object) => object> implements BlockMigrationInterface {
    public readonly toVersion = 1;

    protected migrate(): object {
        throw new Error("The migration ran on new input");
    }
}

const RichTextBlock = createRichTextBlock(
    { link: ExternalLinkBlock },
    { name: "MigratedRichText", migrate: { version: 1, migrations: typeSafeBlockMigrationPipe([FailingMigration]) } },
);

const TableBlock = createTableBlock({ richText: RichTextBlock }, "TableMigrationTest");

describe("createTableBlock", () => {
    it("converts the input to data without running the migrations of a cell's block", () => {
        const input = TableBlock.blockInputFactory({
            rows: [{ id: "row", highlighted: false, cellValues: [{ columnId: "column", value: { draftContent: { blocks: [], entityMap: {} } } }] }],
        });

        expect(() => input.transformToBlockData()).not.toThrow();
    });
});
