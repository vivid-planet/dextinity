import { act, renderHook } from "test-utils";
import { describe, expect, it, vi } from "vitest";

import { useStoredState } from "../useStoredState";

function stored<T>(value: T): string {
    return JSON.stringify(value);
}

function fromStorage<T>(storage: Storage, key: string): T {
    return JSON.parse(storage.getItem(key) as string) as T;
}

function createMockStorage(initial: Record<string, string> = {}): Storage {
    const store: Record<string, string> = { ...initial };
    return {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => {
            store[key] = value;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            Object.keys(store).forEach((k) => delete store[k]);
        },
        get length() {
            return Object.keys(store).length;
        },
        key: (index: number) => Object.keys(store)[index] ?? null,
    };
}

describe("useStoredState", () => {
    it("returns the initial value when no stored value exists", () => {
        const storage = createMockStorage();
        const { result } = renderHook(() => useStoredState("my-key", "hello", storage));
        const [value] = result.current;
        expect(value).toBe("hello");
    });

    it("returns the stored value when localStorage already has a value", () => {
        const storage = createMockStorage({ "my-key": stored("stored") });
        const { result } = renderHook(() => useStoredState("my-key", "default", storage));
        const [value] = result.current;
        expect(value).toBe("stored");
    });

    it("persists state updates to storage", () => {
        const storage = createMockStorage();
        const { result } = renderHook(() => useStoredState<string>("my-key", "initial", storage));

        act(() => {
            const [, setValue] = result.current;
            setValue("updated");
        });

        const [value] = result.current;
        expect(value).toBe("updated");
        expect(fromStorage<string>(storage, "my-key")).toBe("updated");
    });

    it("skips storage when key is false", () => {
        const storage = createMockStorage();
        const { result } = renderHook(() => useStoredState<string>(false, "default-value", storage));

        const [initialValue] = result.current;
        expect(initialValue).toBe("default-value");

        act(() => {
            const [, setValue] = result.current;
            setValue("changed");
        });

        const [updatedValue] = result.current;
        expect(updatedValue).toBe("changed");
        expect(storage.length).toBe(0);
    });

    it("falls back to initial value when stored JSON is malformed", () => {
        const storage = createMockStorage({ "bad-key": "{ not valid json" });
        const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);

        const { result } = renderHook(() => useStoredState("bad-key", 42, storage));
        const [value] = result.current;

        expect(value).toBe(42);
        expect(consoleSpy).toHaveBeenCalled();
    });

    it("accepts an initializer function instead of a plain value", () => {
        const storage = createMockStorage();
        const init = vi.fn(() => "computed");
        const { result } = renderHook(() => useStoredState("fn-key", init, storage));
        const [value] = result.current;

        expect(value).toBe("computed");
        expect(init).toHaveBeenCalledOnce();
    });

    it("does NOT call the initializer function when a stored value exists", () => {
        const storage = createMockStorage({ "fn-key": stored("from-storage") });
        const init = vi.fn(() => "computed");
        const { result } = renderHook(() => useStoredState("fn-key", init, storage));
        const [value] = result.current;

        expect(value).toBe("from-storage");
        expect(init).not.toHaveBeenCalled();
    });

    it("correctly returns stored boolean false (truthy string 'false' parses to false)", () => {
        const storage = createMockStorage({ "bool-key": stored(false) });
        const { result } = renderHook(() => useStoredState("bool-key", true, storage));
        const [value] = result.current;
        expect(value).toBe(false);
    });

    it("works with complex object values", () => {
        const storage = createMockStorage();
        const initial = { count: 0, labels: ["a", "b"] };
        const { result } = renderHook(() => useStoredState("obj-key", initial, storage));

        const updated = { count: 1, labels: ["a", "b", "c"] };
        act(() => {
            const [, setValue] = result.current;
            setValue(updated);
        });

        const [value] = result.current;
        expect(value).toEqual(updated);
        expect(fromStorage<typeof updated>(storage, "obj-key")).toEqual(updated);
    });
});
