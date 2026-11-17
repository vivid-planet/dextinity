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

    it("formats dates and times", async () => {
        const { setServerIntl, ServerFormattedDate, ServerFormattedDateTimeRange, ServerFormattedTime } = await importServerIntl();
        setServerIntl("de", {});
        const date = new Date(Date.UTC(2026, 10, 9, 14, 30));

        expect(renderToStaticMarkup(<ServerFormattedDate value={date} dateStyle="medium" timeZone="UTC" />)).toBe("09.11.2026");
        expect(renderToStaticMarkup(<ServerFormattedTime value={date} timeZone="UTC" />)).toBe("14:30");
        expect(
            renderToStaticMarkup(
                <ServerFormattedDateTimeRange from={date} to={new Date(Date.UTC(2026, 10, 12))} day="numeric" month="long" timeZone="UTC" />,
            ),
        ).toBe("9.–12. November");
    });

    it("formats numbers, plurals, lists, display names and durations", async () => {
        const {
            setServerIntl,
            ServerFormattedDisplayName,
            ServerFormattedDuration,
            ServerFormattedList,
            ServerFormattedNumber,
            ServerFormattedPlural,
        } = await importServerIntl();
        setServerIntl("en", {});

        expect(renderToStaticMarkup(<ServerFormattedNumber value={1234.5} style="currency" currency="EUR" />)).toBe("€1,234.50");
        expect(renderToStaticMarkup(<ServerFormattedPlural value={1} one="item" other="items" />)).toBe("item");
        expect(renderToStaticMarkup(<ServerFormattedPlural value={2} one="item" other="items" />)).toBe("items");
        expect(renderToStaticMarkup(<ServerFormattedList value={["a", "b", "c"]} type="conjunction" />)).toBe("a, b, and c");
        expect(renderToStaticMarkup(<ServerFormattedDisplayName value="de" type="language" />)).toBe("German");
        expect(renderToStaticMarkup(<ServerFormattedDuration value={{ hours: 1, minutes: 30 }} style="long" />)).toBe("1 hour, 30 minutes");
    });
});
