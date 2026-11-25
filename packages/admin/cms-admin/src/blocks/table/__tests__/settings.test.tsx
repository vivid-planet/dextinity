import { cleanup, fireEvent } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../context/useBlockContext", () => ({
    useBlockContext: () => ({}),
}));

afterEach(cleanup);

import { createTableBlock, type TableBlockState } from "../../createTableBlock";
import { createRteInput, createRteState, MockRichTextBlock } from "../__mocks__/TableBlockData.mocks";
import { createTableSettings } from "../createTableSettings";
import { clickButtonOfColumnAtIndex, clickButtonOfRowAtIndex, openRowOptionsAtIndex, renderTableBlock } from "./utils";

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

const createState = (backgroundOfFirstColumn = "none"): TableBlockState => ({
    columns: [
        { id: "first", size: "standard", highlighted: false, settings: { ...defaultColumnSettings, background: backgroundOfFirstColumn } },
        { id: "second", size: "standard", highlighted: false, settings: defaultColumnSettings },
    ],
    rows: [
        {
            id: "row",
            highlighted: false,
            settings: { bold: false },
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
            columns: [{ id: "column", size: "standard", highlighted: false, settings: { background: "red", badges: ["sale"] } }],
            rows: [{ id: "row", highlighted: false, cellValues: [{ columnId: "column", value: createRteInput("Text") }] }],
        });

        expect(state.columns[0].settings).toEqual({ background: "none", badges: ["sale"], hidden: false });
        expect(state.rows[0].settings).toEqual({ bold: false });
    });

    it("should not send settings to the API for a table without settings", () => {
        const TableBlockWithoutSettings = createTableBlock({ richText: MockRichTextBlock });

        const output = TableBlockWithoutSettings.state2Output(TableBlockWithoutSettings.defaultValues());

        expect(output.columns[0]).not.toHaveProperty("settings");
        expect(output.rows[0]).not.toHaveProperty("settings");
    });
});
