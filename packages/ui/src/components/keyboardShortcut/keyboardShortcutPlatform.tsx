import { createContext, type ReactNode, useContext, useMemo, useSyncExternalStore } from "react";

import type { KeyboardShortcutLabels } from "./formatShortcut";

/**
 * Which keys a shortcut's `mod` and `alt` stand for: ⌘ and ⌥ on `apple` platforms, Ctrl and Alt on `other` platforms.
 */
export type KeyboardShortcutPlatform = "apple" | "other";

/**
 * Whether the platform uses ⌘ (Apple devices) rather than Ctrl as the shortcut modifier. Without a browser, e.g. while rendering on the
 * server, it is `false`.
 */
export function isApplePlatform(): boolean {
    if (typeof navigator === "undefined") {
        return false;
    }
    return /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
}

interface KeyboardShortcutContextValue {
    platform?: KeyboardShortcutPlatform;
    labels?: Partial<KeyboardShortcutLabels>;
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextValue>({});

export interface KeyboardShortcutProviderProps {
    /** Shows and matches shortcuts for this platform instead of the detected one, e.g. in tests or screenshots. */
    platform?: KeyboardShortcutPlatform;
    /** The spoken names of keys for every `KeyboardShortcut` inside, e.g. translated ones. */
    labels?: Partial<KeyboardShortcutLabels>;
    children: ReactNode;
}

/**
 * Sets the platform and the spoken key names for the keyboard shortcuts inside: the key caps of `KeyboardShortcut` and of every
 * component's `shortcut`, and the keys `useKeyboardShortcut` listens to.
 */
export function KeyboardShortcutProvider({ platform, labels, children }: KeyboardShortcutProviderProps) {
    const parent = useContext(KeyboardShortcutContext);
    const value = useMemo(
        () => ({ platform: platform ?? parent.platform, labels: { ...parent.labels, ...labels } }),
        [platform, labels, parent.platform, parent.labels],
    );
    return <KeyboardShortcutContext.Provider value={value}>{children}</KeyboardShortcutContext.Provider>;
}

function subscribeToPlatform() {
    return () => {};
}

function getPlatform(): KeyboardShortcutPlatform {
    return isApplePlatform() ? "apple" : "other";
}

// The server can't know the platform. Rendering `other` first on the client too keeps hydration consistent, then the detected platform
// takes over.
function getServerPlatform(): KeyboardShortcutPlatform {
    return "other";
}

/**
 * The platform keyboard shortcuts are shown and matched for: the given one, else the one of the nearest `KeyboardShortcutProvider`,
 * else the detected one. It is safe for server rendering: the server and the first render on the client use `other`, and the detected
 * platform applies right after hydration.
 */
export function useKeyboardShortcutPlatform(platform?: KeyboardShortcutPlatform): KeyboardShortcutPlatform {
    const context = useContext(KeyboardShortcutContext);
    const detectedPlatform = useSyncExternalStore(subscribeToPlatform, getPlatform, getServerPlatform);
    return platform ?? context.platform ?? detectedPlatform;
}

export function useKeyboardShortcutLabels(labels?: Partial<KeyboardShortcutLabels>): Partial<KeyboardShortcutLabels> | undefined {
    const context = useContext(KeyboardShortcutContext);
    return labels == null ? context.labels : { ...context.labels, ...labels };
}
