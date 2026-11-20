import { Button } from "../../../../components/button/Button";
import { Drawer } from "../../../../components/drawer/Drawer";
import { Field } from "../../../../components/field/Field";
import { FilterChip } from "../../../../components/filterChip/FilterChip";
import { SegmentedControl } from "../../../../components/segmentedControl/SegmentedControl";
import { Select } from "../../../../components/select/Select";
import { Switch } from "../../../../components/switch/Switch";
import styles from "./assetLibrary.module.scss";
import type { LibraryLocation, LibrarySortKey, SmartFilter } from "./AssetLibraryContext";
import type { AssetKind } from "./assetLibraryData";

export const kindFilters: { value: AssetKind | null; label: string }[] = [
    { value: null, label: "All" },
    { value: "image", label: "Images" },
    { value: "video", label: "Videos" },
    { value: "audio", label: "Audio" },
    { value: "document", label: "Documents" },
];

export const sortLabels: Record<LibrarySortKey, string> = { name: "Name", modified: "Date modified", size: "Size", kind: "Type" };

export const pageSizes = [25, 50, 100, 200];

/** How many filters differ from the defaults, for the count on the filter button. */
export function countActiveFilters(location: LibraryLocation) {
    return [location.kind != null, location.flat, location.smartFilter != null].filter(Boolean).length;
}

interface LibraryFilterDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    location: LibraryLocation;
    /** Changes what the library shows and returns to page 1. */
    onChange: (changes: Partial<LibraryLocation>) => void;
    onSmartFilterChange: (filter: SmartFilter) => void;
    /** Whether "Include subfolders" applies, which it doesn't in search results or smart filters. */
    canIncludeSubfolders: boolean;
    onReset: () => void;
}

/**
 * The library's sorting, filters, and display options in narrow windows, where the toolbar only keeps the search and the view.
 * Each change applies right away, so that the files behind the drawer already show the result.
 */
export function LibraryFilterDrawer({
    open,
    onOpenChange,
    location,
    onChange,
    onSmartFilterChange,
    canIncludeSubfolders,
    onReset,
}: LibraryFilterDrawerProps) {
    return (
        <Drawer
            open={open}
            onOpenChange={onOpenChange}
            modal
            title="Filter and sort"
            footer={
                <>
                    <Button variant="outlined" color="secondary" onClick={onReset} disabled={countActiveFilters(location) === 0}>
                        Reset filters
                    </Button>
                    <Button onClick={() => onOpenChange(false)}>Done</Button>
                </>
            }
        >
            <div className={styles.filterDrawer}>
                <section className={styles.filterSection}>
                    <h3>Sort by</h3>
                    <Field label="Field" layout="stacked">
                        <Select
                            name="sort"
                            value={location.sort.key}
                            onChange={(key) => key != null && onChange({ sort: { ...location.sort, key: key as LibrarySortKey } })}
                            options={(Object.keys(sortLabels) as LibrarySortKey[]).map((key) => ({ value: key, label: sortLabels[key] }))}
                        />
                    </Field>
                    <SegmentedControl
                        aria-label="Order"
                        value={location.sort.direction}
                        onChange={(direction) => onChange({ sort: { ...location.sort, direction } })}
                        options={[
                            { value: "ascending", label: "Ascending" },
                            { value: "descending", label: "Descending" },
                        ]}
                    />
                </section>
                <section className={styles.filterSection}>
                    <h3>Type</h3>
                    <div className={styles.chips} role="group" aria-label="Type">
                        {kindFilters.map((filter) => (
                            <FilterChip key={filter.label} selected={location.kind === filter.value} onClick={() => onChange({ kind: filter.value })}>
                                {filter.label}
                            </FilterChip>
                        ))}
                    </div>
                </section>
                <section className={styles.filterSection}>
                    <h3>Show</h3>
                    <Switch
                        checked={location.flat}
                        disabled={!canIncludeSubfolders}
                        onChange={(flat) => onChange({ flat })}
                        description="The files of all subfolders in one view."
                    >
                        Include subfolders
                    </Switch>
                    <Switch
                        checked={location.smartFilter === "unused"}
                        onChange={() => onSmartFilterChange("unused")}
                        description="Files no page uses, from all folders."
                    >
                        Only unused
                    </Switch>
                    <Switch checked={location.smartFilter === "archived"} onChange={() => onSmartFilterChange("archived")}>
                        Only archived
                    </Switch>
                </section>
                <section className={styles.filterSection}>
                    <h3>Display</h3>
                    {location.view === "tiles" && (
                        <Field label="Tiles" layout="stacked">
                            <SegmentedControl
                                aria-label="Tiles"
                                value={location.tileSize > 168 ? "large" : "small"}
                                onChange={(size) => onChange({ tileSize: size === "large" ? 300 : 120 })}
                                options={[
                                    { value: "small", label: "Two per row" },
                                    { value: "large", label: "One per row" },
                                ]}
                            />
                        </Field>
                    )}
                    <Field label="Items per page" layout="stacked">
                        <Select
                            name="pageSize"
                            value={String(location.pageSize)}
                            onChange={(value) => value != null && onChange({ pageSize: Number(value) })}
                            options={pageSizes.map((size) => ({ value: String(size), label: String(size) }))}
                        />
                    </Field>
                </section>
            </div>
        </Drawer>
    );
}
