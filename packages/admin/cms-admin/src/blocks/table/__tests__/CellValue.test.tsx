import { render } from "test-utils";
import { describe, expect, it, vi } from "vitest";

import { createBlockSkeleton } from "../../helpers/createBlockSkeleton";
import type { BlockInterface, ReadOnlyBlockRenderInterface } from "../../types";
import { CellValue } from "../CellValue";
import { TableBlockContextProvider } from "../TableBlockContext";

vi.mock("../../context/useBlockContext", () => ({ useBlockContext: () => ({}) }));

describe("CellValue", () => {
    it("renders the cell value through the injected block's ReadOnlyComponent, independent of the editor", () => {
        const editorAgnosticBlock: BlockInterface & ReadOnlyBlockRenderInterface<{ label: string }> = {
            ...createBlockSkeleton(),
            name: "Mock",
            defaultValues: () => ({ label: "" }),
            ReadOnlyComponent: ({ state }) => <span>{state.label}</span>,
        };

        const rendered = render(
            <TableBlockContextProvider RichTextBlock={editorAgnosticBlock}>
                <CellValue value={{ label: "cell content" }} highlighted={false} />
            </TableBlockContextProvider>,
        );

        expect(rendered.getByText("cell content")).toBeTruthy();
    });

    it("renders the preview content of a block without ReadOnlyComponent", () => {
        const imageBlock: BlockInterface<unknown, { src: string; caption: string }> = {
            ...createBlockSkeleton(),
            name: "MockImage",
            defaultValues: () => ({ src: "", caption: "" }),
            previewContent: (state) => [
                { type: "image", content: { src: state.src, width: 100, height: 100 } },
                { type: "text", content: state.caption },
            ],
        };

        const rendered = render(
            <TableBlockContextProvider RichTextBlock={imageBlock}>
                <CellValue value={{ src: "https://example.com/image.jpg", caption: "image caption" }} highlighted={false} />
            </TableBlockContextProvider>,
        );

        expect(rendered.getByText("image caption")).toBeTruthy();
        expect(rendered.container.querySelector("img")?.getAttribute("src")).toBe("https://example.com/image.jpg");
    });
});
