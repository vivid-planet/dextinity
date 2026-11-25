import { useIntl } from "react-intl";

export const shortcutKey = "K";

const isApplePlatform = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.userAgent);

export function useShortcutModifierKey(): { label: string; ariaKeyName: "Meta" | "Control" } {
    const intl = useIntl();

    if (isApplePlatform) {
        return { label: "⌘", ariaKeyName: "Meta" };
    }

    return { label: intl.formatMessage({ id: "dextinity.fullTextSearch.controlKey", defaultMessage: "Ctrl" }), ariaKeyName: "Control" };
}
