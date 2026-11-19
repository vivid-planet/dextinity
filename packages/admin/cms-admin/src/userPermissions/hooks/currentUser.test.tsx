import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CurrentUserProvider, type Permission, useUserPermissionCheck } from "./currentUser";

const mainScope = { domain: "main" };
const otherScope = { domain: "other" };

let scope = mainScope;

vi.mock("../../contentScope/Provider", () => ({
    // The real hook memoizes the scope, but returns a new API object on every render.
    useContentScope: () => ({ scope }),
}));

function createCurrentUserQueryResult(permission: string) {
    return {
        data: {
            currentUser: {
                id: "1",
                name: "Test User",
                email: "test@example.com",
                impersonated: false,
                accountUrl: null,
                authenticatedUser: null,
                permissions: [{ permission, contentScopes: [mainScope] }],
                allowedContentScopes: [{ scope: mainScope, label: { domain: "Main" } }],
            },
        },
    };
}

let currentUserQueryResult = createCurrentUserQueryResult("pageTree");

vi.mock(import("@apollo/client"), async (importOriginal) => {
    const originalModule = await importOriginal();
    return { ...originalModule, useQuery: (() => currentUserQueryResult) as unknown as typeof originalModule.useQuery };
});

let permissionChecks: ((permission: Permission) => boolean)[] = [];

function PermissionCheckConsumer() {
    permissionChecks.push(useUserPermissionCheck());
    return null;
}

function TestApp() {
    const [, setRenderCount] = useState(0);
    return (
        <>
            <button onClick={() => setRenderCount((renderCount) => renderCount + 1)}>Rerender</button>
            <CurrentUserProvider>
                <PermissionCheckConsumer />
            </CurrentUserProvider>
        </>
    );
}

function rerenderTestApp() {
    act(() => {
        fireEvent.click(screen.getByRole("button", { name: "Rerender" }));
    });
}

describe("useUserPermissionCheck", () => {
    afterEach(() => {
        cleanup();
        permissionChecks = [];
        scope = mainScope;
        currentUserQueryResult = createCurrentUserQueryResult("pageTree");
    });

    it("checks the permissions of the current user", () => {
        render(<TestApp />);

        expect(permissionChecks[0]("pageTree" as Permission)).toBe(true);
        expect(permissionChecks[0]("warnings" as Permission)).toBe(false);
    });

    it("returns the same callback when neither user nor content scope changed", () => {
        render(<TestApp />);

        rerenderTestApp();

        expect(permissionChecks).toHaveLength(2);
        expect(permissionChecks[1]).toBe(permissionChecks[0]);
    });

    it("returns a callback for the new content scope when the content scope changed", () => {
        render(<TestApp />);

        scope = otherScope;
        rerenderTestApp();

        expect(permissionChecks[1]).not.toBe(permissionChecks[0]);
        // The user's permission is restricted to the main scope.
        expect(permissionChecks[1]("pageTree" as Permission)).toBe(false);
    });

    it("returns a callback for the new user when the current user changed", () => {
        render(<TestApp />);

        currentUserQueryResult = createCurrentUserQueryResult("warnings");
        rerenderTestApp();

        expect(permissionChecks[1]).not.toBe(permissionChecks[0]);
        expect(permissionChecks[1]("warnings" as Permission)).toBe(true);
        expect(permissionChecks[1]("pageTree" as Permission)).toBe(false);
    });
});
