import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { BulkActionBar } from "../../../components/bulkActionBar/BulkActionBar";
import { Checkbox } from "../../../components/checkbox/Checkbox";
import { Icon } from "../../../components/icon/Icon";
import { formatShortcut } from "../../../components/keyboardShortcut/formatShortcut";
import { useKeyboardShortcutPlatform } from "../../../components/keyboardShortcut/keyboardShortcutPlatform";
import { useSelection } from "../../../components/selection/useSelection";
import { StatusIndicator } from "../../../components/statusIndicator/StatusIndicator";
import { ToastViewport } from "../../../components/toast/ToastViewport";
import { useToasts } from "../../../components/toast/useToasts";
import { storyModKey } from "../../../storybook/keyboardPlatformDecorator";
import { type JobAd, jobAds as initialJobAds } from "../../../storybook/patterns/jobAds";
import {
    PatternExample,
    PatternLinks,
    patternListClassNames,
    PatternPage,
    PatternRules,
    PatternSection,
    PatternShortcuts,
    PatternSteps,
    PatternUses,
} from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";

function MultiSelectExample() {
    const [jobAds, setJobAds] = useState<JobAd[]>(initialJobAds.slice(0, 5));
    const [selectedIds, setSelectedIds] = useState<string[]>(["2"]);
    const { toasts, add, dismiss } = useToasts();
    const selection = useSelection({ ids: jobAds.map((jobAd) => jobAd.id), selectedIds, onSelectionChange: setSelectedIds });

    const applyStatus = (status: JobAd["status"], verb: string) => {
        const previous = jobAds;
        const skipped = status === "published" ? jobAds.filter((jobAd) => selection.isSelected(jobAd.id) && jobAd.status === "archived") : [];
        const changed = jobAds.filter((jobAd) => selection.isSelected(jobAd.id) && !skipped.includes(jobAd));
        setJobAds(jobAds.map((jobAd) => (changed.includes(jobAd) ? { ...jobAd, status } : jobAd)));
        selection.clear();
        const skippedText = skipped.length > 0 ? ` · ${skipped.length} archived skipped` : "";
        add({
            message: `${changed.length} ${verb}${skippedText}`,
            action: { label: "Undo", onClick: () => setJobAds(previous) },
        });
    };

    return (
        <PatternExample>
            <ul className={patternListClassNames.list} aria-label="Job ads" onKeyDown={selection.onKeyDown}>
                {jobAds.map((jobAd) => (
                    <li key={jobAd.id} className={patternListClassNames.row} data-selected={selection.isSelected(jobAd.id) ? "" : undefined}>
                        <Checkbox
                            checked={selection.isSelected(jobAd.id)}
                            onChange={() => selection.toggle(jobAd.id)}
                            aria-label={`Select ${jobAd.title}`}
                        />
                        <span className={patternListClassNames.rowTitle}>{jobAd.title}</span>
                        <StatusIndicator status={jobAd.status} />
                    </li>
                ))}
            </ul>
            <BulkActionBar
                count={selectedIds.length}
                onClear={selection.clear}
                actions={[
                    { label: "Publish", icon: <Icon name="check" />, onClick: () => applyStatus("published", "published") },
                    { label: "Archive", icon: <Icon name="archive" />, onClick: () => applyStatus("archived", "archived") },
                ]}
            />
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </PatternExample>
    );
}

function MultiSelectPage() {
    const apple = useKeyboardShortcutPlatform() === "apple";
    const selectAllKeys = formatShortcut("mod+a", apple).join(apple ? "" : "+");
    const mod = formatShortcut("mod+a", apple)[0];
    return (
        <PatternPage>
            <PatternSection title="Example" description="Live: the checkbox selects, the action bar shows the count.">
                <MultiSelectExample />
            </PatternSection>
            <PatternSteps
                steps={[
                    { title: "Select", description: `Checkbox in each row, ⇧ selects ranges, ${selectAllKeys} all visible items.` },
                    { title: "Action bar", description: "Appears at the bottom with the count and the actions for all of them." },
                    {
                        title: "Run",
                        description: "Result in a toast, with Undo. Skipped items are named (“1 archived skipped”).",
                    },
                    { title: "Clear", description: "× or Esc." },
                ]}
            />
            <PatternLinks
                title="Where"
                links={[
                    { label: "Job ads", docsId: "page-types-list--docs" },
                    { label: "Page tree", docsId: "building-blocks-tree-treeview--docs" },
                    { label: `Assets (${mod}/⇧ as in the Finder)`, docsId: "page-types-finder--docs" },
                ]}
            />
            <PatternShortcuts
                shortcuts={[
                    { keys: ["⇧", "Click"], description: "Select a range" },
                    { shortcut: "mod+a", description: "Select all visible items" },
                    { shortcut: "Escape", description: "Clear the selection" },
                ]}
            />
            <PatternUses pages={["Selection & toggles", "Tables & paging", "Tree", "Menus & messages"]} />
            <PatternRules
                dos={["The selection survives filtering; the count includes all of it.", "Clicking the row opens the item, the checkbox selects it."]}
                donts={["Bulk actions without a result message.", "Delete as the first action in the bar."]}
            />
        </PatternPage>
    );
}

const meta = {
    title: "Patterns/Multi-select",
    decorators: [themeDecorator],
    parameters: {
        docs: {
            description: {
                component:
                    "Select several items and act on all of them. `useSelection` holds the selection, `BulkActionBar` offers the actions, a toast with Undo reports the result.",
            },
        },
    },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Do: keep the selection when filtering, and count all of it; open the item on a row click, select it with the checkbox.
 * - Don't: run bulk actions without a result message; put Delete first in the bar.
 */
export const Default: Story = {
    render: () => <MultiSelectPage />,
};

/**
 * Shift-click selects the range from the selected row; "Publish" skips the archived item, says so, and Undo restores every status.
 */
export const RangeAndBulkAction: Story = {
    render: () => <MultiSelectPage />,
    play: async ({ canvas }) => {
        await userEvent.keyboard("{Shift>}");
        await userEvent.click(canvas.getByRole("checkbox", { name: "Select QA Engineer" }));
        await userEvent.keyboard("{/Shift}");
        await waitFor(() => expect(canvas.getByText("4 selected")).toBeVisible());

        await userEvent.click(canvas.getByRole("button", { name: "Publish" }));
        await waitFor(() => expect(canvas.getByText("3 published · 1 archived skipped")).toBeVisible());
        const list = canvas.getByRole("list", { name: "Job ads" });
        await expect(within(list).getAllByText("Published")).toHaveLength(4);

        await userEvent.click(canvas.getByRole("button", { name: "Undo" }));
        await waitFor(() => expect(within(list).getAllByText("Published")).toHaveLength(3));
    },
};

/**
 * ⌘A (Ctrl+A) selects all visible items while focus is in the list; Escape clears the selection.
 */
export const Keyboard: Story = {
    render: () => <MultiSelectPage />,
    play: async ({ canvas }) => {
        canvas.getByRole("checkbox", { name: "Select Frontend Developer" }).focus();
        await userEvent.keyboard(`{${storyModKey()}>}a{/${storyModKey()}}`);
        await waitFor(() => expect(canvas.getByText("5 selected")).toBeVisible());
        await userEvent.keyboard("{Escape}");
        await expect(canvas.getByRole("checkbox", { name: "Select Frontend Developer" })).not.toBeChecked();
    },
};
