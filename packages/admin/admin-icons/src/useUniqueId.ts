import useConstant from "use-constant";

/**
 * A stable unique id for the lifetime of one component instance.
 *
 * React's `useId` isn't used here because this package still supports React 17.
 */
export function useUniqueId(prefix: string) {
    return useConstant(() => `${prefix}-${crypto.randomUUID()}`);
}
