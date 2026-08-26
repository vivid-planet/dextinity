import { Button, TableDndOrder, TableLocalChanges } from "@dextinity/admin";

import { dndProviderDecorator } from "../../../dnd.decorator";

export default {
    title: "Docs/Components/Table/TableDndOrder",
    decorators: [dndProviderDecorator()],
};

export const _TableDndOrder = {
    render: () => {
        const initialData = [
            { id: "1", order: 1, task: "Write a cool JS library" },
            { id: "2", order: 2, task: "Make it generic enough" },
            { id: "3", order: 3, task: "Write README" },
            { id: "4", order: 4, task: "Create some examples" },
            { id: "5", order: 5, task: "PROFIT" },
        ];

        return (
            <TableLocalChanges
                data={initialData}
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
                        <Button
                            onClick={() => {
                                tableLocalChangesApi.submitLocalDataChanges();
                            }}
                        >
                            Submit
                        </Button>
                    </>
                )}
            </TableLocalChanges>
        );
    },

    name: "TableDndOrder",
};
