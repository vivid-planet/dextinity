import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { AssetThumbnail } from "../../components/assetThumbnail/AssetThumbnail";
import { Button } from "../../components/button/Button";
import { DataGrid } from "../../components/dataGrid/DataGrid";
import { DateTimePicker } from "../../components/datePicker/DateTimePicker";
import { Dialog } from "../../components/dialog/Dialog";
import { FilterBar } from "../../components/filterBar/FilterBar";
import { Icon } from "../../components/icon/Icon";
import { Input } from "../../components/input/Input";
import { Menu } from "../../components/menu/Menu";
import { MenuItem } from "../../components/menu/MenuItem";
import { MenuSeparator } from "../../components/menu/MenuSeparator";
import { ProgressBar } from "../../components/progressBar/ProgressBar";
import { RadioGroup } from "../../components/radioGroup/RadioGroup";
import { SegmentedControl } from "../../components/segmentedControl/SegmentedControl";
import { Slider } from "../../components/slider/Slider";
import { Switch } from "../../components/switch/Switch";
import { Tabs } from "../../components/tabs/Tabs";
import { Toolbar } from "../../components/toolbar/Toolbar";
import { ToolbarButton } from "../../components/toolbar/ToolbarButton";
import { ToolbarSeparator } from "../../components/toolbar/ToolbarSeparator";
import { Tooltip } from "../../components/tooltip/Tooltip";
import { TreeView } from "../../components/treeView/TreeView";
import { themeDecorator } from "../../storybook/themeDecorator";
import styles from "./ForcedColors.stories.module.scss";

function Gallery() {
    const [title, setTitle] = useState("Senior UX Designer");
    const [hidden, setHidden] = useState(true);
    const [employment, setEmployment] = useState("part");
    const [contract, setContract] = useState<string | null>("full-time");
    const [size, setSize] = useState(40);
    const [section, setSection] = useState("blocks");
    const [search, setSearch] = useState("");
    return (
        <div className={styles.gallery}>
            <FilterBar searchValue={search} onSearchChange={setSearch} searchShortcut={false} />
            <Input name="title" label="Title" value={title} onChange={(event) => setTitle(event.target.value)} />
            <Switch checked={hidden} onChange={setHidden}>
                Hide in menu
            </Switch>
            <SegmentedControl
                aria-label="Employment"
                options={[
                    { value: "full", label: "Full-time" },
                    { value: "part", label: "Part-time" },
                ]}
                value={employment}
                onChange={setEmployment}
            />
            <RadioGroup
                label="Contract"
                options={[
                    { value: "full-time", label: "Full-time" },
                    { value: "freelance", label: "Freelance" },
                ]}
                value={contract}
                onChange={setContract}
            />
            <Slider aria-label="Icon size" value={size} onChange={setSize} />
            <Tabs
                aria-label="Page"
                items={[
                    { value: "blocks", label: "Blocks" },
                    { value: "seo", label: "SEO" },
                ]}
                value={section}
                onChange={setSection}
            />
            <ProgressBar aria-label="Upload" value={42} />
            <TreeView
                aria-label="Pages"
                nodes={[
                    { id: "jobs", label: "Jobs", status: "published" },
                    { id: "imprint", label: "Imprint", status: "published" },
                ]}
                expandedIds={[]}
                onExpandedChange={() => {}}
                selectedId="jobs"
                checkable
                checkedIds={["jobs", "imprint"]}
            />
            <Tooltip content="More actions" open>
                <Button variant="outlined" color="secondary">
                    With tooltip
                </Button>
            </Tooltip>
        </div>
    );
}

function SeparatorGallery() {
    const [menuOpen, setMenuOpen] = useState(true);
    const [publishAt, setPublishAt] = useState<string | null>("2026-03-01T09:30:00.000Z");
    return (
        <div className={styles.gallery}>
            <Toolbar aria-label="Formatting">
                <ToolbarButton aria-label="Bold" pressed={false} onClick={() => {}}>
                    <Icon name="rte-bold" />
                </ToolbarButton>
                <ToolbarSeparator />
                <ToolbarButton aria-label="Link" onClick={() => {}}>
                    <Icon name="link" />
                </ToolbarButton>
            </Toolbar>
            <DateTimePicker name="publishAt" label="Publish at" value={publishAt} onChange={setPublishAt} />
            <Menu
                open={menuOpen}
                onOpenChange={setMenuOpen}
                trigger={
                    <Button variant="outlined" color="secondary">
                        Actions
                    </Button>
                }
            >
                <MenuItem label="Duplicate" onClick={() => {}} />
                <MenuSeparator />
                <MenuItem label="Delete" color="error" onClick={() => {}} />
            </Menu>
        </div>
    );
}

interface Asset {
    id: string;
    name: string;
}

function SelectedRowGallery() {
    const [selectedIds, setSelectedIds] = useState(["hero"]);
    return (
        <DataGrid<Asset>
            aria-label="Assets"
            columns={[
                { key: "preview", header: "Preview", width: 96, render: () => <AssetThumbnail type="image" /> },
                { key: "name", header: "Name" },
            ]}
            rows={[
                { id: "hero", name: "hero.jpg" },
                { id: "team", name: "team.jpg" },
            ]}
            getRowId={(asset) => asset.id}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            activeRowId="hero"
        />
    );
}

function DialogGallery() {
    const [open, setOpen] = useState(true);
    return (
        <Dialog open={open} onOpenChange={setOpen} title="Choose a page" description="The page the link points to.">
            <Button onClick={() => setOpen(false)}>Close</Button>
        </Dialog>
    );
}

const meta = {
    title: "Foundations/Forced colors",
    decorators: [themeDecorator],
    tags: ["forced-colors", "!autodocs"],
    render: () => <Gallery />,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function systemColor(color: string) {
    const probe = document.createElement("div");
    probe.style.backgroundColor = color;
    document.body.append(probe);
    const resolved = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return resolved;
}

function query(selector: string) {
    const element = document.querySelector<HTMLElement>(selector);
    if (element == null) {
        throw new Error(`Missing ${selector}`);
    }
    return getComputedStyle(element);
}

/**
 * Forced colors (e.g. a Windows contrast theme) replace every color with the user's system colors and drop box shadows and
 * background images. The components bring back what those carried with system colors: edges and dividers as outlines and borders,
 * the focus ring and selected items in `Highlight`, and shapes such as the switch thumb or a progress bar in `CanvasText` or
 * `Highlight`. The SCSS mixins for this are in `src/theme/_forcedColors.scss`.
 *
 * The story test runs a second time with forced colors emulated (the `forced-colors` tag) and checks a sample of components.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("switch", { name: "Hide in menu" })).toBeInTheDocument();
        if (!window.matchMedia("(forced-colors: active)").matches) {
            return;
        }
        const highlight = systemColor("Highlight");
        const transparent = systemColor("transparent");

        await expect(query(".dextinityField__box").outlineStyle).toBe("solid");
        await expect(query(".dextinityFilterBar__search").outlineStyle).toBe("solid");
        await expect(query(".dextinitySwitch__control").outlineStyle).toBe("solid");
        await expect(query(".dextinitySwitch__control").backgroundColor).toBe(highlight);
        await expect(query(".dextinitySwitch__thumb").backgroundColor).not.toBe(transparent);
        await expect(query(".dextinitySegmentedControl__group").outlineStyle).toBe("solid");
        await expect(query(".dextinitySegmentedControl__option[aria-checked='true']").backgroundColor).toBe(highlight);
        await expect(query(".dextinityRadioGroup__control").outlineStyle).toBe("solid");
        await expect(query(".dextinityRadioGroup__indicator").backgroundColor).not.toBe(transparent);
        await expect(query(".dextinitySlider__track").outlineStyle).toBe("solid");
        await expect(query(".dextinitySlider__indicator").backgroundColor).toBe(highlight);
        await expect(query(".dextinityTabs__indicator").backgroundColor).toBe(highlight);
        await expect(query(".dextinityTabs__tab[aria-selected='true']").color).toBe(highlight);
        await expect(query(".dextinityProgressBar__indicator").backgroundColor).toBe(highlight);
        await waitFor(() => expect(getComputedStyle(screen.getByRole("tooltip")).outlineStyle).toBe("solid"));

        // The parts of a selected item are drawn on the highlight color, so they swap to the highlight text color
        const selectedRow = "[role='treeitem'][aria-selected='true'] > div";
        const otherRow = "[role='treeitem'][aria-selected='false'] > div";
        await expect(query(selectedRow).backgroundColor).toBe(highlight);
        await expect(query(`${selectedRow} .dextinityStatusIndicator__dot`).backgroundColor).toBe(systemColor("HighlightText"));
        await expect(query(`${selectedRow} .dextinityCheckbox__control`).backgroundColor).toBe(highlight);
        await expect(query(`${otherRow} .dextinityStatusIndicator__dot`).backgroundColor).toBe(systemColor("CanvasText"));
        await expect(query(`${otherRow} .dextinityCheckbox__control`).backgroundColor).toBe(systemColor("Canvas"));

        await userEvent.click(canvas.getByRole("textbox", { name: "Title" }));
        await expect(query(".dextinityField__box").outlineWidth).toBe("2px");
    },
};

/**
 * Separators drawn as a line with a background color – in menus, toolbars, and between the date and the time of a date-time picker –
 * keep a `CanvasText` line in forced colors.
 */
export const Separators: Story = {
    render: () => <SeparatorGallery />,
    play: async () => {
        await waitFor(() => expect(screen.getByRole("menu")).toBeVisible());
        if (!window.matchMedia("(forced-colors: active)").matches) {
            return;
        }
        const canvasText = systemColor("CanvasText");

        await expect(query(".dextinityMenuSeparator").backgroundColor).toBe(canvasText);
        await expect(query(".dextinityToolbarSeparator").backgroundColor).toBe(canvasText);
        await expect(query(".dextinityDateTimePicker__separator").backgroundColor).toBe(canvasText);
    },
};

/**
 * A part with its own background inside a selected item, e.g. a thumbnail in a selected row, takes the highlight colors instead of
 * keeping its theme color, and the bar of the active row stays visible on the highlight.
 */
export const InsideSelectedItems: Story = {
    render: () => <SelectedRowGallery />,
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("table", { name: "Assets" })).toBeInTheDocument();
        if (!window.matchMedia("(forced-colors: active)").matches) {
            return;
        }
        const highlight = systemColor("Highlight");

        await expect(query("[data-selected] .dextinityAssetThumbnail__preview").backgroundColor).toBe(highlight);
        await expect(query("tr:not([data-selected]) .dextinityAssetThumbnail__preview").backgroundColor).toBe(systemColor("Canvas"));
        await expect(query("[data-active] > td:first-child").boxShadow).toContain(systemColor("HighlightText"));
    },
};

/**
 * Forced colors keep only the alpha of a tinted backdrop, so the backdrop behind a dialog or a drawer covers the page with the
 * canvas color instead, and only the dialog reads as active.
 */
export const Backdrop: Story = {
    render: () => <DialogGallery />,
    play: async () => {
        await waitFor(() => expect(screen.getByRole("dialog")).toBeVisible());
        if (!window.matchMedia("(forced-colors: active)").matches) {
            return;
        }
        await waitFor(() => expect(query(".dextinityDialog__backdrop").opacity).toBe("0.75"));
        await expect(query(".dextinityDialog__backdrop").backgroundColor).toBe(systemColor("Canvas"));
    },
};
