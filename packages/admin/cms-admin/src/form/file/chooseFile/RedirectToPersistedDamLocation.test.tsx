import { RouterMemoryRouter } from "@dextinity/admin";
import { Link, type Location, type NavigationType, Route, Routes } from "react-router";
import { act, cleanup, fireEvent, LocationSpy, render, screen, waitFor } from "test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { RedirectToPersistedDamLocation } from "./RedirectToPersistedDamLocation";

describe("RedirectToPersistedDamLocation", () => {
    let location: Location | undefined;
    let navigationType: NavigationType | undefined;

    function handleLocationChange(newLocation: Location, newNavigationType: NavigationType) {
        location = newLocation;
        navigationType = newNavigationType;
    }

    beforeEach(() => {
        sessionStorage.clear();
        location = undefined;
        navigationType = undefined;
    });

    afterEach(() => {
        cleanup();
    });

    it("should redirect to the persisted location on the initial render", async () => {
        sessionStorage.setItem("damLocation", JSON.stringify("/folder-id/folder"));

        render(
            <RouterMemoryRouter>
                <LocationSpy onChange={handleLocationChange} />
                <RedirectToPersistedDamLocation stateKey="damLocation" />
            </RouterMemoryRouter>,
        );

        await waitFor(() => {
            expect(location?.pathname).toBe("/folder-id/folder");
        });
        expect(navigationType).toBe("REPLACE");
    });

    it("should persist the location", async () => {
        render(
            <RouterMemoryRouter>
                <RedirectToPersistedDamLocation stateKey="damLocation" />
                <Link to="/folder-id/folder">Open folder</Link>
            </RouterMemoryRouter>,
        );

        fireEvent.click(screen.getByText("Open folder"));

        await waitFor(() => {
            expect(sessionStorage.getItem("damLocation")).toBe(JSON.stringify("/folder-id/folder"));
        });
    });

    it("should not redirect below the URL of the route", async () => {
        sessionStorage.setItem("damLocation", JSON.stringify("/main/en/assets/folder-id/folder"));

        render(
            <RouterMemoryRouter initialEntries={["/main/en/assets/other-folder-id/folder"]}>
                <LocationSpy onChange={handleLocationChange} />
                <Routes>
                    <Route path="/main/en/assets/*" element={<RedirectToPersistedDamLocation stateKey="damLocation" />} />
                </Routes>
            </RouterMemoryRouter>,
        );

        await waitFor(() => {
            expect(sessionStorage.getItem("damLocation")).toBe(JSON.stringify("/main/en/assets/other-folder-id/folder"));
        });
        await act(() => new Promise((resolve) => setTimeout(resolve, 10))); // a redirect would complete asynchronously
        expect(location?.pathname).toBe("/main/en/assets/other-folder-id/folder");
        expect(navigationType).toBe("POP");
    });
});
