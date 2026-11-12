import { RouterMemoryRouter } from "@dextinity/admin";
import { type Location, type NavigationType, Route, Routes } from "react-router";
import { act, cleanup, LocationSpy, render, waitFor } from "test-utils";
import { afterEach, describe, expect, it } from "vitest";

import { IFrameBridgeProvider } from "./IFrameBridge";
import { IFrameMessageType, type IFrameSelectComponentMessage } from "./IFrameMessage";

describe("IFrameBridgeProvider", () => {
    afterEach(() => {
        cleanup();
    });

    it("should navigate to the admin route of a component selected in the site", async () => {
        let location: Location | undefined;
        let navigationType: NavigationType | undefined;

        render(
            <RouterMemoryRouter initialEntries={["/page/edit"]}>
                <LocationSpy
                    onChange={(newLocation, newNavigationType) => {
                        location = newLocation;
                        navigationType = newNavigationType;
                    }}
                />
                <Routes>
                    <Route path="/page/edit/*" element={<IFrameBridgeProvider>Preview</IFrameBridgeProvider>} />
                </Routes>
            </RouterMemoryRouter>,
        );

        const message: IFrameSelectComponentMessage = {
            dextinityType: IFrameMessageType.SelectComponent,
            data: { adminRoute: "/page/edit/content/blocks/block-key/edit" },
        };
        await act(async () => {
            window.dispatchEvent(new MessageEvent("message", { data: JSON.stringify(message) }));
        });

        await waitFor(() => {
            expect(location?.pathname).toBe("/page/edit/content/blocks/block-key/edit");
        });
        expect(navigationType).toBe("PUSH");
    });
});
