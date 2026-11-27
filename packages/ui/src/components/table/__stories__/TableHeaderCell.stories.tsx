import type { Meta, StoryObj } from "@storybook/react-vite";

import { JobAdsTable } from "../../../storybook/table/JobAdsTable";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { TableHeader } from "../TableHeader";
import { TableHeaderCell } from "../TableHeaderCell";

const meta = {
    component: TableHeaderCell,
    title: "Building blocks/Tables & paging/TableHeaderCell",
    decorators: [themeDecorator],
    args: { columnId: "applicants", children: "Applicants" },
    argTypes: {
        children: { control: "text" },
        className: { control: false },
    },
    render: (args) => (
        <JobAdsTable
            header={
                <TableHeader>
                    <TableHeaderCell columnId="title">Title</TableHeaderCell>
                    <TableHeaderCell {...args} />
                </TableHeader>
            }
        />
    ),
} satisfies Meta<typeof TableHeaderCell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
