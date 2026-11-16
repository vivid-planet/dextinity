import { expect } from "storybook/test";

/**
 * Checks that a popup, e.g. a dialog, is still open after an interaction that must not close it. Waits first, so a close that
 * happens after the interaction has set the popup's closing state by the time of the check.
 */
export async function expectPopupStaysOpen(popup: HTMLElement) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    await expect(popup).toBeInTheDocument();
    await expect(popup).toHaveAttribute("data-open");
    await expect(popup).not.toHaveAttribute("data-closed");
    await expect(popup).not.toHaveAttribute("data-ending-style");
}
