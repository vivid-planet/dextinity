import type { Decorator } from "@storybook/react-vite";

import { describeKeyboardShortcut, formatKeyboardShortcutText } from "../components/keyboardShortcut/formatKeyboardShortcut";
import { isApplePlatform, KeyboardShortcutProvider } from "../components/keyboardShortcut/keyboardShortcutPlatform";
import { keyboardPlatformSetting } from "./keyboardPlatform";

/**
 * Whether the stories show and match shortcuts for Apple platforms, following the toolbar. For play functions, e.g. to press `mod`.
 */
function isStoryApplePlatform() {
    const platform = keyboardPlatformSetting.get();
    return platform === "detected" ? isApplePlatform() : platform === "apple";
}

/**
 * The key `mod` stands for in the stories, as `userEvent.keyboard` names it.
 */
export function storyModKey() {
    return isStoryApplePlatform() ? "Meta" : "Control";
}

/**
 * The text content of a `KeyboardShortcut` with `shortcut` in the stories: the key caps, then the spoken name.
 */
export function storyKeyboardShortcutText(shortcut: string) {
    const apple = isStoryApplePlatform();
    return `${formatKeyboardShortcutText(shortcut, apple)}${describeKeyboardShortcut(shortcut, apple)}`;
}

export const keyboardPlatformDecorator: Decorator = (Story) => {
    const platform = keyboardPlatformSetting.useValue();
    return (
        <KeyboardShortcutProvider platform={platform === "detected" ? undefined : platform}>
            <Story />
        </KeyboardShortcutProvider>
    );
};
