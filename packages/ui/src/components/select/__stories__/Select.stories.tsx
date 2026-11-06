import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import fieldTokens from "../../field/_tokens.scss?raw";
import { Icon } from "../../icon/Icon";
import selectTokens from "../_tokens.scss?raw";
import { Select, type SelectOption, type SelectProps } from "../Select";
import styles from "./Select.stories.module.scss";

const locations: SelectOption[] = [
    { value: "vienna", label: "Vienna" },
    { value: "graz", label: "Graz" },
    { value: "linz", label: "Linz" },
    { value: "salzburg", label: "Salzburg" },
    { value: "remote", label: "Remote" },
];

const countries: SelectOption[] = [
    "Austria",
    "Belgium",
    "Croatia",
    "Czechia",
    "Denmark",
    "France",
    "Germany",
    "Hungary",
    "Italy",
    "Liechtenstein",
    "Netherlands",
    "Poland",
    "Slovakia",
    "Slovenia",
    "Spain",
    "Switzerland",
].map((country) => ({ value: country.toLowerCase(), label: country }));

const channels: SelectOption[] = [
    { value: "web", label: "Website", icon: <Icon name="globe" /> },
    { value: "mail", label: "Newsletter", icon: <Icon name="mail" /> },
    { value: "phone", label: "App", icon: <Icon name="phone" /> },
    { value: "print", label: "Print", icon: <Icon name="page" />, disabled: true },
];

/** Keeps the story controlled: choosing updates the local value; changing the `value` control starts over from it. */
function ControlledSelect(props: SelectProps<boolean>) {
    const [value, setValue] = useState(props.value);
    return (
        <div className={styles.narrow}>
            <Select
                {...props}
                value={value}
                onChange={(next) => {
                    props.onChange(next);
                    setValue(next);
                }}
            />
        </div>
    );
}

function ControlledMultipleSelect(
    props: Omit<SelectProps<true>, "value" | "onChange"> & { initialValue: string[]; onChange: (value: string[]) => void },
) {
    const { initialValue, onChange, ...rest } = props;
    const [value, setValue] = useState(initialValue);
    return (
        <div className={styles.narrow}>
            <Select
                {...rest}
                value={value}
                onChange={(next) => {
                    onChange(next);
                    setValue(next);
                }}
            />
        </div>
    );
}

const meta = {
    component: Select,
    title: "Building blocks/Form fields/Select",
    decorators: [themeDecorator],
    parameters: { tokens: `${selectTokens}\n${fieldTokens}` },
    render: (args) => <ControlledSelect key={String(args.value)} {...args} />,
    args: {
        name: "location",
        label: "Location",
        options: locations,
        value: "vienna",
        onChange: fn(),
    },
    argTypes: {
        state: { control: "select", options: ["default", "success", "warning", "error"] },
        size: { control: "radio", options: ["small", "default", "large"] },
        value: { control: "select", options: [null, ...locations.map((location) => location.value)] },
        options: { control: false },
        multiple: { control: false },
        actions: { control: false },
        prefix: { control: false },
        suffix: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
} satisfies Meta<typeof Select>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 * - Always controlled: `value` + `onChange`; `null` means nothing is chosen.
 * - From about 10 options, add `searchable`.
 * - For 2 to 4 options that are always visible, use a segmented control instead.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const trigger = canvas.getByRole("combobox", { name: /Location/ });
        await expect(trigger).toHaveTextContent("Vienna");
        await userEvent.click(trigger);
        await userEvent.click(await screen.findByRole("option", { name: "Graz" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith("graz"));
        await waitFor(() => expect(trigger).toHaveTextContent("Graz"));
    },
};

export const Placeholder: Story = {
    args: {
        value: null,
        placeholder: "Choose a location",
    },
};

/**
 * The arrow keys move through the options; Enter chooses.
 */
export const Keyboard: Story = {
    play: async ({ args, canvas }) => {
        const trigger = canvas.getByRole("combobox");
        trigger.focus();
        await userEvent.keyboard("{ArrowDown}");
        const listbox = await screen.findByRole("listbox");
        // Opening highlights the first option asynchronously; moving on before that would highlight it instead of the next one
        await waitFor(() => expect(within(listbox).getByRole("option", { name: "Vienna" })).toHaveAttribute("data-highlighted"));
        await userEvent.keyboard("{ArrowDown}");
        await waitFor(() => expect(within(listbox).getByRole("option", { name: "Graz" })).toHaveAttribute("data-highlighted"));
        await userEvent.keyboard("{Enter}");
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith("graz"));
    },
};

/**
 * Options can have an icon and be disabled.
 */
export const IconsAndDisabledOptions: Story = {
    args: {
        name: "channel",
        label: "Channel",
        options: channels,
        value: "web",
    },
};

/**
 * With `multiple`, the value is a list and the chosen options show as chips. A chip's button removes it.
 */
export const Multiple: Story = {
    render: (args) => (
        <ControlledMultipleSelect
            name="locations"
            label="Locations"
            options={locations}
            initialValue={["vienna", "remote"]}
            placeholder="Choose locations"
            onChange={args.onChange as (value: string[]) => void}
            multiple
        />
    ),
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Remove Remote" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(["vienna"]));
        await userEvent.click(canvas.getByRole("combobox"));
        await userEvent.click(await screen.findByRole("option", { name: "Linz" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(["vienna", "linz"]));
    },
};

/**
 * `searchable` adds a search to the menu.
 */
export const Searchable: Story = {
    args: {
        name: "country",
        label: "Country",
        options: countries,
        value: "austria",
        searchable: true,
    },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("combobox", { name: /Country/ }));
        const popup = await screen.findByRole("dialog");
        await userEvent.type(within(popup).getByRole("combobox"), "slo");
        await waitFor(() => expect(screen.getAllByRole("option").map((option) => option.textContent)).toStrictEqual(["Slovakia", "Slovenia"]));
        await userEvent.click(screen.getByRole("option", { name: "Slovenia" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith("slovenia"));
    },
};

export const SearchableMultiple: Story = {
    render: (args) => (
        <ControlledMultipleSelect
            name="countries"
            label="Countries"
            options={countries}
            initialValue={["austria", "germany", "switzerland"]}
            onChange={args.onChange as (value: string[]) => void}
            multiple
            searchable
        />
    ),
};

export const Error: Story = {
    args: {
        value: null,
        required: true,
        placeholder: "Choose a location",
        state: "error",
        validationMessage: "Choose where the job is based.",
    },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("combobox")).toHaveAccessibleDescription("Choose where the job is based.");
    },
};

export const Disabled: Story = {
    args: {
        disabled: true,
    },
};

export const ReadOnly: Story = {
    args: {
        readOnly: true,
    },
};

export const Small: Story = {
    args: {
        size: "small",
    },
};
