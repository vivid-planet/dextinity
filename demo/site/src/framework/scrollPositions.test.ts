import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    createHistoryState,
    getHistoryKey,
    getRememberedScrollPosition,
    loadPersistedScrollPositions,
    persistScrollPositions,
    rememberScrollPosition,
} from "./scrollPositions";

describe("getHistoryKey", () => {
    it("returns the key of a history state", () => {
        const state = createHistoryState();

        expect(getHistoryKey(state)).toBe(state.key);
    });

    it.each([null, undefined, "key", {}, { key: 1 }])("returns undefined for the history state %j", (state) => {
        expect(getHistoryKey(state)).toBeUndefined();
    });
});

describe("createHistoryState", () => {
    it("creates a new key for each history entry", () => {
        expect(createHistoryState().key).not.toBe(createHistoryState().key);
    });
});

describe("scroll positions", () => {
    beforeEach(() => {
        sessionStorage.clear();
        vi.restoreAllMocks();
    });

    it("remembers the scroll position per history key", () => {
        rememberScrollPosition("first", 100);
        rememberScrollPosition("second", 200);

        expect(getRememberedScrollPosition("first")).toBe(100);
        expect(getRememberedScrollPosition("second")).toBe(200);
        expect(getRememberedScrollPosition("unknown")).toBeUndefined();
    });

    it("persists the scroll positions in the session storage", () => {
        rememberScrollPosition("persisted", 300);
        persistScrollPositions();

        expect(JSON.parse(sessionStorage.getItem("scrollPositions") ?? "{}")).toMatchObject({ persisted: 300 });
    });

    it("loads the persisted scroll positions, e.g., after a reload", () => {
        sessionStorage.setItem("scrollPositions", JSON.stringify({ reloaded: 400 }));
        loadPersistedScrollPositions();

        expect(getRememberedScrollPosition("reloaded")).toBe(400);
    });

    it("ignores invalid persisted scroll positions", () => {
        sessionStorage.setItem("scrollPositions", JSON.stringify({ invalid: "100", valid: 500 }));
        loadPersistedScrollPositions();

        expect(getRememberedScrollPosition("invalid")).toBeUndefined();
        expect(getRememberedScrollPosition("valid")).toBe(500);
    });

    it.each(["not json", "null", "[1]"])("ignores the persisted value %j", (value) => {
        sessionStorage.setItem("scrollPositions", value);

        expect(() => loadPersistedScrollPositions()).not.toThrow();
    });

    it("works without storage", () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("SecurityError");
        });
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new Error("SecurityError");
        });

        expect(() => persistScrollPositions()).not.toThrow();
        expect(() => loadPersistedScrollPositions()).not.toThrow();
    });
});
