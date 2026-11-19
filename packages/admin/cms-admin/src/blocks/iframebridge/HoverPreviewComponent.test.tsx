import { Stack, StackPage, StackSwitch, SubRoute } from "@dextinity/admin";
import { createMemoryHistory } from "history";
import type { ReactNode } from "react";
import { Route, Router } from "react-router";
import scrollIntoView from "scroll-into-view-if-needed";
import { cleanup, fireEvent, render, screen } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { HoverPreviewComponent } from "./HoverPreviewComponent";
import { IFrameBridgeContext } from "./IFrameBridge";

vi.mock("scroll-into-view-if-needed", () => ({ default: vi.fn() }));

const sendHoverComponent = vi.fn();

function renderOnEditPage(children: ReactNode, { hoveredSiteRoute = null }: { hoveredSiteRoute?: string | null } = {}) {
    const iFrameBridge = { iFrameReady: true, hoveredSiteRoute, sendHoverComponent } as unknown as IFrameBridgeContext;

    render(
        <Router history={createMemoryHistory({ initialEntries: ["/page/edit"] })}>
            <Route path="/page/edit">
                <IFrameBridgeContext.Provider value={iFrameBridge}>
                    <Stack topLevelTitle="Page">{children}</Stack>
                </IFrameBridgeContext.Provider>
            </Route>
        </Router>,
    );
}

function BlockList({ blockKey }: { blockKey: string }) {
    return (
        <StackSwitch>
            <StackPage name="list">
                <HoverPreviewComponent componentSlug={`${blockKey}/blocks`}>Block list entry</HoverPreviewComponent>
            </StackPage>
            <StackPage name="blocks">Block form</StackPage>
        </StackSwitch>
    );
}

describe("HoverPreviewComponent", () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
        vi.useRealTimers();
    });

    it("sends the route of a block list entry", () => {
        renderOnEditPage(<BlockList blockKey="block-key" />);

        fireEvent.mouseOver(screen.getByText("Block list entry"));

        expect(sendHoverComponent).toHaveBeenCalledWith("/page/edit/block-key/blocks");
    });

    it("sends the route of a block list entry below a sub-route", () => {
        renderOnEditPage(
            <SubRoute path="/page/edit/save">
                <BlockList blockKey="block-key" />
            </SubRoute>,
        );

        fireEvent.mouseOver(screen.getByText("Block list entry"));

        expect(sendHoverComponent).toHaveBeenCalledWith("/page/edit/save/block-key/blocks");
    });

    it("sends the route of an anchor without the sub-route of a composite block's child block", () => {
        renderOnEditPage(
            <SubRoute path="/page/edit/link">
                <HoverPreviewComponent componentSlug="#external">Link form</HoverPreviewComponent>
            </SubRoute>,
        );

        fireEvent.mouseOver(screen.getByText("Link form"));

        expect(sendHoverComponent).toHaveBeenCalledWith("/page/edit#external");
    });

    it("scrolls to a block list entry hovered in the preview", () => {
        vi.useFakeTimers();
        renderOnEditPage(<BlockList blockKey="block-key" />, { hoveredSiteRoute: "/page/edit/block-key/blocks#headline" });

        vi.advanceTimersByTime(500);

        expect(scrollIntoView).toHaveBeenCalledWith(screen.getByText("Block list entry").parentElement, expect.anything());
    });

    it("doesn't scroll to a block list entry while another block is hovered in the preview", () => {
        vi.useFakeTimers();
        renderOnEditPage(<BlockList blockKey="block-key" />, { hoveredSiteRoute: "/page/edit/other-block-key/blocks" });

        vi.advanceTimersByTime(500);

        expect(scrollIntoView).not.toHaveBeenCalled();
    });
});
