import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { ScopeSwitcher, type ScopeSwitcherDimension, type ScopeSwitcherProps } from "../ScopeSwitcher";
import scopeSwitcherTokens from "../ScopeSwitcher.tokens.scss?raw";
import styles from "./ScopeSwitcher.stories.module.scss";

const countries: ScopeSwitcherDimension = {
    key: "country",
    label: "Country",
    options: [
        { value: "at", label: "Austria", shortLabel: "AT" },
        { value: "de", label: "Germany", shortLabel: "DE" },
        { value: "ch", label: "Switzerland", shortLabel: "CH" },
    ],
};

const languages: ScopeSwitcherDimension = {
    key: "language",
    label: "Language",
    options: [
        { value: "de", label: "German", shortLabel: "de" },
        { value: "en", label: "English", shortLabel: "en" },
        { value: "fr", label: "French", shortLabel: "fr" },
        { value: "it", label: "Italian", shortLabel: "it" },
    ],
};

const areas: ScopeSwitcherDimension = {
    key: "area",
    label: "Area",
    options: [
        { value: "careers", label: "Careers" },
        { value: "corporate", label: "Corporate" },
        { value: "investors", label: "Investors" },
    ],
};

function ControlledScopeSwitcher(props: ScopeSwitcherProps) {
    const [value, setValue] = useState(props.value);
    const [open, setOpen] = useState(props.open);
    return (
        <ScopeSwitcher
            {...props}
            value={value}
            onChange={(nextValue) => {
                setValue(nextValue);
                props.onChange(nextValue);
            }}
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);
                props.onOpenChange(nextOpen);
            }}
        />
    );
}

const meta = {
    component: ScopeSwitcher,
    title: "Shell/Top bar & scope/ScopeSwitcher",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: scopeSwitcherTokens },
    render: (args) => <ControlledScopeSwitcher {...args} />,
    args: {
        dimensions: [countries, languages],
        value: ["at", "de"],
        onChange: fn(),
        open: false,
        onOpenChange: fn(),
    },
    argTypes: {
        searchable: { control: "boolean" },
        placement: { control: "select", options: ["bottom-start", "bottom-end", "top-start", "top-end"] },
        dimensions: { control: false },
        recent: { control: false },
        labels: { control: false },
        className: { control: false },
    },
} satisfies Meta<typeof ScopeSwitcher>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The global scope in the top bar: one column per dimension; arrow keys move within a column.
 *
 * **Rules**
 *
 * - The scope is always visible, also while editing, and global for all screens.
 * - Don't add a second scope picker inside a screen.
 * - Ask before switching when there are unsaved changes; the content then fades over in place.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Change scope: Austria · German" }));
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(true));
        const french = await screen.findByRole("radio", { name: /French/ });
        await userEvent.click(french);
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(["at", "fr"]));
        await expect(french).toHaveAttribute("aria-checked", "true");
        await userEvent.keyboard("{ArrowDown}");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(["at", "it"]));
    },
};

/**
 * The search finds across all dimensions: "ch fr" finds Switzerland · French. Enter picks the first result and closes the picker.
 */
export const Search: Story = {
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: /Change scope/ }));
        const search = await screen.findByRole("searchbox", { name: "Search scopes" });
        await userEvent.type(search, "ch fr");
        await waitFor(() => expect(screen.getByRole("button", { name: "Switzerland · French" })).toBeVisible());
        await userEvent.keyboard("{Enter}");
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(["ch", "fr"]));
        await waitFor(() => expect(args.onOpenChange).toHaveBeenLastCalledWith(false));
        await waitFor(() => expect(canvas.getByRole("button", { name: "Change scope: Switzerland · French" })).toBeVisible());
    },
};

/**
 * Recently used scopes at the bottom switch with one click.
 */
export const Recent: Story = {
    args: {
        open: true,
        recent: [
            ["de", "de"],
            ["ch", "fr"],
            ["ch", "it"],
        ],
    },
};

/**
 * A third dimension, e.g. the area of a multi-site installation.
 */
export const ThreeDimensions: Story = {
    args: {
        open: true,
        dimensions: [areas, countries, languages],
        value: ["careers", "at", "de"],
    },
};

/**
 * Without the search, for few scopes.
 */
export const WithoutSearch: Story = {
    args: {
        open: true,
        searchable: false,
    },
};
