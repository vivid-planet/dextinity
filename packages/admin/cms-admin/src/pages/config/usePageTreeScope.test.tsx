import { MockedProvider } from "@apollo/client/testing";
import { RouterMemoryRouter } from "@dextinity/admin";
import type { ReactNode } from "react";
import { renderHook } from "test-utils";
import { describe, expect, it } from "vitest";

import { type DextinityConfig, DextinityConfigProvider } from "../../config/DextinityConfigContext";
import { ContentScopeProvider } from "../../contentScope/Provider";
import { CurrentUserContext } from "../../userPermissions/hooks/currentUser";
import type { PageTreeConfig } from "../pageTreeConfig";
import { usePageTreeScope } from "./usePageTreeScope";

describe("usePageTreeScope", () => {
    function Providers({ children }: { children: ReactNode }) {
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
                    <RouterMemoryRouter>
                        <ContentScopeProvider
                            values={[{ scope: { domain: "main", language: "en" } }]}
                            defaultValue={{ domain: "main", language: "en" }}
                        >
                            {() => <>{children}</>}
                        </ContentScopeProvider>
                    </RouterMemoryRouter>
                </CurrentUserContext.Provider>
            </MockedProvider>
        );
    }

    const baseDextinityConfig = {} as DextinityConfig;
    const basePageTreeConfig = {} as PageTreeConfig;

    it("should work with CmsBlockContextProvider", () => {
        const { result } = renderHook(() => usePageTreeScope(), {
            wrapper: ({ children }) => (
                <Providers>
                    <DextinityConfigProvider {...baseDextinityConfig}>{children}</DextinityConfigProvider>
                </Providers>
            ),
        });

        expect(result.current).toEqual({ domain: "main", language: "en" });
    });

    it("should work for a single dimension", () => {
        const { result } = renderHook(() => usePageTreeScope(), {
            wrapper: ({ children }) => (
                <Providers>
                    <DextinityConfigProvider {...baseDextinityConfig} pageTree={{ ...basePageTreeConfig, scopeParts: ["domain"] }}>
                        {children}
                    </DextinityConfigProvider>
                </Providers>
            ),
        });

        expect(result.current).toEqual({ domain: "main" });
    });

    it("should work for multiple dimensions", () => {
        const { result } = renderHook(() => usePageTreeScope(), {
            wrapper: ({ children }) => (
                <Providers>
                    <DextinityConfigProvider {...baseDextinityConfig} pageTree={{ ...basePageTreeConfig, scopeParts: ["domain", "language"] }}>
                        {children}
                    </DextinityConfigProvider>
                </Providers>
            ),
        });

        expect(result.current).toEqual({ domain: "main", language: "en" });
    });

    it("should work for no dimensions", () => {
        const { result } = renderHook(() => usePageTreeScope(), {
            wrapper: ({ children }) => (
                <Providers>
                    <DextinityConfigProvider {...baseDextinityConfig} pageTree={{ ...basePageTreeConfig, scopeParts: [] }}>
                        {children}
                    </DextinityConfigProvider>
                </Providers>
            ),
        });

        expect(result.current).toEqual({});
    });

    it("should ignore unknown dimensions", () => {
        const { result } = renderHook(() => usePageTreeScope(), {
            wrapper: ({ children }) => (
                <Providers>
                    <DextinityConfigProvider {...baseDextinityConfig} pageTree={{ ...basePageTreeConfig, scopeParts: ["domain", "unknown"] }}>
                        {children}
                    </DextinityConfigProvider>
                </Providers>
            ),
        });

        expect(result.current).toEqual({ domain: "main" });
    });
});
