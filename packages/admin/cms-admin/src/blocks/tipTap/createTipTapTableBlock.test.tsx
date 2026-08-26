import { describe, expect, it } from "vitest";

import type { BlockContext } from "../context/BlockContext";
import { createTipTapTableBlock } from "./createTipTapTableBlock";

const getTable = (block: ReturnType<typeof createTipTapTableBlock>) => block.defaultValues().tipTapContent.content?.[0];

describe("createTipTapTableBlock", () => {
    it("should default to a 3x3 table whose first row is a header row", () => {
        const table = getTable(createTipTapTableBlock());

        expect(table?.type).toBe("table");
        expect(table?.content).toHaveLength(3);
        expect(table?.content?.[0].content?.map((cell) => cell.type)).toEqual(["tableHeader", "tableHeader", "tableHeader"]);
        expect(table?.content?.[1].content?.map((cell) => cell.type)).toEqual(["tableCell", "tableCell", "tableCell"]);
    });

    it("should honour defaultRows, defaultColumns and headerRow", () => {
        const table = getTable(createTipTapTableBlock({ defaultRows: 2, defaultColumns: 4, headerRow: false }));

        expect(table?.content).toHaveLength(2);
        expect(table?.content?.[0].content).toHaveLength(4);
        expect(table?.content?.[0].content?.every((cell) => cell.type === "tableCell")).toBe(true);
    });

    it("should throw for table sizes that cannot exist instead of creating a broken table", () => {
        expect(() => createTipTapTableBlock({ defaultRows: 0 })).toThrow();
        expect(() => createTipTapTableBlock({ defaultColumns: 0 })).toThrow();
        expect(() => createTipTapTableBlock({ defaultRows: 1.5 })).toThrow();
        expect(() => createTipTapTableBlock({ defaultColumns: -2 })).toThrow();
    });

    it("should fall back to a fresh table when the stored content is missing", () => {
        const block = createTipTapTableBlock();

        expect(block.input2State({ tipTapContent: undefined as never }).tipTapContent.content?.[0].type).toBe("table");
    });

    it("should preview the table dimensions", () => {
        const block = createTipTapTableBlock({ defaultRows: 2, defaultColumns: 4 });

        expect(block.previewContent(block.defaultValues(), {} as BlockContext)).toEqual([{ type: "text", content: "2 × 4" }]);
    });
});
