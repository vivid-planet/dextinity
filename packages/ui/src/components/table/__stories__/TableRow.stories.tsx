import type { Meta, StoryObj } from "@storybook/react-vite";

import { JobAdsTable } from "../../../storybook/table/JobAdsTable";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { TableBody } from "../TableBody";
import { TableCell } from "../TableCell";
import { TableRow } from "../TableRow";

const meta = {
    component: TableRow,
    title: "Building blocks/Tables & paging/TableRow",
    decorators: [themeDecorator],
    args: {
        children: (
            <>
                <TableCell columnId="title">Frontend Developer</TableCell>
                <TableCell columnId="applicants">13</TableCell>
            </>
        ),
    },
    argTypes: {
        children: { control: false },
        className: { control: false },
    },
    render: (args) => (
        <JobAdsTable
            body={
                <TableBody>
                    <TableRow>
                        <TableCell columnId="title">Senior UX Designer</TableCell>
                        <TableCell columnId="applicants">12</TableCell>
                    </TableRow>
                    <TableRow {...args} />
                </TableBody>
            }
        />
    ),
} satisfies Meta<typeof TableRow>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * A hovered row gets a rounded fill; rows have no lines between them.
 */
export const Default: Story = {};
