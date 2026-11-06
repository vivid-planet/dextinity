import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Dialog } from "../../dialog/Dialog";
import fieldTokens from "../../field/Field.tokens.scss?raw";
import { Icon } from "../../icon/Icon";
import { Select, type SelectOption, type SelectProps } from "../Select";
import selectTokens from "../Select.tokens.scss?raw";
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
    { value: "web", label: "Website", icon: <Icon name="domain" /> },
    { value: "mail", label: "Newsletter", icon: <Icon name="letter" /> },
    { value: "phone", label: "App", icon: <Icon name="device-phone" /> },
    { value: "print", label: "Print", icon: <Icon name="file" />, disabled: true },
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
    render: (args) => <ControlledSelect key={String(args.value)} {...(args as SelectProps<boolean>)} />,
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
        const vienna = within(listbox).getByRole("option", { name: "Vienna" });
        // The chosen option is highlighted on opening but only takes the focus a frame later; until then, the arrow keys go nowhere
        await waitFor(() => expect(vienna).toHaveAttribute("data-highlighted"));
        await waitFor(() => expect(vienna).toHaveFocus());
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

const sites: SelectOption[] = [
    {
        value: "main",
        textValue: "Main website",
        label: (
            <span className={styles.richLabel}>
                Main website <span className={styles.secondary}>example.com</span>
            </span>
        ),
    },
    {
        value: "shop",
        textValue: "Shop",
        label: (
            <span className={styles.richLabel}>
                Shop <span className={styles.secondary}>shop.example.com</span>
            </span>
        ),
    },
    {
        value: "careers",
        textValue: "Careers",
        label: (
            <span className={styles.richLabel}>
                Careers <span className={styles.secondary}>jobs.example.com</span>
            </span>
        ),
    },
];

/**
 * A `label` can be any content, e.g. a translated message. `textValue` then gives the option as plain text, for the search, typeahead,
 * and the chips' remove buttons.
 */
export const RichLabels: Story = {
    render: (args) => (
        <ControlledMultipleSelect
            name="sites"
            label="Sites"
            options={sites}
            initialValue={["main"]}
            onChange={args.onChange as (value: string[]) => void}
            multiple
            searchable
        />
    ),
    play: async ({ args, canvas }) => {
        await expect(canvas.getByRole("button", { name: "Remove Main website" })).toBeInTheDocument();
        await userEvent.click(canvas.getByRole("combobox", { name: /Sites/ }));
        const popup = await screen.findByRole("dialog");
        await userEvent.type(within(popup).getByRole("combobox"), "car");
        await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(1));
        await userEvent.click(screen.getByRole("option", { name: /Careers/ }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith(["main", "careers"]));
    },
};

const pageSizes: SelectOption<number>[] = [10, 25, 50, 100].map((size) => ({ value: size, label: String(size) }));

function NumberSelect({ onChange }: { onChange: (value: number | null) => void }) {
    const [value, setValue] = useState<number | null>(25);
    return (
        <div className={styles.narrow}>
            <Select<false, number>
                name="pageSize"
                label="Rows per page"
                options={pageSizes}
                value={value}
                onChange={(next) => {
                    onChange(next);
                    setValue(next);
                }}
            />
        </div>
    );
}

/**
 * Values can be of any type, e.g. numbers.
 */
export const NumberValues: Story = {
    render: (args) => <NumberSelect onChange={args.onChange as (value: number | null) => void} />,
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("combobox", { name: /Rows per page/ }));
        await userEvent.click(await screen.findByRole("option", { name: "50" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(50));
    },
};

interface Manufacturer {
    id: string;
    name: string;
}

const manufacturers: Manufacturer[] = [
    { id: "1", name: "Alpine Tools" },
    { id: "2", name: "Danube Works" },
    { id: "3", name: "Tyrol Gear" },
];

function ObjectSelect({ onChange }: { onChange: (value: Manufacturer | null) => void }) {
    // A copy, as an API response would return it: equal by id, not by reference
    const [value, setValue] = useState<Manufacturer | null>({ id: "2", name: "Danube Works" });
    return (
        <div className={styles.narrow}>
            <Select<false, Manufacturer>
                name="manufacturer"
                label="Manufacturer"
                options={manufacturers.map((manufacturer) => ({ value: manufacturer, label: manufacturer.name }))}
                value={value}
                onChange={(next) => {
                    onChange(next);
                    setValue(next);
                }}
                getKey={(manufacturer) => manufacturer.id}
            />
        </div>
    );
}

/**
 * Objects as values are matched by `getKey` (or `isOptionEqualToValue`), so a value equal to an option's, but not the same object, still shows as chosen.
 */
export const ObjectValues: Story = {
    render: (args) => <ObjectSelect onChange={args.onChange as (value: Manufacturer | null) => void} />,
    play: async ({ args, canvas }) => {
        const trigger = canvas.getByRole("combobox", { name: /Manufacturer/ });
        await expect(trigger).toHaveTextContent("Danube Works");
        await userEvent.click(trigger);
        await userEvent.click(await screen.findByRole("option", { name: "Tyrol Gear" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith({ id: "3", name: "Tyrol Gear" }));
    },
};

/**
 * In a `Dialog`, the options open above the dialog.
 */
export const InDialog: Story = {
    render: (args) => (
        <Dialog open onOpenChange={() => undefined} title="Move event">
            <ControlledSelect {...(args as SelectProps<boolean>)} />
        </Dialog>
    ),
    play: async ({ args }) => {
        const dialog = await screen.findByRole("dialog", { name: "Move event" });
        await userEvent.click(within(dialog).getByRole("combobox", { name: /Location/ }));
        const option = await screen.findByRole("option", { name: "Graz" });
        await waitFor(() => {
            const { left, top, width, height } = option.getBoundingClientRect();
            expect(option.contains(document.elementFromPoint(left + width / 2, top + height / 2))).toBe(true);
        });
        await userEvent.click(option);
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith("graz"));
    },
};
