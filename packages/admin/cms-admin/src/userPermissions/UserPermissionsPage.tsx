import {
    Button,
    FillSpace,
    MainContent,
    RouterTab,
    RouterTabs,
    Stack,
    StackLink,
    StackPage,
    StackSwitch,
    StackToolbar,
    ToolbarActions,
    ToolbarAutomaticTitleItem,
    ToolbarBackButton,
} from "@dextinity/admin";
import { Edit, Time } from "@dextinity/admin-icons";
import { IconButton } from "@mui/material";
import { FormattedMessage } from "react-intl";

import { ActionLogsGrid } from "../actionLog/actionLog/actionLogsGrid/ActionLogsGrid";
import { ContentScopeIndicator } from "../contentScope/ContentScopeIndicator";
import { useContentScopeConfig } from "../contentScope/useContentScopeConfig";
import { useRoutePathBelowContentScope } from "../contentScope/useRoutePathBelowContentScope";
import { UserPermissionActionLogUser } from "./actionLog/UserPermissionActionLogUser";
import { useUserPermissionCheck } from "./hooks/currentUser";
import { UserPermissionsUserPageBasicDataPanel } from "./user/basicData/UserBasicData";
import { UserPermissionsUserPagePermissionsPanel } from "./user/permissions/PermissionsPanel";
import { UserPermissionsUserPageToolbar } from "./user/UserPageToolbar";
import { UserPermissionsUserGrid } from "./UserGrid";
import { camelCaseToHumanReadable } from "./utils/camelCaseToHumanReadable";

function getUserPermissionDisplayName(snapshot: Record<string, unknown>): string | undefined {
    return typeof snapshot.permission === "string" ? camelCaseToHumanReadable(snapshot.permission) : undefined;
}

function renderUserPermissionUser(snapshot: Record<string, unknown>) {
    return typeof snapshot.userId === "string" ? <UserPermissionActionLogUser userId={snapshot.userId} /> : undefined;
}

export const UserPermissionsPage = () => {
    const isAllowed = useUserPermissionCheck();
    const location = useRoutePathBelowContentScope();
    useContentScopeConfig({ redirectPathAfterChange: location });

    return (
        <Stack topLevelTitle={<FormattedMessage id="dextinity.userPermissions.title" defaultMessage="User Permissions" />}>
            <StackSwitch>
                <StackPage name="table">
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                        <FillSpace />
                        {isAllowed("userPermissions") && (
                            <ToolbarActions>
                                <Button variant="textDark" startIcon={<Time />} component={StackLink} pageName="action-log" payload="action-log">
                                    <FormattedMessage id="dextinity.actionLogButton.title" defaultMessage="Action Log" />
                                </Button>
                            </ToolbarActions>
                        )}
                    </StackToolbar>
                    <MainContent fullHeight>
                        <UserPermissionsUserGrid
                            rowAction={(params) => (
                                <IconButton color="primary" component={StackLink} nativeButton={false} pageName="edit" payload={params.row.id}>
                                    <Edit />
                                </IconButton>
                            )}
                        />
                    </MainContent>
                </StackPage>
                <StackPage name="action-log" title={<FormattedMessage id="dextinity.userPermissions.actionLog" defaultMessage="Action Log" />}>
                    <StackToolbar scopeIndicator={<ContentScopeIndicator global />}>
                        <ToolbarBackButton />
                        <ToolbarAutomaticTitleItem />
                    </StackToolbar>
                    <ActionLogsGrid
                        entity="UserPermission"
                        getDisplayName={getUserPermissionDisplayName}
                        renderEntitySecondaryText={renderUserPermissionUser}
                    />
                </StackPage>
                <StackPage name="edit" title={<FormattedMessage id="dextinity.userPermissions.edit" defaultMessage="User" />}>
                    {(userId) => (
                        <>
                            <UserPermissionsUserPageToolbar userId={userId} />
                            <MainContent>
                                <RouterTabs>
                                    <RouterTab
                                        path={isAllowed("userPermissions") ? "/basic-data" : ""}
                                        label={<FormattedMessage id="dextinity.userPermissions.basicData" defaultMessage="Basic Data" />}
                                    >
                                        <UserPermissionsUserPageBasicDataPanel userId={userId} />
                                    </RouterTab>
                                    {isAllowed("userPermissions") && (
                                        <RouterTab
                                            path=""
                                            label={<FormattedMessage id="dextinity.userPermissions.permissions" defaultMessage="Permissions" />}
                                        >
                                            <UserPermissionsUserPagePermissionsPanel userId={userId} />
                                        </RouterTab>
                                    )}
                                </RouterTabs>
                            </MainContent>
                        </>
                    )}
                </StackPage>
            </StackSwitch>
        </Stack>
    );
};
