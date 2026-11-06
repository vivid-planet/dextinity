import { useState } from "react";
import { MemoryRouter } from "react-router";
import { cleanup, fireEvent, render, screen, waitFor } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ContentGenerationConfigProvider } from "../documents/ContentGenerationConfigContext";
import { createSeoBlock } from "./createSeoBlock";
import { createBlockSkeleton } from "./helpers/createBlockSkeleton";
import type { BlockInterface, BlockState } from "./types";

const generateSeoTag = vi.fn();

vi.mock("./seo/useSeoTagGeneration", () => ({
    useSeoTagGeneration: () => generateSeoTag,
}));

const ImageBlock: BlockInterface<object, object, object> = {
    ...createBlockSkeleton(),
    name: "Image",
    displayName: "Image",
    defaultValues: () => ({}),
};

const SeoBlock = createSeoBlock({ image: ImageBlock });

type SeoBlockState = BlockState<typeof SeoBlock>;

function renderSeoBlock({ contentGeneration = false }: { contentGeneration?: boolean } = {}) {
    const onUpdate = vi.fn<(state: SeoBlockState) => void>();

    function Harness() {
        const [state, setState] = useState<SeoBlockState>(SeoBlock.defaultValues());
        return (
            <SeoBlock.AdminComponent
                state={state}
                updateState={(action) => {
                    const newState = typeof action === "function" ? action(state) : action;
                    onUpdate(newState);
                    setState(newState);
                }}
            />
        );
    }

    render(
        <MemoryRouter>
            {contentGeneration ? (
                <ContentGenerationConfigProvider seo={{ getRelevantContent: () => ["Content"] }}>
                    <Harness />
                </ContentGenerationConfigProvider>
            ) : (
                <Harness />
            )}
        </MemoryRouter>,
    );

    return onUpdate;
}

afterEach(() => {
    cleanup();
    generateSeoTag.mockReset();
});

describe("createSeoBlock AdminComponent", () => {
    it("updates the state when a meta tag changes", async () => {
        const onUpdate = renderSeoBlock();

        fireEvent.change(screen.getByRole("textbox", { name: "HTML Title" }), { target: { value: "My page" } });

        await waitFor(() => expect(onUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ htmlTitle: "My page" })));
    });

    it("adds and removes alternate links", async () => {
        const onUpdate = renderSeoBlock();

        fireEvent.click(screen.getByRole("button", { name: "Add alternate link" }));
        fireEvent.change(await screen.findByRole("textbox", { name: "Code" }), { target: { value: "de-AT" } });
        await waitFor(() => expect(onUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ alternativeLinks: [{ code: "de-AT", url: "" }] })));

        fireEvent.click(screen.getByRole("button", { name: "Remove alternate link" }));
        await waitFor(() => expect(onUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ alternativeLinks: [] })));
        expect(screen.queryByRole("textbox", { name: "Code" })).toBeNull();
    });

    it("shows an error for invalid structured data", async () => {
        renderSeoBlock();

        fireEvent.change(screen.getByRole("textbox", { name: "JSON-LD" }), { target: { value: "{ invalid" } });

        expect(await screen.findByText("Invalid JSON")).toBeTruthy();
    });

    it("offers no AI generation without a content generation config", () => {
        renderSeoBlock();

        expect(screen.queryByRole("button", { name: "Generate with AI" })).toBeNull();
    });

    it("applies an accepted AI suggestion to the field", async () => {
        generateSeoTag.mockResolvedValue("Generated title");
        const onUpdate = renderSeoBlock({ contentGeneration: true });

        fireEvent.click(screen.getAllByRole("button", { name: "Generate with AI" })[0]);
        fireEvent.click(await screen.findByRole("button", { name: "Accept" }));

        expect(generateSeoTag).toHaveBeenCalledWith("htmlTitle", "");
        await waitFor(() => expect(onUpdate).toHaveBeenLastCalledWith(expect.objectContaining({ htmlTitle: "Generated title" })));
    });
});
