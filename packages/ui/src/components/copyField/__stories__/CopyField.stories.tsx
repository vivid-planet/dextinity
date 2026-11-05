import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import copyFieldTokens from "../_tokens.scss?raw";
import { CopyField } from "../CopyField";
import styles from "./CopyField.stories.module.scss";

const meta = {
    component: CopyField,
    title: "Building blocks/Panels, cards & metrics/CopyField",
    decorators: [themeDecorator],
    parameters: { tokens: copyFieldTokens },
    // The test browser denies clipboard access, so the stories write to a stub instead
    beforeEach: () => {
        Object.defineProperty(navigator, "clipboard", { value: { writeText: fn(async () => undefined) }, configurable: true });
        return () => {
            delete (navigator as { clipboard?: unknown }).clipboard;
        };
    },
    args: {
        value: "example.com/careers",
        labels: { copy: "Copy path" },
        onCopy: fn(),
    },
    argTypes: {
        className: { control: false },
        slotProps: { control: false },
        labels: { control: false },
    },
} satisfies Meta<typeof CopyField>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Click copies the value; the button confirms with a check and announces "Copied".
 *
 * **Rules**
 *
 * - Name what is copied in the button's label, e.g. "Copy path".
 * - Show the value in full where there is room; it is cut off with an ellipsis only in narrow places.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Copy path" }));
        await waitFor(() => expect(args.onCopy).toHaveBeenCalledWith("example.com/careers"));
        await expect(canvas.getByRole("button", { name: "Copied" })).toBeInTheDocument();
        await expect(canvas.getByRole("status")).toHaveTextContent("Copied");
    },
};

/**
 * Long values are cut off with an ellipsis; the full value is the tooltip of the text.
 */
export const Truncated: Story = {
    args: { value: "example.com/careers/open-positions/senior-frontend-developer" },
    decorators: [
        (Story) => (
            <div className={styles.narrow}>
                <Story />
            </div>
        ),
    ],
};

/**
 * Enter on the focused button copies the value.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByRole("button", { name: "Copy path" })).toHaveFocus();
        await userEvent.keyboard("{Enter}");
        await waitFor(() => expect(args.onCopy).toHaveBeenCalled());
    },
};
