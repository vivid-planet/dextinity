import { Stack as MuiStack } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { DndDecorator } from "../../../.storybook/decorators/Dnd.decorator";
import { Button } from "../../common/buttons/Button";
import { StackPage } from "../../stack/Page";
import { Stack } from "../../stack/Stack";
import { StackLink } from "../../stack/StackLink";
import { StackSwitch } from "../../stack/Switch";
import { TableDndOrder } from "../TableDndOrder";
import { TableLocalChanges } from "../TableLocalChanges";

interface IRow {
    id: string; // TODO add support for number in TableLocalChanges
    order: number;
    task: string;
}

const meta: Meta = {
    title: "components/table/TableDndOrder",
    decorators: [DndDecorator],
};

export default meta;

type Story = StoryObj;

export const DnDOrder: Story = {
    render: () => {
        const data: IRow[] = [
            { id: "1", order: 1, task: "Write a cool JS library" },
            { id: "2", order: 2, task: "Make it generic enough" },
            { id: "3", order: 3, task: "Write README" },
            { id: "4", order: 4, task: "Create some examples" },
            { id: "5", order: 5, task: "PROFIT" },
        ];

        return (
            <Stack topLevelTitle="Stack">
                <StackSwitch>
                    <StackPage name="page-1">
                        <TableLocalChanges
                            data={data}
                            onSubmit={async (changes) => {
                                alert(JSON.stringify(changes));
                            }}
                            orderColumn="order" // if anything but 'pos' is used
                        >
                            {({ tableLocalChangesApi, data: changedData }) => (
                                <>
                                    <TableDndOrder
                                        data={changedData}
                                        totalCount={changedData.length}
                                        moveRow={tableLocalChangesApi.moveRow}
                                        onDragEnd={() => {
                                            // alternative to submit button
                                            // tableLocalChangesApi.submitLocalDataChanges();
                                        }}
                                        columns={[
                                            {
                                                name: "task",
                                                header: "Task",
                                            },
                                        ]}
                                    />
                                    <MuiStack
                                        direction="row"
                                        sx={{
                                            gap: 2,
                                            mt: 2,
                                            alignItems: "center",
                                        }}
                                    >
                                        <Button
                                            onClick={() => {
                                                tableLocalChangesApi.submitLocalDataChanges();
                                            }}
                                        >
                                            Submit
                                        </Button>
                                        {/* Link to test router prompt */}
                                        <StackLink pageName="page-2" payload="any">
                                            To page 2
                                        </StackLink>
                                    </MuiStack>
                                </>
                            )}
                        </TableLocalChanges>
                    </StackPage>
                    <StackPage name="page-2">Page 2</StackPage>
                </StackSwitch>
            </Stack>
        );
    },

    name: "DnD Order",
};
