import type { ContextId, ModuleRef } from "@nestjs/core";
import { IsString, validate } from "class-validator";
import { describe, expect, it } from "vitest";

import { BlockData, type BlockIndexData, BlockInput, blockInputToData, createBlock, transformToBlockSave } from "../block.js";
import { transformToPlain } from "../blocks-transformer.js";
import { BlockField } from "../decorators/field.js";
import { ExternalLinkBlock } from "../externalLink/external-link.block.js";
import { BlockMigration } from "../migrations/BlockMigration.js";
import type { BlockMigrationInterface } from "../migrations/types.js";
import { typeSafeBlockMigrationPipe } from "../migrations/typeSafeBlockMigrationPipe.js";
import { ImageBlock } from "../transformToBlockSaveIndex/test/blocks/ImageBlock.js";
import { transformToBlockSaveIndex } from "../transformToBlockSaveIndex/transformToBlockSaveIndex.js";
import { createRichTextBlock } from "./createRichTextBlock.js";
import { createTableBlock } from "./createTableBlock.js";
import { createTableSettings } from "./createTableSettings.js";

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

class PageReferenceBlockData extends BlockData {
    @BlockField()
    pageId: string;

    indexData(): BlockIndexData {
        return { dependencies: [{ targetEntityName: "Page", id: this.pageId }] };
    }
}

class PageReferenceBlockInput extends BlockInput {
    @BlockField()
    @IsString()
    pageId: string;

    transformToBlockData(): PageReferenceBlockData {
        return blockInputToData(PageReferenceBlockData, this);
    }
}

const PageReferenceBlock = createBlock(PageReferenceBlockData, PageReferenceBlockInput, "TablePageReference");

const ImageTableBlock = createTableBlock({ richText: ImageBlock }, "ImageTableTest");

const CellBlocksTableBlock = createTableBlock({ cellBlocks: { richText: RichTextBlock, pageReference: PageReferenceBlock } }, "CellBlocksTableTest");

const SettingsTableBlock = createTableBlock(
    {
        richText: RichTextBlock,
        rowSettings: createTableSettings({ bold: { type: "checkbox", defaultValue: false } }),
        columnSettings: createTableSettings({
            background: { type: "select", options: ["none", "grey"], defaultValue: "none" },
            badges: { type: "multiSelect", options: ["new", "sale"], defaultValue: [] },
        }),
    },
    "SettingsTableTest",
);

function createRichTextInputWithLink(targetUrl: string) {
    return {
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
    };
}

function createTableInputWithLink(targetUrl: string) {
    return TableBlock.blockInputFactory({
        rows: [{ id: "row", highlighted: false, cellValues: [{ columnId: "column", value: createRichTextInputWithLink(targetUrl) }] }],
    });
}

function createCellBlocksTableInput(cellValues: Array<{ attachedBlocks: Array<{ type: string; props: unknown }>; activeType: string }>) {
    return CellBlocksTableBlock.blockInputFactory({
        columns: cellValues.map((_, index) => ({ id: `column${index}`, size: "standard", highlighted: false })),
        rows: [{ id: "row", highlighted: false, cellValues: cellValues.map((value, index) => ({ columnId: `column${index}`, value })) }],
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

    describe("with cellBlocks", () => {
        const pageReferenceCell = { attachedBlocks: [{ type: "pageReference", props: { pageId: "page" } }], activeType: "pageReference" };

        it("converts the input to data without running the migrations of a cell's blocks", () => {
            const input = createCellBlocksTableInput([
                {
                    attachedBlocks: [{ type: "richText", props: { draftContent: { blocks: [], entityMap: {} } } }],
                    activeType: "richText",
                },
            ]);

            expect(() => input.transformToBlockData()).not.toThrow();
        });

        it("rejects a cell with an invalid block of an inactive type", async () => {
            const input = createCellBlocksTableInput([
                {
                    attachedBlocks: [
                        { type: "richText", props: createRichTextInputWithLink("javascript:alert(1)") },
                        { type: "pageReference", props: { pageId: "page" } },
                    ],
                    activeType: "pageReference",
                },
            ]);

            expect(await validate(input)).not.toHaveLength(0);
        });

        it("accepts a cell with valid blocks", async () => {
            const input = createCellBlocksTableInput([
                {
                    attachedBlocks: [
                        { type: "richText", props: createRichTextInputWithLink("https://www.dextinity.com") },
                        { type: "pageReference", props: { pageId: "page" } },
                    ],
                    activeType: "pageReference",
                },
            ]);

            expect(await validate(input)).toHaveLength(0);
        });

        it("rejects a cell without a type", async () => {
            const input = createCellBlocksTableInput([{ attachedBlocks: [], activeType: "pageReference" }]);

            expect(await validate(input)).not.toHaveLength(0);
        });

        it("indexes the dependencies of a cell's blocks, with only the active block as visible", () => {
            const data = createCellBlocksTableInput([
                pageReferenceCell,
                {
                    attachedBlocks: [
                        { type: "pageReference", props: { pageId: "inactivePage" } },
                        { type: "richText", props: { draftContent: { blocks: [], entityMap: {} } } },
                    ],
                    activeType: "richText",
                },
            ]).transformToBlockData();

            const index = transformToBlockSaveIndex(CellBlocksTableBlock, data);

            expect(index).toContainEqual({ blockname: "CellBlocksTableTestCell", jsonPath: "root.rows.0.cellValues.0.value", visible: true });
            expect(index).toContainEqual({
                blockname: "TablePageReference",
                jsonPath: "root.rows.0.cellValues.0.value.attachedBlocks.0.props",
                visible: true,
                dependencies: [{ targetEntityName: "Page", id: "page" }],
            });
            expect(index).toContainEqual({
                blockname: "TablePageReference",
                jsonPath: "root.rows.0.cellValues.1.value.attachedBlocks.0.props",
                visible: false,
                dependencies: [{ targetEntityName: "Page", id: "inactivePage" }],
            });
        });

        it("loads saved data and returns only the active block of a cell to the site", async () => {
            const savedData = JSON.parse(
                JSON.stringify(transformToBlockSave(createCellBlocksTableInput([pageReferenceCell]).transformToBlockData())),
            );

            const plain = await transformToPlain(CellBlocksTableBlock.blockDataFactory(savedData), {}, {} as ModuleRef, {} as ContextId);

            expect(plain).toMatchObject({
                rows: [
                    {
                        cellValues: [
                            {
                                columnId: "column0",
                                value: {
                                    attachedBlocks: [],
                                    activeType: "pageReference",
                                    block: { type: "pageReference", props: { pageId: "page" } },
                                },
                            },
                        ],
                    },
                ],
            });
        });
    });

    describe("with row and column settings", () => {
        const emptyRichText = { draftContent: { blocks: [], entityMap: {} } };

        function createSettingsTableInput({ rowSettings, columnSettings }: { rowSettings?: unknown; columnSettings?: unknown }) {
            return SettingsTableBlock.blockInputFactory({
                columns: [{ id: "column", size: "standard", highlighted: false, settings: columnSettings }],
                rows: [{ id: "row", highlighted: false, settings: rowSettings, cellValues: [{ columnId: "column", value: emptyRichText }] }],
            });
        }

        it("accepts settings with declared values", async () => {
            const input = createSettingsTableInput({ rowSettings: { bold: true }, columnSettings: { background: "grey", badges: ["new", "sale"] } });

            expect(await validate(input)).toHaveLength(0);
        });

        it.each([
            { rowSettings: { bold: "yes" } },
            { columnSettings: { background: "red" } },
            { columnSettings: { badges: ["new", "old"] } },
            { columnSettings: { badges: "new" } },
        ])("rejects settings with an undeclared value: %j", async (settings) => {
            expect(await validate(createSettingsTableInput(settings))).not.toHaveLength(0);
        });

        it("fills in the defaults of missing settings when converting the input to data", async () => {
            const input = createSettingsTableInput({ columnSettings: { background: "grey" } });

            expect(await validate(input)).toHaveLength(0);
            expect(await transformToPlain(input.transformToBlockData(), {}, {} as ModuleRef, {} as ContextId)).toMatchObject({
                columns: [{ id: "column", settings: { background: "grey", badges: [] } }],
                rows: [{ id: "row", settings: { bold: false } }],
            });
        });

        it("fills in the defaults of settings that didn't exist when the data was saved", async () => {
            const data = SettingsTableBlock.blockDataFactory({
                columns: [{ id: "column", size: "standard", highlighted: false, settings: { background: "grey" } }],
                rows: [{ id: "row", highlighted: false, cellValues: [] }],
            });

            expect(JSON.parse(JSON.stringify(transformToBlockSave(data)))).toMatchObject({
                columns: [{ settings: { background: "grey", badges: [] } }],
                rows: [{ settings: { bold: false } }],
            });
        });

        it("adds the settings to the block meta only when they are declared", () => {
            const getFieldNames = (block: typeof TableBlock) => {
                const tableFields = block.blockMeta.fields;
                const getNestedFieldNames = (name: string) => {
                    const field = tableFields.find((field) => field.name === name);
                    return field && "object" in field ? field.object.fields.map((nestedField) => nestedField.name) : [];
                };
                return { columns: getNestedFieldNames("columns"), rows: getNestedFieldNames("rows") };
            };

            expect(getFieldNames(TableBlock)).toEqual({ columns: ["id", "size", "highlighted"], rows: ["id", "highlighted", "cellValues"] });
            expect(getFieldNames(SettingsTableBlock)).toEqual({
                columns: ["id", "size", "highlighted", "settings"],
                rows: ["id", "highlighted", "settings", "cellValues"],
            });
        });
    });
});
