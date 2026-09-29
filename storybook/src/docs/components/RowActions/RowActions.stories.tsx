import { RowActionsItem, RowActionsMenu } from "@dextinity/admin";
import { Copy, Delete, Edit, Online, Paste, Settings } from "@dextinity/admin-icons";
import { Divider, Paper } from "@mui/material";
import type { Meta } from "@storybook/react-vite";

export default {
    title: "Docs/Components/RowActions",
    decorators: [
        (Story) => (
            <Paper
                variant="outlined"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    padding: 2,
                    maxWidth: 320,
                    marginLeft: "auto",
                    marginRight: "auto",
                }}
            >
                <Story />
            </Paper>
        ),
    ],
} as Meta<typeof RowActionsMenu>;

export const EditContextMenuExample = {
    render: () => {
        return (
            <RowActionsMenu>
                <RowActionsItem icon={<Edit />} componentsProps={{ iconButton: { color: "primary" } }}>
                    Edit
                </RowActionsItem>
                <RowActionsMenu>
                    <RowActionsItem icon={<Copy />}>Copy</RowActionsItem>
                    <RowActionsItem icon={<Paste />}>Paste</RowActionsItem>
                    <RowActionsMenu text="More" icon={<Settings />}>
                        <RowActionsItem icon={<Online />}>Additional Item 1</RowActionsItem>
                        <RowActionsItem icon={<Online />}>Additional Item 2</RowActionsItem>
                        <RowActionsItem icon={<Online />}>Additional Item 3</RowActionsItem>
                    </RowActionsMenu>
                    <Divider />
                    <RowActionsItem icon={<Delete />}>Delete</RowActionsItem>
                </RowActionsMenu>
            </RowActionsMenu>
        );
    },
    name: "Edit & Context Menu Example",
};
