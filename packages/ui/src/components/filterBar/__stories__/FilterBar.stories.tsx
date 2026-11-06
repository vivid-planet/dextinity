import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent } from "storybook/test";

import { jobAds, type JobAdStatus } from "../../../storybook/patterns/jobAds";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { FilterChip } from "../../filterChip/FilterChip";
import { Icon } from "../../icon/Icon";
import filterBarTokens from "../_tokens.scss?raw";
import { FilterBar, type FilterBarProps } from "../FilterBar";

const statusFilters: { value: JobAdStatus | "all"; label: string }[] = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "unpublished", label: "Unpublished" },
    { value: "archived", label: "Archived" },
];

/** Keeps the story controlled: the search filters the sample job ads, the chips' counts follow it. */
function ControlledFilterBar(props: FilterBarProps) {
    const [search, setSearch] = useState(props.searchValue);
    const [status, setStatus] = useState<JobAdStatus | "all">("all");
    const matches = jobAds.filter((jobAd) => jobAd.title.toLowerCase().includes(search.toLowerCase()));
    const countFor = (value: JobAdStatus | "all") => matches.filter((jobAd) => value === "all" || jobAd.status === value).length;

    return (
        <FilterBar
            {...props}
            searchValue={search}
            onSearchChange={(value) => {
                props.onSearchChange(value);
                setSearch(value);
            }}
            resultCount={props.resultCount == null ? undefined : countFor(status)}
        >
            {props.children ??
                statusFilters.map((filter) => (
                    <FilterChip
                        key={filter.value}
                        selected={status === filter.value}
                        onClick={() => setStatus(filter.value)}
                        count={countFor(filter.value)}
                        status={filter.value === "all" ? undefined : filter.value}
                    >
                        {filter.label}
                    </FilterChip>
                ))}
        </FilterBar>
    );
}

const meta = {
    component: FilterBar,
    title: "Patterns/Search & filter/FilterBar",
    decorators: [themeDecorator],
    parameters: { tokens: filterBarTokens },
    args: {
        searchValue: "",
        onSearchChange: fn(),
    },
    argTypes: {
        searchShortcut: { control: "text" },
        children: { control: false },
        actions: { control: false },
        labels: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <ControlledFilterBar {...args} />,
} satisfies Meta<typeof FilterBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Always offer the status filters Published, Unpublished and Archived.
 * - Filters apply right away, without an "Apply" button.
 * - Don't hide archived items in "All" without saying so; don't put filters in a dialog.
 */
export const Default: Story = {
    play: async ({ args, canvas }) => {
        const search = canvas.getByRole("searchbox", { name: "Search" });
        await userEvent.type(search, "designer");
        await expect(args.onSearchChange).toHaveBeenLastCalledWith("designer");
        await expect(canvas.getByRole("button", { name: /^All/ })).toHaveTextContent("2");
    },
};

/**
 * `/` jumps into the search from anywhere outside a text field; Escape clears it.
 */
export const Keyboard: Story = {
    args: { searchValue: "QA" },
    play: async ({ args, canvas }) => {
        const search = canvas.getByRole("searchbox", { name: "Search" });
        await userEvent.keyboard("/");
        await expect(search).toHaveFocus();
        await userEvent.keyboard("{Escape}");
        await expect(args.onSearchChange).toHaveBeenLastCalledWith("");
        await expect(search).toHaveValue("");
    },
};

/**
 * The number of results after the filters, announced as it changes.
 */
export const ResultCount: Story = {
    args: { resultCount: 0 },
};

/**
 * Actions such as "Export" sit at the end.
 */
export const WithActions: Story = {
    args: {
        actions: (
            <Button variant="outlined" size="small" startIcon={<Icon name="download" />}>
                Export
            </Button>
        ),
    },
};
