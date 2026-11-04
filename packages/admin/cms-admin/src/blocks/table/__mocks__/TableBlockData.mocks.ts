import { v4 as uuid } from "uuid";

import type { RichTextBlockInput } from "../../../blocks.generated";
import { createRichTextBlock, type RichTextBlockState } from "../../createRichTextBlock";
import type { TableBlockState } from "../../createTableBlock";
import { createBlockSkeleton } from "../../helpers/createBlockSkeleton";
import type { BlockInterface, LinkBlockInterface } from "../../types";
import type { ColumnInsertData } from "../utils/column";

const MockLinkBlock: BlockInterface & LinkBlockInterface = {
    ...createBlockSkeleton(),
    name: "Link",
    defaultValues: () => ({}),
};

export const MockRichTextBlock = createRichTextBlock({ link: MockLinkBlock, rte: { supports: [] } });

export const createRteState = (text: string): RichTextBlockState => {
    return MockRichTextBlock.input2State(createRteInput(text));
};

export const getPlainTextFromState = (state: RichTextBlockState): string => {
    return state.editorState.getCurrentContent().getPlainText();
};

export const createRteInput = (text: string): RichTextBlockInput => {
    return {
        draftContent: {
            blocks: [
                {
                    key: "test",
                    type: "unstyled",
                    text,
                    depth: 0,
                    inlineStyleRanges: [],
                    entityRanges: [],
                    data: {},
                },
            ],
            entityMap: {},
        },
    };
};

export const columnInsertDataWithFiveValues: ColumnInsertData = {
    size: "standard",
    highlighted: false,
    cellValues: [
        createRteState("Created date"),
        createRteState("2025-11-27"),
        createRteState("2025-05-12"),
        createRteState("2024-09-18"),
        createRteState("2025-02-20"),
    ],
};

const getDefaultState = (): TableBlockState => {
    const smallHighlightedColumn: TableBlockState["columns"][number] = {
        id: uuid(),
        size: "small",
        highlighted: true,
    };

    const firstStandardColumn: TableBlockState["columns"][number] = {
        id: uuid(),
        size: "standard",
        highlighted: false,
    };

    const secondStandardColumn: TableBlockState["columns"][number] = {
        id: uuid(),
        size: "standard",
        highlighted: false,
    };

    const extraLargeColumn: TableBlockState["columns"][number] = {
        id: uuid(),
        highlighted: false,
        size: "extraLarge",
    };

    const headerRow: TableBlockState["rows"][number] = {
        id: uuid(),
        highlighted: true,
        cellValues: [
            { columnId: smallHighlightedColumn.id, value: createRteState("Product ID") },
            { columnId: firstStandardColumn.id, value: createRteState("Inventor") },
            { columnId: secondStandardColumn.id, value: createRteState("Product name") },
            { columnId: extraLargeColumn.id, value: createRteState("Product description") },
        ],
    };

    const dataRowOne: TableBlockState["rows"][number] = {
        id: uuid(),
        highlighted: false,
        cellValues: [
            { columnId: smallHighlightedColumn.id, value: createRteState("p1") },
            { columnId: firstStandardColumn.id, value: createRteState("Chelsea Kuvalis") },
            { columnId: secondStandardColumn.id, value: createRteState("Tasty Frozen Keyboard") },
            {
                columnId: extraLargeColumn.id,
                value: createRteState("Carbonite web goalkeeper gloves are ergonomically designed to give easy fit"),
            },
        ],
    };

    const dataRowTwo: TableBlockState["rows"][number] = {
        id: uuid(),
        highlighted: false,
        cellValues: [
            { columnId: smallHighlightedColumn.id, value: createRteState("p2") },
            { columnId: firstStandardColumn.id, value: createRteState("Randal Renner") },
            { columnId: secondStandardColumn.id, value: createRteState("Practical Granite Chips") },
            {
                columnId: extraLargeColumn.id,
                value: createRteState(
                    "New ABC 13 9370, 13.3, 5th Gen CoreA5-8250U, 8GB RAM, 256GB SSD, power UHD Graphics, OS 10 Home, OS Office A & J 2016",
                ),
            },
        ],
    };

    const dataRowThree: TableBlockState["rows"][number] = {
        id: uuid(),
        highlighted: false,
        cellValues: [
            { columnId: smallHighlightedColumn.id, value: createRteState("p3") },
            { columnId: firstStandardColumn.id, value: createRteState("Greg Bednar") },
            { columnId: secondStandardColumn.id, value: createRteState("Licensed Soft Keyboard") },
            {
                columnId: extraLargeColumn.id,
                value: createRteState(
                    "The slim & simple Maple Gaming Keyboard from Dev Byte comes with a sleek body and 7- Color RGB LED Back-lighting for smart functionality",
                ),
            },
        ],
    };

    const dataRowFour: TableBlockState["rows"][number] = {
        id: uuid(),
        highlighted: false,
        cellValues: [
            { columnId: smallHighlightedColumn.id, value: createRteState("p4") },
            { columnId: firstStandardColumn.id, value: createRteState("Julio Von") },
            { columnId: secondStandardColumn.id, value: createRteState("Tasty Wooden Gloves") },
            {
                columnId: extraLargeColumn.id,
                value: createRteState(
                    "The beautiful range of Apple Naturalé that has an exciting mix of natural ingredients. With the Goodness of 100% Natural Ingredients",
                ),
            },
        ],
    };

    return {
        columns: [smallHighlightedColumn, firstStandardColumn, secondStandardColumn, extraLargeColumn],
        rows: [headerRow, dataRowOne, dataRowTwo, dataRowThree, dataRowFour],
    };
};

const getStateWithTwoColumnsAndTwoRows = (): TableBlockState => {
    const columnIdOne = uuid();
    const columnIdTwo = uuid();

    return {
        columns: [
            { id: columnIdOne, size: "standard", highlighted: false },
            { id: columnIdTwo, size: "standard", highlighted: false },
        ],
        rows: [
            {
                id: uuid(),
                highlighted: false,
                cellValues: [
                    { columnId: columnIdOne, value: createRteState("Row 1 / Column 1") },
                    { columnId: columnIdTwo, value: createRteState("Row 1 / Column 2") },
                ],
            },
            {
                id: uuid(),
                highlighted: false,
                cellValues: [
                    { columnId: columnIdOne, value: createRteState("Row 2 / Column 1") },
                    { columnId: columnIdTwo, value: createRteState("Row 2 / Column 2") },
                ],
            },
        ],
    };
};

export const mockStates: Record<string, TableBlockState> = {
    default: getDefaultState(),
    twoColumnsAndTwoRows: getStateWithTwoColumnsAndTwoRows(),
    empty: { columns: [], rows: [] },
};
