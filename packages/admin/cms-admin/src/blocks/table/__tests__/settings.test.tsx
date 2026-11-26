import { cleanup, fireEvent, type RenderResult, within } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../context/useBlockContext", () => ({
    useBlockContext: () => ({}),
}));

afterEach(cleanup);

import { createTableBlock, type TableBlockState } from "../../createTableBlock";
import { createRteInput, createRteState, MockRichTextBlock } from "../__mocks__/TableBlockData.mocks";
import { createTableSettings } from "../createTableSettings";
import { defaultTableColumnSettings, defaultTableRowSettings, getTableColumnWidthFromSize } from "../defaultTableSettings";
import {
    clickButtonOfColumnAtIndex,
    clickButtonOfRowAtIndex,
    getBodyRowgroup,
    getCellsExcludingTheDragHandleAndActionsCells,
    openColumnOptionsAtIndex,
    openRowOptionsAtIndex,
    renderTableBlock,
} from "./utils";

const columnSettings = createTableSettings({
    background: {
        type: "select",
        label: "Background",
        options: [
            { value: "none", label: "None" },
            { value: "grey", label: "Grey" },
        ],
        defaultValue: "none",
    },
    badges: {
        type: "multiSelect",
        label: "Badges",
        options: [
            { value: "new", label: "New" },
            { value: "sale", label: "Sale" },
        ],
        defaultValue: [],
    },
    hidden: { type: "checkbox", label: "Hidden on mobile", defaultValue: false },
});

const rowSettings = createTableSettings({
    bold: { type: "checkbox", label: "Bold", defaultValue: false },
});

const defaultColumnSettings = { background: "none", badges: [], hidden: false };

const createState = (backgroundOfFirstColumn = "none", boldRow = false): TableBlockState => ({
    columns: [
        { id: "first", settings: { ...defaultColumnSettings, background: backgroundOfFirstColumn } },
        { id: "second", settings: defaultColumnSettings },
    ],
    rows: [
        {
            id: "row",
            settings: { bold: boldRow },
            cellValues: [
                { columnId: "first", value: createRteState("First") },
                { columnId: "second", value: createRteState("Second") },
            ],
        },
    ],
});

const renderTableWithSettings = (state = createState()) => renderTableBlock(state, undefined, { rowSettings, columnSettings });

const chooseColumnSetting = (rendered: ReturnType<typeof renderTableBlock>, setting: RegExp, option: RegExp) => {
    clickButtonOfColumnAtIndex(rendered, 0, setting);
    fireEvent.click(rendered.getByRole("menuitemcheckbox", { name: option }));
};

const getCellValueStyles = (rendered: RenderResult) => {
    const [row] = within(getBodyRowgroup(rendered)).getAllByRole("row");
    return getCellsExcludingTheDragHandleAndActionsCells(row).map((cell) => getComputedStyle(cell.firstElementChild as Element));
};

describe("TableBlock: Row and column settings", () => {
    it("should set a select setting of a column", () => {
        const rendered = renderTableWithSettings();

        clickButtonOfColumnAtIndex(rendered, 0, /background/i);
        fireEvent.click(rendered.getByRole("menuitem", { name: /grey/i }));

        expect(rendered.getState().columns[0].settings.background).toBe("grey");
    });

    it("should toggle the options of a multi-select setting", () => {
        const rendered = renderTableWithSettings();

        chooseColumnSetting(rendered, /badges/i, /new/i);
        chooseColumnSetting(rendered, /badges/i, /sale/i);
        chooseColumnSetting(rendered, /badges/i, /new/i);

        expect(rendered.getState().columns[0].settings.badges).toEqual(["sale"]);
    });

    it("should toggle a checkbox setting of a row", () => {
        const rendered = renderTableWithSettings();

        openRowOptionsAtIndex(rendered, 0);
        fireEvent.click(rendered.getByRole("menuitemcheckbox", { name: /bold/i }));

        expect(rendered.getState().rows[0].settings.bold).toBe(true);
    });

    it("should give new rows and columns the default settings", () => {
        const rendered = renderTableWithSettings(createState("grey"));

        clickButtonOfColumnAtIndex(rendered, 0, /insert column right/i);
        clickButtonOfRowAtIndex(rendered, 0, /add row below/i);

        const { columns, rows } = rendered.getState();
        expect(columns[1].settings).toEqual(defaultColumnSettings);
        expect(rows[1].settings).toEqual({ bold: false });
    });

    it("should style each cell with getCellStyle from the settings of its row and column", () => {
        const rendered = renderTableBlock(createState("grey", true), undefined, {
            rowSettings,
            columnSettings,
            getCellStyle: ({ rowSettings, columnSettings }) => ({
                backgroundColor: columnSettings.background === "grey" ? "rgb(128, 128, 128)" : undefined,
                fontWeight: rowSettings.bold ? 700 : undefined,
            }),
        });

        const [firstCellStyle, secondCellStyle] = getCellValueStyles(rendered);
        expect(firstCellStyle.backgroundColor).toBe("rgb(128, 128, 128)");
        expect(firstCellStyle.fontWeight).toBe("700");
        expect(secondCellStyle.backgroundColor).not.toBe("rgb(128, 128, 128)");
        expect(secondCellStyle.fontWeight).toBe("700");
    });

    it("should keep the settings of a duplicated column", () => {
        const rendered = renderTableWithSettings(createState("grey"));

        clickButtonOfColumnAtIndex(rendered, 0, /duplicate/i);

        expect(rendered.getState().columns[1].settings.background).toBe("grey");
    });
});

describe("createTableBlock with settings", () => {
    const TableBlock = createTableBlock({ richText: MockRichTextBlock, rowSettings, columnSettings });

    it("should fill in the defaults of settings that are missing or invalid in saved data", () => {
        const state = TableBlock.input2State({
            columns: [{ id: "column", settings: { background: "red", badges: ["sale"] } }],
            rows: [{ id: "row", cellValues: [{ columnId: "column", value: createRteInput("Text") }] }],
        });

        expect(state.columns[0].settings).toEqual({ background: "none", badges: ["sale"], hidden: false });
        expect(state.rows[0].settings).toEqual({ bold: false });
    });

    it("should give a table without its own settings the default settings", () => {
        const TableBlockWithDefaultSettings = createTableBlock({ richText: MockRichTextBlock });

        const output = TableBlockWithDefaultSettings.state2Output(TableBlockWithDefaultSettings.defaultValues());

        expect(output.columns[0].settings).toEqual({ size: "standard", highlighted: false });
        expect(output.rows[0].settings).toEqual({ highlighted: false });
    });
});

describe("TableBlock: Default settings", () => {
    const greyFiftyOfTheDefaultTheme = "rgb(250, 250, 250)";

    const createStateWithDefaultSettings = ({ isRowHighlighted = false } = {}): TableBlockState => ({
        columns: [
            { id: "first", settings: { size: "standard", highlighted: false } },
            { id: "second", settings: { size: "standard", highlighted: false } },
        ],
        rows: [
            {
                id: "row",
                settings: { highlighted: isRowHighlighted },
                cellValues: [
                    { columnId: "first", value: createRteState("First") },
                    { columnId: "second", value: createRteState("Second") },
                ],
            },
        ],
    });

    const renderTableWithDefaultSettings = (state = createStateWithDefaultSettings()) =>
        renderTableBlock(state, undefined, { rowSettings: defaultTableRowSettings, columnSettings: defaultTableColumnSettings });

    it("should set the size of a column in the column width menu", () => {
        const rendered = renderTableWithDefaultSettings();

        clickButtonOfColumnAtIndex(rendered, 0, /column width/i);
        fireEvent.click(rendered.getByRole("menuitem", { name: /^large/i }));

        expect(rendered.getState().columns[0].settings.size).toBe("large");
    });

    it("should highlight a column", () => {
        const rendered = renderTableWithDefaultSettings();

        openColumnOptionsAtIndex(rendered, 0);
        fireEvent.click(rendered.getByRole("menuitemcheckbox", { name: /highlight column/i }));

        expect(rendered.getState().columns[0].settings.highlighted).toBe(true);
    });

    it("should highlight a row", () => {
        const rendered = renderTableWithDefaultSettings();

        openRowOptionsAtIndex(rendered, 0);
        fireEvent.click(rendered.getByRole("menuitemcheckbox", { name: /highlight row/i }));

        expect(rendered.getState().rows[0].settings.highlighted).toBe(true);
    });

    it("should give the cells of a highlighted row a background", () => {
        const rendered = renderTableWithDefaultSettings(createStateWithDefaultSettings({ isRowHighlighted: true }));

        expect(getCellValueStyles(rendered).map((style) => style.backgroundColor)).toEqual([greyFiftyOfTheDefaultTheme, greyFiftyOfTheDefaultTheme]);
    });

    it("should not give the cells of a row that isn't highlighted a background", () => {
        const rendered = renderTableWithDefaultSettings();

        expect(getCellValueStyles(rendered).map((style) => style.backgroundColor)).not.toContain(greyFiftyOfTheDefaultTheme);
    });

    it("should give a column without a known size the width of a standard column", () => {
        const standardColumnWidth = getTableColumnWidthFromSize({ size: "standard" });

        expect(getTableColumnWidthFromSize({})).toEqual(standardColumnWidth);
        expect(getTableColumnWidthFromSize({ size: "huge" })).toEqual(standardColumnWidth);
        expect(getTableColumnWidthFromSize({ size: "large" })).not.toEqual(standardColumnWidth);
    });
});
