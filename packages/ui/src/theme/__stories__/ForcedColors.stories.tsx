import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, screen, userEvent, waitFor } from "storybook/test";

import { Button } from "../../components/button/Button";
import { Input } from "../../components/input/Input";
import { ProgressBar } from "../../components/progressBar/ProgressBar";
import { RadioGroup } from "../../components/radioGroup/RadioGroup";
import { SegmentedControl } from "../../components/segmentedControl/SegmentedControl";
import { Slider } from "../../components/slider/Slider";
import { Switch } from "../../components/switch/Switch";
import { Tabs } from "../../components/tabs/Tabs";
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
    return (
        <div className={styles.gallery}>
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
        await expect(query(".dextinitySwitch__control").outlineStyle).toBe("solid");
        await expect(query(".dextinitySwitch__control").backgroundColor).toBe(highlight);
        await expect(query(".dextinitySwitch__thumb").backgroundColor).not.toBe(transparent);
        await expect(query(".dextinitySegmentedControl__group").outlineStyle).toBe("solid");
        await expect(query(".dextinitySegmentedControl__option[aria-pressed='true']").backgroundColor).toBe(highlight);
        await expect(query(".dextinityRadioGroup__control").outlineStyle).toBe("solid");
        await expect(query(".dextinityRadioGroup__indicator").backgroundColor).not.toBe(transparent);
        await expect(query(".dextinitySlider__track").outlineStyle).toBe("solid");
        await expect(query(".dextinitySlider__indicator").backgroundColor).toBe(highlight);
        await expect(query(".dextinityTabs__indicator").backgroundColor).toBe(highlight);
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
