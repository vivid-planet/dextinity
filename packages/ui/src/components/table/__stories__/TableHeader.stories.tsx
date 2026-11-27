import type { Meta, StoryObj } from "@storybook/react-vite";

import { JobAdsTable } from "../../../storybook/table/JobAdsTable";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { TableHeader } from "../TableHeader";
import { TableHeaderCell } from "../TableHeaderCell";

const meta = {
    component: TableHeader,
    title: "Building blocks/Tables & paging/TableHeader",
    decorators: [themeDecorator],
    args: {
        children: (
            <>
                <TableHeaderCell columnId="title">Title</TableHeaderCell>
                <TableHeaderCell columnId="applicants">Applicants</TableHeaderCell>
            </>
        ),
    },
    argTypes: {
        children: { control: false },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => <JobAdsTable header={<TableHeader {...args} />} />,
} satisfies Meta<typeof TableHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A line below the header separates it from the rows.
 */
export const Default: Story = {};
