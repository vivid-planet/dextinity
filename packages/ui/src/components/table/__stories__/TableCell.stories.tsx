import type { Meta, StoryObj } from "@storybook/react-vite";

import { JobAdsTable } from "../../../storybook/table/JobAdsTable";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { TableBody } from "../TableBody";
import { TableCell } from "../TableCell";
import { TableRow } from "../TableRow";

const meta = {
    component: TableCell,
    title: "Building blocks/Tables & paging/TableCell",
    decorators: [themeDecorator],
    args: { columnId: "applicants", children: "12" },
    argTypes: {
        children: { control: "text" },
        className: { control: false },
    },
    render: (args) => (
        <JobAdsTable
            body={
                <TableBody>
                    <TableRow>
                        <TableCell columnId="title">Senior UX Designer</TableCell>
                        <TableCell {...args} />
                    </TableRow>
                </TableBody>
            }
        />
    ),
} satisfies Meta<typeof TableCell>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
