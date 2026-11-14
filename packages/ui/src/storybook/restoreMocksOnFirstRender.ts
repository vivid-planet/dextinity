import { restoreAllMocks } from "storybook/test";

const firstRenders = new WeakSet<AbortSignal>();

/**
 * Restores the mocks, e.g. the `fn()` callbacks in a story's args, before a story renders for the first time. Replaces Storybook's own
 * reset, which `parameters.test.restoreMocks: false` turns off: it also runs when a story re-renders with changed args, e.g. after
 * `useControlledArg` wrote a change on the canvas back while a play function runs, and would clear the calls the play function then
 * checks. A re-render keeps the render's abort signal; a new render or a remount gets a new one.
 */
export function restoreMocksOnFirstRender({ abortSignal }: { abortSignal: AbortSignal }) {
    if (!firstRenders.has(abortSignal)) {
        firstRenders.add(abortSignal);
        restoreAllMocks();
    }
}
