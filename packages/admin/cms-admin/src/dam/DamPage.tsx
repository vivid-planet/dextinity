import { Stack, StackPage, StackSwitch } from "@dextinity/admin";
import type { ReactNode } from "react";
import { useIntl } from "react-intl";
import { useRouteMatch } from "react-router";

import type { ContentScope } from "../contentScope/Provider";
import { DamScopeProvider } from "./config/DamScopeProvider";
import EditFile from "./FileForm/EditFile";
import { DamFinderPage } from "./finder/DamFinderPage";
import { DamSettings } from "./settings/DamSettings";

interface DamPageProps {
    /** @deprecated Unused, the content scope is shown in the top bar. */
    renderContentScopeIndicator?: (scope: ContentScope) => ReactNode;
    /** Further actions in the finder's page header. Defaults to `additionalToolbarItems` of the DAM config. */
    additionalToolbarItems?: ReactNode;
}

/**
 * The assets: the finder (`DamFinderPage`) at the route of the page, a file's settings at `<route>/<fileId>/edit`, and the DAM settings
 * at `<route>/settings/settings`.
 */
function DamPage({ additionalToolbarItems }: DamPageProps) {
    const intl = useIntl();
    const match = useRouteMatch();
    const baseUrl = match.url.replace(/\/$/, "");

    return (
        <DamScopeProvider>
            <Stack topLevelTitle={intl.formatMessage({ id: "dextinity.damFinder.title", defaultMessage: "Assets" })}>
                <StackSwitch initialPage="finder">
                    <StackPage name="finder">
                        <DamFinderPage
                            editFileUrl={(fileId) => `${baseUrl}/${fileId}/edit`}
                            settingsUrl={`${baseUrl}/settings/settings`}
                            additionalToolbarItems={additionalToolbarItems}
                        />
                    </StackPage>
                    <StackPage name="edit" title={intl.formatMessage({ id: "dextinity.pages.dam.edit", defaultMessage: "Edit" })}>
                        {(fileId: string) => <EditFile id={fileId} />}
                    </StackPage>
                    <StackPage name="settings" title={intl.formatMessage({ id: "dextinity.pages.dam.settings", defaultMessage: "Settings" })}>
                        <DamSettings />
                    </StackPage>
                </StackSwitch>
            </Stack>
        </DamScopeProvider>
    );
}

export { DamPage };
