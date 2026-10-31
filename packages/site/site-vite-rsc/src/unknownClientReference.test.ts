import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { shouldReloadForUnknownClientReference } from "./unknownClientReference.js";

const unknownClientReferenceError = new Error("client reference not found '6b6c47c6258d'");

describe("shouldReloadForUnknownClientReference", () => {
    beforeEach(() => {
        sessionStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it("reloads for unknown client references", () => {
        expect(shouldReloadForUnknownClientReference(unknownClientReferenceError)).toBe(true);
    });

    it("doesn't reload for other errors", () => {
        expect(shouldReloadForUnknownClientReference(new Error("Client component failed"))).toBe(false);
        expect(shouldReloadForUnknownClientReference("client reference not found 'id'")).toBe(false);
    });

    it("doesn't reload again shortly after a reload", () => {
        shouldReloadForUnknownClientReference(unknownClientReferenceError);
        vi.advanceTimersByTime(9_000);

        expect(shouldReloadForUnknownClientReference(unknownClientReferenceError)).toBe(false);
    });

    it("reloads again later", () => {
        shouldReloadForUnknownClientReference(unknownClientReferenceError);
        vi.advanceTimersByTime(11_000);

        expect(shouldReloadForUnknownClientReference(unknownClientReferenceError)).toBe(true);
    });

    it("doesn't reload without storage, as it couldn't prevent a reload loop", () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("Storage is disabled");
        });

        expect(shouldReloadForUnknownClientReference(unknownClientReferenceError)).toBe(false);
    });
});
