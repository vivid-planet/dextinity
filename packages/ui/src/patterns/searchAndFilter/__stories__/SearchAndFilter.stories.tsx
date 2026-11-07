import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fragment, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Button } from "../../../components/button/Button";
import { Chip } from "../../../components/chip/Chip";
import { EmptyState } from "../../../components/emptyState/EmptyState";
import { FilterBar } from "../../../components/filterBar/FilterBar";
import { FilterChip } from "../../../components/filterChip/FilterChip";
import { Icon } from "../../../components/icon/Icon";
import { Menu } from "../../../components/menu/Menu";
import { MenuRadioGroup } from "../../../components/menu/MenuRadioGroup";
import { MenuRadioItem } from "../../../components/menu/MenuRadioItem";
import { StatusIndicator } from "../../../components/statusIndicator/StatusIndicator";
import { jobAds, type JobAdStatus } from "../../../storybook/patterns/jobAds";
import {
    PatternExample,
    patternListClassNames,
    PatternPage,
    PatternRules,
    PatternSection,
    PatternShortcuts,
    PatternSteps,
    PatternUses,
} from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";

type StatusFilter = JobAdStatus | "all";

const statusFilters: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "published", label: "Published" },
    { value: "unpublished", label: "Unpublished" },
    { value: "archived", label: "Archived" },
];

const locations = ["Vienna", "Graz", "Salzburg"];

function Highlight({ text, query }: { text: string; query: string }) {
    if (query === "") {
        return text;
    }
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i"));
    return parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? <mark key={index}>{part}</mark> : <Fragment key={index}>{part}</Fragment>,
    );
}

function SearchAndFilterExample() {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<StatusFilter>("all");
    const [location, setLocation] = useState("");
    const [locationMenuOpen, setLocationMenuOpen] = useState(false);

    const matchesSearchAndLocation = jobAds.filter(
        (jobAd) => jobAd.title.toLowerCase().includes(search.toLowerCase()) && (location === "" || jobAd.location === location),
    );
    const countFor = (value: StatusFilter) => matchesSearchAndLocation.filter((jobAd) => value === "all" || jobAd.status === value).length;
    const results = matchesSearchAndLocation.filter((jobAd) => status === "all" || jobAd.status === status);

    const reset = () => {
        setSearch("");
        setStatus("all");
        setLocation("");
    };

    return (
        <PatternExample>
            <FilterBar searchValue={search} onSearchChange={setSearch}>
                {statusFilters.map((filter) => (
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
                <Menu
                    open={locationMenuOpen}
                    onOpenChange={setLocationMenuOpen}
                    trigger={
                        <FilterChip selected={false} hasMenu onClick={() => {}}>
                            More filters
                        </FilterChip>
                    }
                >
                    <MenuRadioGroup
                        value={location}
                        onChange={(nextLocation) => {
                            setLocation(nextLocation);
                            setLocationMenuOpen(false);
                        }}
                    >
                        {locations.map((name) => (
                            <MenuRadioItem key={name} value={name} label={`Location: ${name}`} />
                        ))}
                    </MenuRadioGroup>
                </Menu>
                {location !== "" && (
                    <Chip color="secondary" onClear={() => setLocation("")} clearLabel={`Remove filter Location: ${location}`}>
                        {`Location: ${location}`}
                    </Chip>
                )}
            </FilterBar>
            {results.length > 0 ? (
                <ul className={patternListClassNames.list} aria-label="Job ads">
                    {results.map((jobAd) => (
                        <li key={jobAd.id} className={patternListClassNames.row}>
                            <span className={patternListClassNames.rowTitle}>
                                <Highlight text={jobAd.title} query={search} />
                            </span>
                            <StatusIndicator status={jobAd.status} />
                        </li>
                    ))}
                </ul>
            ) : (
                <EmptyState
                    icon={<Icon name="search" />}
                    title={search === "" ? "No matches" : `No matches for “${search}”`}
                    description="Check the spelling or reset the filters."
                    actions={
                        <Button variant="outlined" color="secondary" size="small" onClick={reset}>
                            Reset filters
                        </Button>
                    }
                />
            )}
        </PatternExample>
    );
}

function SearchAndFilterPage() {
    return (
        <PatternPage>
            <PatternSection title="Example" description="Live: search and filters work together; the counts in the chips follow the search.">
                <SearchAndFilterExample />
            </PatternSection>
            <PatternSteps
                steps={[
                    { title: "Search", description: "Field on the left, key /. Filters right away and highlights the matches." },
                    { title: "Filter by status", description: "Chips with counts, one active. The counts follow the search." },
                    { title: "More filters", description: "“More filters” opens a menu; active filters appear as chips with ×." },
                    { title: "No matches", description: "Empty state with “Reset filters”." },
                    { title: "Coming back", description: "Search and filters stay until they are cleared." },
                ]}
            />
            <PatternShortcuts
                shortcuts={[
                    { keys: ["/"], description: "Jump into the search" },
                    { keys: ["Esc"], description: "Clear the search" },
                ]}
            />
            <PatternUses pages={["Form fields", "Selection & toggles", "Tables & paging", "Menus & messages"]} />
            <PatternRules
                dos={["Always offer the status filters Published, Unpublished and Archived.", "Filters apply right away, without “Apply”."]}
                donts={["Hiding archived items in “All” without saying so.", "Filters in a dialog."]}
            />
        </PatternPage>
    );
}

const meta = {
    title: "Patterns/Search & filter",
    decorators: [themeDecorator],
    parameters: {
        docs: {
            description: {
                component: "Narrow lists quickly. `FilterBar` holds the search and the filters; the list shows the matches or an `EmptyState`.",
            },
        },
    },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Do: always offer the status filters Published, Unpublished and Archived; filters apply right away, without "Apply".
 * - Don't: hide archived items in "All" without saying so; put filters in a dialog.
 */
export const Default: Story = {
    render: () => <SearchAndFilterPage />,
    play: async ({ canvas }) => {
        const search = canvas.getByRole("searchbox", { name: "Search" });
        await userEvent.keyboard("/");
        await expect(search).toHaveFocus();
        await userEvent.type(search, "designer");
        const list = canvas.getByRole("list", { name: "Job ads" });
        await expect(within(list).getAllByRole("listitem")).toHaveLength(2);
        await expect(canvas.getByRole("button", { name: /^Published/ })).toHaveTextContent("1");

        await userEvent.click(canvas.getByRole("button", { name: /^Archived/ }));
        await expect(canvas.getByRole("heading", { name: "No matches for “designer”" })).toBeVisible();
        await userEvent.click(canvas.getByRole("button", { name: "Reset filters" }));
        await expect(search).toHaveValue("");
        await expect(within(canvas.getByRole("list", { name: "Job ads" })).getAllByRole("listitem")).toHaveLength(7);
    },
};

/**
 * “More filters” opens a menu; an active filter appears as a chip, and its × removes it.
 */
export const MoreFilters: Story = {
    render: () => <SearchAndFilterPage />,
    play: async ({ canvas, canvasElement }) => {
        await userEvent.click(canvas.getByRole("button", { name: "More filters" }));
        const body = within(canvasElement.ownerDocument.body);
        await userEvent.click(await body.findByRole("menuitemradio", { name: "Location: Graz" }));
        await waitFor(() => expect(within(canvas.getByRole("list", { name: "Job ads" })).getAllByRole("listitem")).toHaveLength(2));
        await userEvent.click(canvas.getByRole("button", { name: "Remove filter Location: Graz" }));
        await expect(within(canvas.getByRole("list", { name: "Job ads" })).getAllByRole("listitem")).toHaveLength(7);
    },
};
