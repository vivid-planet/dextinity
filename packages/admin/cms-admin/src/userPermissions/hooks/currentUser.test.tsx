import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CurrentUserProvider, type Permission, useUserPermissionCheck } from "./currentUser";

const scope = { domain: "main" };

vi.mock("../../contentScope/Provider", () => ({
    // The real hook memoizes the scope, but returns a new API object on every render.
    useContentScope: () => ({ scope }),
}));

const currentUserQueryResult = {
    data: {
        currentUser: {
            id: "1",
            name: "Test User",
            email: "test@example.com",
            impersonated: false,
            accountUrl: null,
            authenticatedUser: null,
            permissions: [{ permission: "pageTree", contentScopes: [scope] }],
            allowedContentScopes: [{ scope, label: { domain: "Main" } }],
        },
    },
};

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

describe("useUserPermissionCheck", () => {
    afterEach(() => {
        cleanup();
        permissionChecks = [];
    });

    it("returns the same callback when neither user nor content scope changed", () => {
        render(<TestApp />);

        act(() => {
            fireEvent.click(screen.getByRole("button", { name: "Rerender" }));
        });

        expect(permissionChecks).toHaveLength(2);
        expect(permissionChecks[1]).toBe(permissionChecks[0]);
    });

    it("checks the permissions of the current user", () => {
        render(<TestApp />);

        expect(permissionChecks[0]("pageTree" as Permission)).toBe(true);
        expect(permissionChecks[0]("warnings" as Permission)).toBe(false);
    });
});
