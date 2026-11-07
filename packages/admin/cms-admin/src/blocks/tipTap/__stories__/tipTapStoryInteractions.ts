import { expect, waitFor, within } from "storybook/test";

type UserEvent = { click: (element: Element) => Promise<void>; keyboard: (text: string) => Promise<void> };
type Canvas = { getByRole: (role: "textbox") => HTMLElement };

const menuTimeout = { timeout: 3000 };

/**
 * Chooses an entry of the open toolbar menu and waits until the toolbar has applied it: the menu applies its choice only after it
 * has closed, and then hands the focus to the editor. Without waiting, the next keystroke or menu could reach the trigger or be closed
 * by the late focus change - which made the story tests flaky under load.
 */
export async function chooseMenuItem(
    { canvas, userEvent }: { canvas: Canvas; userEvent: UserEvent },
    role: "menuitem" | "menuitemradio" | "menuitemcheckbox",
    name: string,
    { focusesEditor = true }: { focusesEditor?: boolean } = {},
) {
    await userEvent.click(await within(document.body).findByRole(role, { name }));
    await waitFor(() => {
        expect(within(document.body).queryByRole("menu")).toBeNull();
        if (focusesEditor) {
            expect(canvas.getByRole("textbox")).toHaveFocus();
        }
    }, menuTimeout);
}

/** Closes the open toolbar menu with Escape and waits until it's gone, so the next interaction doesn't race its closing. */
export async function closeMenu(userEvent: UserEvent) {
    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
        expect(within(document.body).queryByRole("menu")).toBeNull();
    }, menuTimeout);
}
