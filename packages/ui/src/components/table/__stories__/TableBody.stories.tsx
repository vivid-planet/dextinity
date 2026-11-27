import type { Meta, StoryObj } from "@storybook/react-vite";

import { JobAdsTable } from "../../../storybook/table/JobAdsTable";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { TableBody } from "../TableBody";
import { TableCell } from "../TableCell";
import { TableRow } from "../TableRow";

const meta = {
    component: TableBody,
    title: "Building blocks/Tables & paging/TableBody",
    decorators: [themeDecorator],
    args: {
        children: (
            <>
                <TableRow>
                    <TableCell columnId="title">Senior UX Designer</TableCell>
                    <TableCell columnId="applicants">12</TableCell>
                </TableRow>
                <TableRow>
                    <TableCell columnId="title">Frontend Developer</TableCell>
                    <TableCell columnId="applicants">13</TableCell>
                </TableRow>
            </>
        ),
    },
    argTypes: {
        children: { control: false },
        className: { control: false },
    },
    render: (args) => <JobAdsTable body={<TableBody {...args} />} />,
} satisfies Meta<typeof TableBody>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
