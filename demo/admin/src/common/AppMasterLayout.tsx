import { MasterLayout } from "@dextinity/admin";
import { AiModeSidePanel } from "@dextinity/cms-admin";

import MasterHeader from "./MasterHeader";
import { AppMasterMenu, AppMasterMenuRoutes } from "./MasterMenu";

export function AppMasterLayout() {
    return (
        <MasterLayout headerComponent={MasterHeader} menuComponent={AppMasterMenu} sidePanelComponent={AiModeSidePanel}>
            <AppMasterMenuRoutes />
        </MasterLayout>
    );
}
