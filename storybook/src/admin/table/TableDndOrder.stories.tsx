import { Button, Stack, StackLink, StackPage, StackSwitch, TableDndOrder, TableLocalChanges } from "@dextinity/admin";
import { Stack as MuiStack } from "@mui/material";

import { dndProviderDecorator } from "../../dnd.decorator";
import { storyRouterDecorator } from "../../story-router.decorator";

interface IRow {
    id: string; // TODO add support for number in TableLocalChanges
    order: number;
    task: string;
}

export default {
    title: "@dextinity/admin/table",
    decorators: [storyRouterDecorator(), dndProviderDecorator()],
};

export const DnDOrder = {
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
                                    <MuiStack direction="row" gap={2} sx={{ mt: 2, alignItems: "center" }}>
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
