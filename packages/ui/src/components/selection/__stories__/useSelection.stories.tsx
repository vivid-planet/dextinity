import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent } from "storybook/test";

import { storyModKey } from "../../../storybook/keyboardPlatformDecorator";
import { jobAds } from "../../../storybook/patterns/jobAds";
import { patternListClassNames } from "../../../storybook/patterns/PatternPage";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Checkbox } from "../../checkbox/Checkbox";
import { StatusIndicator } from "../../statusIndicator/StatusIndicator";
import { useSelection } from "../useSelection";

const ids = jobAds.map((jobAd) => jobAd.id);

function SelectableList() {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const selection = useSelection({ ids, selectedIds, onSelectionChange: setSelectedIds });

    return (
        <>
            <Checkbox
                checked={selection.allSelected}
                indeterminate={selection.someSelected}
                onChange={(checked) => (checked ? selection.selectAll() : selection.clear())}
            >
                {`${selectedIds.length} selected`}
            </Checkbox>
            <ul className={patternListClassNames.list} aria-label="Job ads" onKeyDown={selection.onKeyDown}>
                {jobAds.map((jobAd) => (
                    <li key={jobAd.id} className={patternListClassNames.row} data-selected={selection.isSelected(jobAd.id) ? "" : undefined}>
                        <Checkbox checked={selection.isSelected(jobAd.id)} onChange={() => selection.toggle(jobAd.id)}>
                            {jobAd.title}
                        </Checkbox>
                        <span className={patternListClassNames.rowTitle} />
                        <StatusIndicator status={jobAd.status} />
                    </li>
                ))}
            </ul>
        </>
    );
}

const meta = {
    title: "Patterns/Multi-select/useSelection",
    decorators: [themeDecorator],
    render: () => <SelectableList />,
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * `useSelection` keeps the selected ids of a list: a checkbox toggles one item, Shift-click selects the range from the
 * previously toggled item, ⌘A (Ctrl+A) selects all visible items and Escape clears the selection.
 *
 * **Rules**
 *
 * - The selection survives filtering; the count includes hidden items.
 * - Clicking the row opens the item, the checkbox selects it.
 */
export const Default: Story = {
    play: async ({ canvas }) => {
        await userEvent.click(canvas.getByRole("checkbox", { name: "Frontend Developer" }));
        await userEvent.keyboard("{Shift>}");
        await userEvent.click(canvas.getByRole("checkbox", { name: "QA Engineer" }));
        await userEvent.keyboard("{/Shift}");
        await expect(canvas.getByRole("checkbox", { name: "4 selected" })).toBeInTheDocument();

        await userEvent.keyboard(`{${storyModKey()}>}a{/${storyModKey()}}`);
        await expect(canvas.getByRole("checkbox", { name: "7 selected" })).toBeChecked();

        await userEvent.keyboard("{Escape}");
        await expect(canvas.getByRole("checkbox", { name: "0 selected" })).not.toBeChecked();
    },
};
