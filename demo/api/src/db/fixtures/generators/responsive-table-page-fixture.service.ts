import { PageTreeNodeBaseCreateInput, PageTreeNodeVisibility, PageTreeService } from "@dextinity/cms-api";
import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { ResponsiveBehavior } from "@src/common/blocks/responsive-table.block";
import { Spacing } from "@src/common/blocks/space.block";
import { PageContentBlock } from "@src/documents/pages/blocks/page-content.block";
import { StageBlock } from "@src/documents/pages/blocks/stage.block";
import { Page } from "@src/documents/pages/entities/page.entity";
import { PageTreeNodeScope } from "@src/page-tree/dto/page-tree-node-scope";
import { PageTreeNodeCategory } from "@src/page-tree/page-tree-node-category";
import { UserGroup } from "@src/user-groups/user-group";

import { generateContentBlock, generateHeadingBlock, generateSpaceBlock, PageContentBlockItem } from "./blocks/page-content-block.generator";
import { generateSeoBlock } from "./blocks/seo.generator";
import { TableBlockInput } from "./blocks/text-and-content/table-block-fixture-base";
import { createTipTapCellRichText, TipTapRichTextInput } from "./blocks/text-and-content/tip-tap-table-block-fixture.service";

type TableInput = TableBlockInput<TipTapRichTextInput>;

interface ResponsiveTableExample {
    responsiveBehavior: ResponsiveBehavior;
    title: string;
    description: string;
    cells: string[][];
}

const openingHoursCells = [
    ["Region", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    ["Vienna", "08:00 – 18:00", "08:00 – 18:00", "08:00 – 18:00", "08:00 – 18:00", "08:00 – 20:00", "09:00 – 17:00", "Closed"],
    ["Graz", "08:30 – 17:30", "08:30 – 17:30", "08:30 – 17:30", "08:30 – 17:30", "08:30 – 19:00", "09:00 – 16:00", "Closed"],
    ["Linz", "09:00 – 17:00", "09:00 – 17:00", "09:00 – 17:00", "09:00 – 17:00", "09:00 – 19:00", "09:00 – 15:00", "Closed"],
    ["Salzburg", "09:00 – 18:00", "09:00 – 18:00", "09:00 – 18:00", "09:00 – 18:00", "09:00 – 20:00", "10:00 – 16:00", "Closed"],
    ["Innsbruck", "08:00 – 17:00", "08:00 – 17:00", "08:00 – 17:00", "08:00 – 17:00", "08:00 – 18:00", "09:00 – 14:00", "Closed"],
];

/**
 * Every example highlights its first row and its first column, whatever the behavior is: the highlight
 * is decoration and does not pick the header side.
 */
const examples: ResponsiveTableExample[] = [
    {
        responsiveBehavior: ResponsiveBehavior.horizontalScrolling,
        title: "Horizontal Scrolling",
        description:
            "The table keeps its layout and scrolls sideways when it is wider than the page. Use it when readers compare values across rows and columns, like these opening hours.",
        cells: openingHoursCells,
    },
    {
        responsiveBehavior: ResponsiveBehavior.headerRow,
        title: "First Row as Header",
        description:
            "On narrow screens, each row becomes a group of its own, and each value is shown next to its heading from the first row. Use it when each row describes one item.",
        cells: [
            ["Size", "Chest", "Waist", "Hips"],
            ["S", "86 – 91 cm", "71 – 76 cm", "89 – 94 cm"],
            ["M", "96 – 101 cm", "81 – 86 cm", "99 – 104 cm"],
            ["L", "106 – 111 cm", "91 – 96 cm", "109 – 114 cm"],
            ["XL", "116 – 121 cm", "101 – 106 cm", "119 – 124 cm"],
        ],
    },
    {
        responsiveBehavior: ResponsiveBehavior.headerColumn,
        title: "First Column as Header",
        description:
            "On narrow screens, each column becomes a group of its own, and each value is shown next to its heading from the first column. Use it when each column describes one item.",
        cells: [
            ["Model", "Comet 100", "Comet 200", "Comet 300"],
            ["Price", "199 €", "299 €", "399 €"],
            ["Weight", "1.2 kg", "1.5 kg", "1.8 kg"],
            ["Battery life", "6 hours", "9 hours", "14 hours"],
        ],
    },
];

function generateExampleIntroBlock({ title, description }: { title: string; description: string }): PageContentBlockItem {
    return generateContentBlock({
        type: "tipTapRichText",
        props: {
            tipTapContent: {
                type: "doc",
                content: [
                    { type: "textBlock", attrs: { textBlock: "heading-5" }, content: [{ type: "text", text: title }] },
                    { type: "textBlock", attrs: { textBlock: "paragraph" }, content: [{ type: "text", text: description }] },
                ],
            },
        },
    });
}

function generateTable(cells: string[][]): TableInput {
    const columnCount = Math.max(...cells.map((row) => row.length));

    const columns: TableInput["columns"] = Array.from({ length: columnCount }, (_, columnIndex) => ({
        id: `column-${columnIndex}`,
        size: "standard",
        highlighted: columnIndex === 0,
    }));

    const rows: TableInput["rows"] = cells.map((row, rowIndex) => ({
        id: `row-${rowIndex}`,
        highlighted: rowIndex === 0,
        cellValues: row.map((text, columnIndex) => ({
            columnId: columns[columnIndex].id,
            value: createTipTapCellRichText(text, { isBold: rowIndex === 0 || columnIndex === 0 }),
        })),
    }));

    return { columns, rows };
}

/**
 * Page with a plain table and one table per responsive behavior, to compare them on one screen. The tables are written by
 * hand, because judging a behavior needs header cells that really label their records.
 */
@Injectable()
export class ResponsiveTablePageFixtureService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly pageTreeService: PageTreeService,
    ) {}

    async execute({ parentId }: { parentId: string }): Promise<void> {
        const documentId = "deadbeef-0000-4000-8000-000000000002";
        const scope: PageTreeNodeScope = { domain: "main", language: "en" };

        const node = await this.pageTreeService.createNode(
            {
                name: "Responsive Table Blocks",
                slug: "responsive-table-blocks",
                parentId,
                attachedDocument: { id: documentId, type: "Page" },
                userGroup: UserGroup.all,
            } as PageTreeNodeBaseCreateInput, // Typing of PageTreeService is wrong https://github.com/vivid-planet/dextinity/pull/1515#issue-2042001589
            PageTreeNodeCategory.mainNavigation,
            scope,
        );
        await this.pageTreeService.updateNodeVisibility(node.id, PageTreeNodeVisibility.Published);

        const blocks = [
            generateSpaceBlock(Spacing.d200),
            generateHeadingBlock({ text: "Responsive Table Examples", level: 1 }),
            generateSpaceBlock(Spacing.d200),
            generateExampleIntroBlock({
                title: "Not Responsive",
                description: "The table block without responsive behavior, for comparison.",
            }),
            generateContentBlock({ type: "tipTapTable", props: generateTable(openingHoursCells) }),
            generateSpaceBlock(Spacing.d100),
            ...examples.flatMap((example) => [
                generateExampleIntroBlock(example),
                generateContentBlock({
                    type: "responsiveTable",
                    props: { table: generateTable(example.cells), responsiveBehavior: example.responsiveBehavior },
                }),
                generateSpaceBlock(Spacing.d100),
            ]),
        ];

        await this.entityManager.persistAndFlush(
            this.entityManager.create(Page, {
                id: documentId,
                content: PageContentBlock.blockInputFactory({ blocks }).transformToBlockData(),
                seo: generateSeoBlock().transformToBlockData(),
                stage: StageBlock.blockInputFactory({ blocks: [] }).transformToBlockData(),
            }),
        );
    }
}
