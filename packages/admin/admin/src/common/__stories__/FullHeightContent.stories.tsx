import { Add } from "@dextinity/admin-icons";
import { DataGrid } from "@mui/x-data-grid";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MasterLayoutDecorator } from "../../../.storybook/decorators/MasterLayout.decorator";
import type { GridColDef } from "../../dataGrid/GridColDef";
import { RouterTab, RouterTabs } from "../../tabs/RouterTabs";
import { Button } from "../buttons/Button";
import { FillSpace } from "../FillSpace";
import { FullHeightContent } from "../FullHeightContent";
import { MainContent } from "../MainContent";
import { ToolbarActions } from "../toolbar/actions/ToolbarActions";
import { ToolbarAutomaticTitleItem } from "../toolbar/automatictitleitem/ToolbarAutomaticTitleItem";
import { ToolbarBackButton } from "../toolbar/backbutton/ToolbarBackButton";
import { StackToolbar } from "../toolbar/StackToolbar";

const rows = [
    { id: 1, lastName: "Snow", firstName: "Jon" },
    { id: 2, lastName: "Lannister", firstName: "Cersei" },
    { id: 3, lastName: "Lannister", firstName: "Jaime" },
    { id: 4, lastName: "Stark", firstName: "Arya" },
    { id: 5, lastName: "Targaryen", firstName: "Daenerys" },
    { id: 6, lastName: "Melisandre", firstName: null },
    { id: 7, lastName: "Clifford", firstName: "Ferrara" },
    { id: 8, lastName: "Frances", firstName: "Rossini" },
    { id: 9, lastName: "Roxie", firstName: "Harvey" },
];

const columns: GridColDef[] = [
    { field: "firstName", headerName: "First name", flex: 1 },
    { field: "lastName", headerName: "Last name", flex: 1 },
];

const meta: Meta = {
    title: "components/common/FullHeightContent",
    decorators: [MasterLayoutDecorator],
    parameters: {
        layout: "none",
        stack: { topLevelTitle: "Example Page" },
    },
};

export default meta;

type Story = StoryObj;

export const WithToolbarMainContentAndTabs: Story = {
    render: () => (
        <>
            <StackToolbar>
                <ToolbarBackButton />
                <ToolbarAutomaticTitleItem />
                <FillSpace />
                <ToolbarActions>
                    <Button variant="primary" startIcon={<Add />}>
                        Add something
                    </Button>
                </ToolbarActions>
            </StackToolbar>
            <MainContent>
                <RouterTabs>
                    <RouterTab label="DataGrid Example" path="">
                        <FullHeightContent>
                            <DataGrid rows={rows} columns={columns} />
                        </FullHeightContent>
                    </RouterTab>
                    <RouterTab label="Disabled example tab" path="/disabled-example-tab" disabled>
                        {null}
                    </RouterTab>
                    <RouterTab label="Another disabled example tab" path="/another-disabled-example-tab" disabled>
                        {null}
                    </RouterTab>
                </RouterTabs>
            </MainContent>
        </>
    ),
};
