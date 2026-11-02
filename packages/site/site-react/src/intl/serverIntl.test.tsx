import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// React's `cache` only memoizes within a server component render, so memoize per test to emulate a single request
vi.mock("react", async (importOriginal) => {
    const actual = await importOriginal<typeof import("react")>();

    return {
        ...actual,
        cache: <T,>(fn: () => T) => {
            let value: T | undefined;
            return () => (value ??= fn());
        },
    };
});

async function importServerIntl() {
    return import("./serverIntl");
}

describe("serverIntl", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it("throws when setServerIntl wasn't called", async () => {
        const { useServerIntl } = await importServerIntl();

        expect(() => useServerIntl()).toThrow(/setServerIntl/);
    });

    it("formats a message with values", async () => {
        const { setServerIntl, useServerIntl } = await importServerIntl();
        setServerIntl("en", { greeting: "Hello {name}" });

        expect(useServerIntl().formatMessage({ id: "greeting", defaultMessage: "Hi {name}" }, { name: "World" })).toBe("Hello World");
    });

    it("falls back to the default message", async () => {
        const { setServerIntl, ServerFormattedMessage } = await importServerIntl();
        setServerIntl("en", {});

        const html = renderToStaticMarkup(<ServerFormattedMessage id="missing" defaultMessage="Default {count}" values={{ count: 3 }} />);

        expect(html).toBe("Default 3");
    });

    it("renders rich-text tags", async () => {
        const { setServerIntl, ServerFormattedMessage } = await importServerIntl();
        setServerIntl("en", { terms: "Accept the <link>terms</link> and <strong>privacy</strong>" });

        const html = renderToStaticMarkup(
            <ServerFormattedMessage
                id="terms"
                defaultMessage="Accept the <link>terms</link>"
                values={{
                    link: (chunks) => <a href="/terms">{chunks}</a>,
                    strong: (chunks) => <strong>{chunks}</strong>,
                }}
            />,
        );

        expect(html).toBe('Accept the <a href="/terms">terms</a> and <strong>privacy</strong>');
    });
});
