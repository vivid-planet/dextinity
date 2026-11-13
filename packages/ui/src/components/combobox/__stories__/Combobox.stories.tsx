import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, screen, userEvent, waitFor, within } from "storybook/test";

import { fieldArgTypes, type FieldStoryArgs, splitFieldArgs, StoryField } from "../../../storybook/fieldStoryArgs";
import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import fieldTokens from "../../field/Field.tokens.scss?raw";
import selectTokens from "../../select/Select.tokens.scss?raw";
import { Combobox, type ComboboxProps } from "../Combobox";
import styles from "./Combobox.stories.module.scss";

interface Category {
    id: string;
    title: string;
    products: number;
}

const categoryTitles = [
    "Backpacks",
    "Bike accessories",
    "Camping",
    "Climbing",
    "Footwear",
    "Headlamps",
    "Jackets",
    "Kitchen",
    "Rain gear",
    "Running",
    "Sleeping bags",
    "Ski touring",
    "Tents",
    "Trekking poles",
    "Water bottles",
];

const categories: Category[] = categoryTitles.map((title, index) => ({ id: String(index + 1), title, products: (index * 7) % 23 }));

function wait(milliseconds: number, signal: AbortSignal) {
    return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(resolve, milliseconds);
        signal.addEventListener("abort", () => {
            clearTimeout(timeout);
            reject(signal.reason);
        });
    });
}

/** A stand-in for an API: finds categories by title after a short delay. */
async function searchCategories(query: string, { signal }: { signal: AbortSignal }) {
    await wait(400, signal);
    return categories.filter((category) => category.title.toLowerCase().includes(query.toLowerCase()));
}

function getCategoryTitle(category: Category) {
    return category.title;
}

/**
 * A stand-in for an API whose first attempt to load the options fails, then finds categories. `reset` lets the next attempt fail
 * again; each story gets its own, so that on the docs page each story's first attempt fails.
 */
function searchCategoriesFailingOnce() {
    let attempts = 0;
    return {
        loadOptions: async (query: string, context: { signal: AbortSignal }) => {
            attempts += 1;
            if (attempts === 1) {
                await wait(200, context.signal);
                throw new globalThis.Error("Network error");
            }
            return searchCategories(query, context);
        },
        reset: () => {
            attempts = 0;
        },
    };
}

const loadingErrorSearch = searchCategoriesFailingOnce();
const retryAfterErrorSearch = searchCategoriesFailingOnce();

type ComboboxStoryArgs = ComboboxProps<Category, boolean> & FieldStoryArgs;

const meta = {
    component: Combobox,
    title: "Building blocks/Form fields/Combobox",
    decorators: [themeDecorator],
    parameters: { tokens: `${selectTokens}\n${fieldTokens}` },
    args: {
        name: "category",
        label: "Category",
        placeholder: "Search categories",
        value: null,
        onChange: fn(),
        loadOptions: searchCategories,
        getOptionLabel: getCategoryTitle,
    },
    argTypes: {
        value: { control: "object" },
        ...fieldArgTypes,
        multiple: { control: false },
        loadOptions: { control: false },
        getOptionLabel: { control: false },
        getOptionGroup: { control: false },
        renderOption: { control: false },
        isOptionDisabled: { control: false },
        onCreate: { control: false },
        labels: { control: false },
        className: { control: false },
    },
    render: (args, context) => {
        const { field, control } = splitFieldArgs(args);
        const [value, setValue] = useControlledArg(control, "value", context);
        return (
            <div className={styles.narrow}>
                <StoryField field={field}>
                    <Combobox
                        {...control}
                        value={value}
                        onChange={(next) => {
                            control.onChange(next);
                            setValue(next);
                        }}
                    />
                </StoryField>
            </div>
        );
    },
} satisfies Meta<ComboboxStoryArgs>;

export default meta;

type Story = StoryObj<ComboboxStoryArgs>;

/**
 * Put it in a `Field` for the label, help, and validation message: `<Field label="Category"><Combobox … /></Field>`.
 *
 * **Rules**
 * - Use it when the options come from an API or are too many to load at once; for a fixed list, use a select with `searchable`.
 * - Always controlled: `value` + `onChange`; the value is the chosen option itself, so the field can show it before the options load.
 * - `loadOptions` gets the typed text and an `AbortSignal`; pass the signal to the request.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const input = canvas.getByRole("combobox", { name: "Category" });
        await userEvent.click(input);
        await userEvent.type(input, "ten");
        await userEvent.click(await screen.findByRole("option", { name: "Tents" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(categories[12]));
        await waitFor(() => expect(input).toHaveValue("Tents"));
    },
};

/**
 * Opening the menu loads the options for an empty query. While they load, the menu says so.
 */
export const Loading: Story = {
    args: { placeholder: undefined, value: categories[2], loadOptions: () => new Promise<Category[]>(() => {}) },
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("combobox", { name: "Category" }));
        await waitFor(() => expect(screen.getByText("Loading…")).toBeVisible());
    },
};

/**
 * When loading fails, the menu says so and offers to try again as its option, reachable with the arrow keys and Enter. Here, only the first
 * attempt fails.
 */
export const LoadingError: Story = {
    args: { placeholder: undefined, loadOptions: loadingErrorSearch.loadOptions },
    beforeEach: loadingErrorSearch.reset,
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("combobox", { name: "Category" }));
        await waitFor(() => expect(screen.getByText("The options couldn't be loaded.")).toBeVisible());
        await expect(screen.getByRole("option", { name: "Retry" })).toBeVisible();
    },
};

export const RetryAfterError: Story = {
    args: { placeholder: undefined, loadOptions: retryAfterErrorSearch.loadOptions },
    beforeEach: retryAfterErrorSearch.reset,
    play: async (context) => {
        await LoadingError.play?.(context);
        await userEvent.keyboard("{ArrowDown}");
        await waitFor(() => expect(screen.getByRole("option", { name: "Retry" })).toHaveAttribute("data-highlighted"));
        await userEvent.keyboard("{Enter}");
        await waitFor(() => expect(screen.getByRole("option", { name: "Backpacks" })).toBeVisible());
        await expect(context.canvas.getByRole("combobox", { name: "Category" })).toHaveValue("");
        await expect(context.args.onChange).not.toHaveBeenCalled();
    },
};

export const NoResults: Story = {
    args: { placeholder: undefined },
    play: async ({ canvas }) => {
        const input = canvas.getByRole("combobox", { name: "Category" });
        await userEvent.click(input);
        await userEvent.type(input, "zzz");
        await waitFor(() => expect(screen.getByText("No results")).toBeVisible());
    },
};

/**
 * With `multiple`, the value is a list and the chosen options show as chips. Backspace in the empty input removes the last chip.
 */
export const Multiple: Story = {
    args: { name: "categories", label: "Categories", placeholder: "Add categories", value: [categories[0], categories[12]], multiple: true },
    play: async ({ args, canvas }) => {
        await userEvent.click(canvas.getByRole("button", { name: "Remove Tents" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith([categories[0]]));
        const input = canvas.getByRole("combobox", { name: "Categories" });
        await userEvent.click(input);
        await userEvent.type(input, "ski");
        await userEvent.click(await screen.findByRole("option", { name: "Ski touring" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith([categories[0], categories[11]]));
    },
};

/**
 * `onCreate` offers to create an option from the typed text when none has that label. The new option gets chosen.
 */
export const Create: Story = {
    args: {
        name: "tags",
        label: "Tags",
        placeholder: "Add tags",
        value: [],
        multiple: true,
        onCreate: async (title) => {
            await new Promise((resolve) => setTimeout(resolve, 300));
            return { id: `new-${title}`, title, products: 0 };
        },
    },
    play: async ({ args, canvas }) => {
        const input = canvas.getByRole("combobox", { name: "Tags" });
        await userEvent.click(input);
        await userEvent.type(input, "Paddling");
        await userEvent.click(await screen.findByRole("option", { name: "Create “Paddling”" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith([{ id: "new-Paddling", title: "Paddling", products: 0 }]));
        await expect(await canvas.findByRole("button", { name: "Remove Paddling" })).toBeVisible();
    },
};

/**
 * `renderOption` shows more than the label in the menu.
 */
export const RichOptions: Story = {
    args: {
        placeholder: undefined,
        renderOption: (category: Category) => (
            <span className={styles.option}>
                {category.title}
                <span className={styles.secondary}>{category.products} products</span>
            </span>
        ),
        isOptionDisabled: (category: Category) => category.products === 0,
    },
};

/**
 * A single combobox that isn't required can be cleared.
 */
export const Clear: Story = {
    args: { placeholder: undefined, value: categories[4] },
    play: async ({ args, canvas }) => {
        await expect(canvas.getByRole("combobox", { name: "Category" })).toHaveValue("Footwear");
        await userEvent.click(canvas.getByRole("button", { name: "Clear" }));
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(null));
    },
};

export const ValidationError: Story = {
    args: { placeholder: undefined, required: true, state: "error", validationMessage: "Choose the category the product belongs to." },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("combobox", { name: "Category" })).toHaveAccessibleDescription("Choose the category the product belongs to.");
    },
};

export const Disabled: Story = {
    args: { name: "categories", label: "Categories", placeholder: undefined, value: [categories[0], categories[1]], multiple: true, disabled: true },
};

export const Keyboard: Story = {
    args: { placeholder: undefined },
    play: async ({ args, canvas }) => {
        const input = canvas.getByRole("combobox", { name: "Category" });
        input.focus();
        await userEvent.keyboard("cl");
        const listbox = await screen.findByRole("listbox");
        await waitFor(() => expect(within(listbox).getByRole("option", { name: "Climbing" })).toHaveAttribute("data-highlighted"));
        await userEvent.keyboard("{Enter}");
        await waitFor(() => expect(args.onChange).toHaveBeenCalledWith(categories[3]));
    },
};

/**
 * `getOptionGroup` lists the options under headers, e.g. by their first letter.
 */
export const Groups: Story = {
    args: { getOptionGroup: (category: Category) => (category.products > 10 ? "Popular" : "More") },
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("combobox", { name: "Category" }));
        await userEvent.type(canvas.getByRole("combobox", { name: "Category" }), "s");
        const groups = await screen.findAllByRole("group");
        await expect(groups).toHaveLength(2);
        await expect(groups[0]).toHaveAccessibleName(/Popular|More/);
    },
};
