import { EditLayout, Tabs } from "@dextinity/ui";
import { useIntl } from "react-intl";
import { Route, Switch, useLocation, useRouteMatch } from "react-router";

import { RouterTabLink } from "../common/RouterTabLink";
import { useContentScope } from "../contentScope/Provider";
import { useContentScopeConfig } from "../contentScope/useContentScopeConfig";
import { useUserPermissionCheck } from "./hooks/currentUser";
import { UserPermissionsUserPageBasicDataPanel } from "./user/basicData/UserBasicData";
import { UserPermissionsUserPagePermissionsPanel } from "./user/permissions/PermissionsPanel";
import { UserPermissionsUserPageToolbar } from "./user/UserPageToolbar";
import { UserPermissionsUserGrid } from "./UserGrid";
import { UserPageContent } from "./UserPermissionsPage.sc";

/**
 * The users with their permissions and content scopes, built with `@dextinity/ui`: the list of users, and a page per user at
 * `<list URL>/<id>/edit` with the tabs Permissions and Basic data.
 */
export const UserPermissionsPage = () => {
    const { match } = useContentScope();
    const routeMatch = useRouteMatch();
    useContentScopeConfig({ redirectPathAfterChange: routeMatch.url.replace(match.url, "") });

    return (
        <Switch>
            <Route path={`${routeMatch.path}/:userId/edit`}>
                {({ match: userMatch }) =>
                    userMatch && <UserPage userId={userMatch.params.userId} userUrl={userMatch.url} listUrl={routeMatch.url} />
                }
            </Route>
            <Route>
                <UserPermissionsUserGrid />
            </Route>
        </Switch>
    );
};

type UserPageTab = "permissions" | "basicData";

interface UserPageProps {
    userId: string;
    userUrl: string;
    listUrl: string;
}

function UserPage({ userId, userUrl, listUrl }: UserPageProps) {
    const intl = useIntl();
    const location = useLocation();
    const isAllowed = useUserPermissionCheck();
    const showsPermissions = isAllowed("userPermissions");
    const basicDataUrl = showsPermissions ? `${userUrl}/basic-data` : userUrl;
    const selectedTab: UserPageTab = showsPermissions && !location.pathname.startsWith(`${userUrl}/basic-data`) ? "permissions" : "basicData";

    const tabs = [
        ...(showsPermissions
            ? [
                  {
                      value: "permissions" as const,
                      label: intl.formatMessage({ id: "dextinity.userPermissions.permissions", defaultMessage: "Permissions" }),
                      href: userUrl,
                  },
              ]
            : []),
        {
            value: "basicData" as const,
            label: intl.formatMessage({ id: "dextinity.userPermissions.basicData", defaultMessage: "Basic Data" }),
            href: basicDataUrl,
        },
    ];

    return (
        <EditLayout
            header={
                <UserPermissionsUserPageToolbar
                    userId={userId}
                    back={{
                        label: intl.formatMessage({ id: "dextinity.userPermissions.title", defaultMessage: "User Permissions" }),
                        href: listUrl,
                    }}
                />
            }
        >
            <UserPageContent>
                <Tabs<UserPageTab>
                    aria-label={intl.formatMessage({ id: "dextinity.userPermissions.userTabs", defaultMessage: "User" })}
                    value={selectedTab}
                    onChange={() => {
                        // The tabs are router links, which navigate themselves; the route decides the selected tab
                    }}
                    items={tabs}
                    slots={{ tab: RouterTabLink }}
                />
                {selectedTab === "permissions" ? (
                    <UserPermissionsUserPagePermissionsPanel userId={userId} />
                ) : (
                    <UserPermissionsUserPageBasicDataPanel userId={userId} />
                )}
            </UserPageContent>
        </EditLayout>
    );
}
