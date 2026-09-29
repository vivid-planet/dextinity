import {
    Button,
    FillSpace,
    FullHeightContent,
    MainContent,
    RouterTab,
    RouterTabs,
    StackToolbar,
    ToolbarActions,
    ToolbarAutomaticTitleItem,
    ToolbarBackButton,
} from "@dextinity/admin";
import { Add } from "@dextinity/admin-icons";
import { ContentScopeIndicator } from "@dextinity/cms-admin";

import { ExampleDataGrid } from "../helpers/ExampleDataGrid";
import { masterLayoutDecorator, stackRouteDecorator } from "../helpers/storyDecorators";
import { storyRouterDecorator } from "../story-router.decorator";

export default {
    title: "@dextinity/admin/FullHeightContent",
    decorators: [masterLayoutDecorator(), stackRouteDecorator(), storyRouterDecorator()],
    parameters: {
        layout: "none",
    },
};

export const WithToolbarMainContentAndTabs = {
    render: () => (
        <>
            <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
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
                            <ExampleDataGrid />
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
