import { validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { ExternalLinkBlock } from "../externalLink/external-link.block";
import { BlockMigration } from "../migrations/BlockMigration";
import type { BlockMigrationInterface } from "../migrations/types";
import { typeSafeBlockMigrationPipe } from "../migrations/typeSafeBlockMigrationPipe";
import { ImageBlock } from "../transformToBlockSaveIndex/test/blocks/ImageBlock";
import { transformToBlockSaveIndex } from "../transformToBlockSaveIndex/transformToBlockSaveIndex";
import { createRichTextBlock } from "./createRichTextBlock";
import { createTableBlock } from "./createTableBlock";

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

const ImageTableBlock = createTableBlock({ richText: ImageBlock }, "ImageTableTest");

function createTableInputWithLink(targetUrl: string) {
    return TableBlock.blockInputFactory({
        rows: [
            {
                id: "row",
                highlighted: false,
                cellValues: [
                    {
                        columnId: "column",
                        value: {
                            draftContent: {
                                blocks: [
                                    {
                                        key: "block",
                                        text: "Link",
                                        type: "unstyled",
                                        depth: 0,
                                        inlineStyleRanges: [],
                                        entityRanges: [{ offset: 0, length: 4, key: 0 }],
                                        data: {},
                                    },
                                ],
                                entityMap: {
                                    0: { type: "LINK", mutability: "MUTABLE", data: { targetUrl, openInNewWindow: false, noFollow: false } },
                                },
                            },
                        },
                    },
                ],
            },
        ],
    });
}

describe("createTableBlock", () => {
    it("converts the input to data without running the migrations of a cell's block", () => {
        const input = TableBlock.blockInputFactory({
            rows: [{ id: "row", highlighted: false, cellValues: [{ columnId: "column", value: { draftContent: { blocks: [], entityMap: {} } } }] }],
        });

        expect(() => input.transformToBlockData()).not.toThrow();
    });

    it("rejects a cell with an invalid rich text link", async () => {
        expect(await validate(createTableInputWithLink("javascript:alert(1)"))).not.toHaveLength(0);
    });

    it("accepts a cell with a valid rich text link", async () => {
        expect(await validate(createTableInputWithLink("https://www.dextinity.com"))).toHaveLength(0);
    });

    it("indexes the dependencies of a cell's block", () => {
        const data = ImageTableBlock.blockInputFactory({
            columns: [
                { id: "first", size: "standard", highlighted: false },
                { id: "second", size: "standard", highlighted: false },
            ],
            rows: [
                {
                    id: "firstRow",
                    highlighted: false,
                    cellValues: [
                        { columnId: "first", value: { damFileId: "firstFile" } },
                        { columnId: "second", value: { damFileId: "secondFile" } },
                    ],
                },
                { id: "secondRow", highlighted: false, cellValues: [{ columnId: "first", value: { damFileId: "thirdFile" } }] },
            ],
        }).transformToBlockData();

        expect(transformToBlockSaveIndex(ImageTableBlock, data)).toContainEqual({
            blockname: "ImageBlock",
            jsonPath: "root.rows.1.cellValues.0.value",
            visible: true,
            dependencies: [{ targetEntityName: "DamFile", id: "thirdFile" }],
        });
    });

    it("indexes a cell without a column as invisible", () => {
        const data = ImageTableBlock.blockInputFactory({
            columns: [{ id: "column", size: "standard", highlighted: false }],
            rows: [
                {
                    id: "row",
                    highlighted: false,
                    cellValues: [
                        { columnId: "column", value: { damFileId: "firstFile" } },
                        { columnId: "removedColumn", value: { damFileId: "secondFile" } },
                    ],
                },
            ],
        }).transformToBlockData();

        expect(transformToBlockSaveIndex(ImageTableBlock, data)).toContainEqual(
            expect.objectContaining({ jsonPath: "root.rows.0.cellValues.1.value", visible: false }),
        );
    });
});
