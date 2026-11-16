import { MockedProvider } from "@apollo/client/testing";
import { RouterBrowserRouter, RouterMemoryRouter, useCurrentRouteMatch } from "@dextinity/admin";
import { type PropsWithChildren, type ReactNode, useState } from "react";
import { type Location, type NavigationType, Route, Routes, useParams } from "react-router";
import { act, cleanup, fireEvent, LocationSpy, render, screen, waitFor } from "test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { MasterMenuRoutes } from "../common/MasterMenuRoutes";
import { CurrentUserContext } from "../userPermissions/hooks/currentUser";
import { contentScopeLocalStorageKey } from "./ContentScopeSelect";
import { type ContentScopeLocation, ContentScopeProvider, useContentScope, type UseContentScopeApi } from "./Provider";
import { useContentScopeConfig } from "./useContentScopeConfig";
import { useRoutePathBelowContentScope } from "./useRoutePathBelowContentScope";

function CurrentUserProvider({ children }: PropsWithChildren) {
    return (
        <MockedProvider>
            <CurrentUserContext.Provider
                value={{
                    currentUser: {
                        id: "1",
                        name: "Test User",
                        email: "test@example.com",
                        impersonated: false,
                        authenticatedUser: null,
                        permissions: [],
                        allowedContentScopes: [],
                    },
                    isAllowed: () => true,
                }}
            >
                {children}
            </CurrentUserContext.Provider>
        </MockedProvider>
    );
}

// Keeps the route when changing the scope, like the `PublisherPage` does
function PageWithRedirectPathAfterChange() {
    const routePath = useRoutePathBelowContentScope();
    useContentScopeConfig({ redirectPathAfterChange: routePath });
    return <div>Route path: {routePath}</div>;
}

const menuWithPage = [
    { type: "route" as const, primary: "Page", icon: undefined, route: { path: "/page", element: <PageWithRedirectPathAfterChange /> } },
];

const scopesWithSpecialCharacters = [
    { scope: { domain: "über", language: "de" } },
    { scope: { domain: "main", language: "en" } },
    { scope: { domain: "main", language: "de" } },
];

describe("ContentScopeProvider", () => {
    afterEach(() => {
        cleanup();
    });

    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
    });

    let location: Location | undefined;
    let navigationType: NavigationType | undefined;

    beforeEach(() => {
        location = undefined;
        navigationType = undefined;
    });

    function handleLocationChange(newLocation: Location, newNavigationType: NavigationType) {
        location = newLocation;
        navigationType = newNavigationType;
    }

    function Wrapper({ children, initialEntries }: { children: ReactNode; initialEntries?: string[] }) {
        return (
            <CurrentUserProvider>
                <RouterMemoryRouter initialEntries={initialEntries}>
                    <LocationSpy onChange={handleLocationChange} />
                    {children}
                </RouterMemoryRouter>
            </CurrentUserProvider>
        );
    }

    const allowedScopes = [
        { scope: { domain: "main", language: "en" }, label: { domain: "Main", language: "EN" } },
        { scope: { domain: "main", language: "de" }, label: { domain: "Main", language: "DE" } },
    ];

    let contentScopeApi: UseContentScopeApi | undefined;

    beforeEach(() => {
        contentScopeApi = undefined;
    });

    function ContentScopeApiSpy() {
        contentScopeApi = useContentScope();
        return null;
    }

    it("should use stored scope when it is in allowed scopes", async () => {
        const storedScope = { domain: "main", language: "de" };

        // Store a scope that is allowed
        localStorage.setItem(contentScopeLocalStorageKey, JSON.stringify(storedScope));

        const { container } = render(
            <Wrapper>
                <ContentScopeProvider values={allowedScopes} defaultValue={allowedScopes[0].scope}>
                    {() => <div>Content</div>}
                </ContentScopeProvider>
            </Wrapper>,
        );

        await waitFor(() => {
            expect(container.textContent).toContain("Content");
        });

        // The stored scope should still be in localStorage since it's valid
        expect(localStorage.getItem(contentScopeLocalStorageKey)).toBe(JSON.stringify(storedScope));
        // URL should reflect the stored scope
        expect(location?.pathname).toBe("/main/de");
    });

    it("should clear stored scope when it is not in allowed scopes", async () => {
        const storedScope = { domain: "secondary", language: "fr" }; // Not in allowed scopes

        // Store a scope that is NOT allowed
        localStorage.setItem(contentScopeLocalStorageKey, JSON.stringify(storedScope));

        const { container } = render(
            <Wrapper>
                <ContentScopeProvider values={allowedScopes} defaultValue={allowedScopes[0].scope}>
                    {() => <div>Content</div>}
                </ContentScopeProvider>
            </Wrapper>,
        );

        await waitFor(() => {
            expect(container.textContent).toContain("Content");
        });

        // The stored scope should be cleared from localStorage since it's invalid
        expect(localStorage.getItem(contentScopeLocalStorageKey)).toBeNull();
        // URL should fall back to the default scope
        expect(location?.pathname).toBe("/main/en");
    });

    it("should use default scope when no scope is stored", async () => {
        // No stored scope

        const { container } = render(
            <Wrapper>
                <ContentScopeProvider values={allowedScopes} defaultValue={allowedScopes[0].scope}>
                    {() => <div>Content</div>}
                </ContentScopeProvider>
            </Wrapper>,
        );

        await waitFor(() => {
            expect(container.textContent).toContain("Content");
        });

        // No scope should be stored
        expect(localStorage.getItem(contentScopeLocalStorageKey)).toBeNull();
        // URL should use the default scope
        expect(location?.pathname).toBe("/main/en");
    });

    it("should handle partial scope matches correctly", async () => {
        const storedScope = { domain: "main" }; // Partial match - missing language

        // Store a partial scope
        localStorage.setItem(contentScopeLocalStorageKey, JSON.stringify(storedScope));

        const { container } = render(
            <Wrapper>
                <ContentScopeProvider values={allowedScopes} defaultValue={allowedScopes[0].scope}>
                    {() => <div>Content</div>}
                </ContentScopeProvider>
            </Wrapper>,
        );

        await waitFor(() => {
            expect(container.textContent).toContain("Content");
        });

        // The partial scope should be cleared since it doesn't exactly match any allowed scope
        expect(localStorage.getItem(contentScopeLocalStorageKey)).toBeNull();
        // URL should fall back to the default scope
        expect(location?.pathname).toBe("/main/en");
    });

    it("should use default scope when localStorage contains 'undefined' string", async () => {
        const allowedScopes = [{ scope: { domain: "main", language: "en" }, label: { domain: "Main", language: "EN" } }];

        // Store "undefined" string (edge case that can happen in some scenarios)
        localStorage.setItem(contentScopeLocalStorageKey, "undefined");

        const { container } = render(
            <Wrapper>
                <ContentScopeProvider values={allowedScopes} defaultValue={allowedScopes[0].scope}>
                    {() => <div>Content</div>}
                </ContentScopeProvider>
            </Wrapper>,
        );

        await waitFor(() => {
            expect(container.textContent).toContain("Content");
        });

        // The "undefined" string should be left as-is since it's handled by the check
        // The provider uses the default scope instead of trying to parse "undefined"
        expect(localStorage.getItem(contentScopeLocalStorageKey)).toBe("undefined");
        // URL should use the default scope
        expect(location?.pathname).toBe("/main/en");
    });

    it("should replace a URL that doesn't contain an allowed scope with the default scope", async () => {
        render(
            <Wrapper initialEntries={["/secondary/en/pages"]}>
                <ContentScopeProvider values={allowedScopes} defaultValue={allowedScopes[0].scope}>
                    {() => <div>Content</div>}
                </ContentScopeProvider>
            </Wrapper>,
        );

        expect(await screen.findByText("Content")).toBeTruthy();
        expect(location?.pathname).toBe("/main/en");
        expect(navigationType).toBe("REPLACE");
    });

    it("should keep a URL below an allowed scope and pass the match to the children", async () => {
        render(
            <Wrapper initialEntries={["/main/de/pages/pagetree"]}>
                <ContentScopeProvider values={allowedScopes} defaultValue={allowedScopes[0].scope}>
                    {({ match }) => <div>{JSON.stringify(match)}</div>}
                </ContentScopeProvider>
            </Wrapper>,
        );

        expect(await screen.findByText(JSON.stringify({ params: { domain: "main", language: "de" }, url: "/main/de", isExact: false }))).toBeTruthy();
        expect(location?.pathname).toBe("/main/de/pages/pagetree");
        expect(navigationType).toBe("POP");
    });

    it("should provide the scope of the URL", async () => {
        render(
            <Wrapper initialEntries={["/main/de/pages"]}>
                <ContentScopeProvider values={allowedScopes} defaultValue={allowedScopes[0].scope}>
                    {() => <ContentScopeApiSpy />}
                </ContentScopeProvider>
            </Wrapper>,
        );

        await waitFor(() => {
            expect(contentScopeApi?.scope).toEqual({ domain: "main", language: "de" });
        });
        expect(contentScopeApi?.match).toEqual({ params: { domain: "main", language: "de" }, url: "/main/de", isExact: false });
        expect(contentScopeApi?.supported).toBe(true);
    });

    it("should render the children as a route at the URL of the scope", async () => {
        function CurrentRoute({ name }: { name: string }) {
            const routeMatch = useCurrentRouteMatch();
            const params = useParams();
            return (
                <div>
                    {name}: {routeMatch?.url} {routeMatch?.pattern} {params.domain} {params.language}
                </div>
            );
        }

        render(
            <Wrapper initialEntries={["/main/de/pages/pagetree"]}>
                <ContentScopeProvider values={allowedScopes} defaultValue={allowedScopes[0].scope}>
                    {() => (
                        <>
                            <CurrentRoute name="Scope" />
                            <Routes>
                                <Route path="pages/*" element={<CurrentRoute name="Pages" />} />
                            </Routes>
                        </>
                    )}
                </ContentScopeProvider>
            </Wrapper>,
        );

        expect(await screen.findByText("Scope: /main/de /:domain/:language main de")).toBeTruthy();
        expect(screen.getByText("Pages: /main/de/pages /:domain/:language/pages main de")).toBeTruthy();
    });

    it("should navigate to the new scope and the redirect path when changing the scope", async () => {
        function RedirectPathAfterChange() {
            useContentScopeConfig({ redirectPathAfterChange: "/pages" });
            return null;
        }

        render(
            <Wrapper initialEntries={["/main/de/pages/pagetree"]}>
                <ContentScopeProvider values={allowedScopes} defaultValue={allowedScopes[0].scope}>
                    {() => (
                        <>
                            <RedirectPathAfterChange />
                            <ContentScopeApiSpy />
                        </>
                    )}
                </ContentScopeProvider>
            </Wrapper>,
        );
        await waitFor(() => {
            expect(contentScopeApi?.scope).toEqual({ domain: "main", language: "de" });
        });

        await act(async () => {
            contentScopeApi?.setScope(() => ({ domain: "main", language: "en" }));
        });

        await waitFor(() => {
            expect(location?.pathname).toBe("/main/en/pages");
        });
        expect(navigationType).toBe("PUSH");
        expect(contentScopeApi?.scope).toEqual({ domain: "main", language: "en" });
    });

    it("should support scopes with null values", async () => {
        const scopes = [{ scope: { domain: "main", language: null } }, { scope: { domain: "main", language: "de" } }];

        render(
            <Wrapper>
                <ContentScopeProvider values={scopes} defaultValue={scopes[0].scope}>
                    {() => <ContentScopeApiSpy />}
                </ContentScopeProvider>
            </Wrapper>,
        );

        await waitFor(() => {
            expect(location?.pathname).toBe("/main/-");
        });
        await waitFor(() => {
            expect(contentScopeApi?.scope).toEqual({ domain: "main", language: null });
        });
    });

    it("should match the paths of a custom location", async () => {
        const languageLocation: ContentScopeLocation = {
            createPath: (values) => [{ dimension: "language", values: values.map(({ scope }) => scope.language) }],
            createUrl: (scope) => `/${scope.language}`,
        };
        const languageScopes = [{ scope: { language: "en" } }, { scope: { language: "de" } }];

        render(
            <Wrapper initialEntries={["/de/pages"]}>
                <ContentScopeProvider values={languageScopes} defaultValue={languageScopes[0].scope} location={languageLocation}>
                    {() => <ContentScopeApiSpy />}
                </ContentScopeProvider>
            </Wrapper>,
        );

        await waitFor(() => {
            expect(contentScopeApi?.scope).toEqual({ language: "de" });
        });
        expect(contentScopeApi?.match.url).toBe("/de");
        expect(location?.pathname).toBe("/de/pages");

        await act(async () => {
            contentScopeApi?.setScope(() => ({ language: "en" }));
        });

        await waitFor(() => {
            expect(location?.pathname).toBe("/en");
        });
    });

    it("should keep the page of a menu route when changing the scope", async () => {
        function PageWithState() {
            useContentScopeConfig({ redirectPathAfterChange: "/page" });
            const [text, setText] = useState("initial");
            return (
                <>
                    <div>Text: {text}</div>
                    <button onClick={() => setText("changed")}>Change text</button>
                </>
            );
        }

        render(
            <Wrapper initialEntries={["/main/de/page"]}>
                <ContentScopeProvider values={allowedScopes} defaultValue={allowedScopes[0].scope}>
                    {() => (
                        <>
                            <ContentScopeApiSpy />
                            <MasterMenuRoutes
                                menu={[{ type: "route", primary: "Page", icon: undefined, route: { path: "/page", element: <PageWithState /> } }]}
                            />
                        </>
                    )}
                </ContentScopeProvider>
            </Wrapper>,
        );
        fireEvent.click(await screen.findByText("Change text"));
        expect(screen.getByText("Text: changed")).toBeTruthy();

        await act(async () => {
            contentScopeApi?.setScope(() => ({ domain: "main", language: "en" }));
        });

        await waitFor(() => {
            expect(location?.pathname).toBe("/main/en/page");
        });
        expect(screen.getByText("Text: changed")).toBeTruthy();
    });

    it("should use the URL of the route of the scope as URL of the match at an encoded URL", async () => {
        let childrenMatchUrl: string | undefined;
        let scopeRouteUrl: string | undefined;

        function ScopeRouteSpy() {
            scopeRouteUrl = useCurrentRouteMatch()?.url;
            return null;
        }

        render(
            <Wrapper initialEntries={["/%C3%BCber/de/pages"]}>
                <ContentScopeProvider values={scopesWithSpecialCharacters} defaultValue={scopesWithSpecialCharacters[1].scope}>
                    {({ match }) => {
                        childrenMatchUrl = match.url;
                        return (
                            <>
                                <ScopeRouteSpy />
                                <ContentScopeApiSpy />
                            </>
                        );
                    }}
                </ContentScopeProvider>
            </Wrapper>,
        );

        await waitFor(() => {
            expect(contentScopeApi?.scope).toEqual({ domain: "über", language: "de" });
        });
        // Memory history keeps the URLs of routes decoded
        expect(scopeRouteUrl).toBe("/über/de");
        expect(contentScopeApi?.match).toEqual({ params: { domain: "über", language: "de" }, url: "/über/de", isExact: false });
        expect(childrenMatchUrl).toBe("/über/de");
        expect(location?.pathname).toBe("/%C3%BCber/de/pages");
    });

    it("should keep the route when changing the scope at an encoded URL", async () => {
        render(
            <Wrapper initialEntries={["/%C3%BCber/de/page"]}>
                <ContentScopeProvider values={scopesWithSpecialCharacters} defaultValue={scopesWithSpecialCharacters[1].scope}>
                    {() => (
                        <>
                            <ContentScopeApiSpy />
                            <MasterMenuRoutes menu={menuWithPage} />
                        </>
                    )}
                </ContentScopeProvider>
            </Wrapper>,
        );
        expect(await screen.findByText("Route path: /page")).toBeTruthy();

        await act(async () => {
            contentScopeApi?.setScope(() => ({ domain: "main", language: "en" }));
        });

        await waitFor(() => {
            expect(location?.pathname).toBe("/main/en/page");
        });
        expect(screen.getByText("Route path: /page")).toBeTruthy();
    });

    it("should provide an empty scope outside of the provider", async () => {
        render(
            <Wrapper initialEntries={["/main/de"]}>
                <ContentScopeApiSpy />
            </Wrapper>,
        );

        await waitFor(() => {
            expect(contentScopeApi).toBeDefined();
        });
        expect(contentScopeApi?.scope).toEqual({});
        expect(contentScopeApi?.supported).toBe(false);
        expect(contentScopeApi?.match).toEqual({ params: {}, url: "/", isExact: false });
    });

    it("should provide an empty scope in a nested router", async () => {
        render(
            <Wrapper initialEntries={["/main/de"]}>
                <ContentScopeProvider values={allowedScopes} defaultValue={allowedScopes[0].scope}>
                    {() => (
                        <RouterMemoryRouter>
                            <ContentScopeApiSpy />
                        </RouterMemoryRouter>
                    )}
                </ContentScopeProvider>
            </Wrapper>,
        );

        await waitFor(() => {
            expect(contentScopeApi).toBeDefined();
        });
        expect(contentScopeApi?.scope).toEqual({});
        expect(contentScopeApi?.match).toEqual({ params: {}, url: "/", isExact: true });
        expect(location?.pathname).toBe("/main/de");
    });
});

describe("ContentScopeProvider in browser history", () => {
    let contentScopeApi: UseContentScopeApi | undefined;

    function ContentScopeApiSpy() {
        contentScopeApi = useContentScope();
        return null;
    }

    beforeEach(() => {
        localStorage.clear();
        contentScopeApi = undefined;
    });

    afterEach(() => {
        cleanup();
        window.history.replaceState(null, "", "/");
    });

    it.each([
        { url: "/%C3%BCber/de/page", scopeUrl: "/%C3%BCber/de" },
        { url: "/%c3%bcber/de/page", scopeUrl: "/%C3%BCber/de" },
        { url: "/main/d%65/page", scopeUrl: "/main/de" },
    ])("should keep the route when changing the scope at $url", async ({ url, scopeUrl }) => {
        window.history.replaceState(null, "", url);

        render(
            <CurrentUserProvider>
                <RouterBrowserRouter>
                    <ContentScopeProvider values={scopesWithSpecialCharacters} defaultValue={scopesWithSpecialCharacters[1].scope}>
                        {() => (
                            <>
                                <ContentScopeApiSpy />
                                <MasterMenuRoutes menu={menuWithPage} />
                            </>
                        )}
                    </ContentScopeProvider>
                </RouterBrowserRouter>
            </CurrentUserProvider>,
        );
        expect(await screen.findByText("Route path: /page")).toBeTruthy();
        // Browser history re-encodes the URLs of routes
        expect(contentScopeApi?.match.url).toBe(scopeUrl);

        await act(async () => {
            contentScopeApi?.setScope(() => ({ domain: "main", language: "en" }));
        });

        await waitFor(() => {
            expect(window.location.pathname).toBe("/main/en/page");
        });
        expect(screen.getByText("Route path: /page")).toBeTruthy();
    });
});
