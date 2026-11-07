import { type BlockInterface, useContentScope, useContentScopeConfig } from "@dextinity/cms-admin";
import { ToastViewport, useToasts } from "@dextinity/ui";
import type { JSX } from "react";
import { useIntl } from "react-intl";
import { Redirect, Route, Switch, useRouteMatch } from "react-router";

import { useBrevoScope } from "../common/useBrevoScope";
import { ConfigVerification } from "../configVerification/ConfigVerification";
import { EmailCampaignEditor } from "./editor/EmailCampaignEditor";
import { EmailCampaignsListPage } from "./list/EmailCampaignsListPage";
import { EmailCampaignStatistics } from "./statistics/EmailCampaignStatistics";
import { EmailCampaignView } from "./view/EmailCampaignView";

interface CreateEmailCampaignsPageOptions {
    EmailCampaignContentBlock: BlockInterface;
}

/**
 * Creates the page of the email campaigns: the list at its URL, the editor at `add` and `<id>/edit`, and the read-only view and the
 * statistics of sent campaigns at `<id>/view` and `<id>/statistics`.
 */
export function createEmailCampaignsPage({ EmailCampaignContentBlock }: CreateEmailCampaignsPageOptions) {
    function EmailCampaignsPage(): JSX.Element {
        const intl = useIntl();
        const match = useRouteMatch();
        const { match: scopeMatch } = useContentScope();
        const { scope, scopeLabel } = useBrevoScope();
        const { toasts, add: addToast, dismiss: dismissToast } = useToasts();
        useContentScopeConfig({ redirectPathAfterChange: match.url.replace(scopeMatch.url, "") });
        const baseUrl = match.url;

        return (
            <ConfigVerification scope={scope}>
                <Switch>
                    <Route exact path={match.path}>
                        <EmailCampaignsListPage
                            baseUrl={baseUrl}
                            scope={scope}
                            scopeLabel={scopeLabel}
                            addToast={addToast}
                            EmailCampaignContentBlock={EmailCampaignContentBlock}
                        />
                    </Route>
                    <Route path={`${match.path}/add`}>
                        <EmailCampaignEditor
                            baseUrl={baseUrl}
                            scope={scope}
                            scopeLabel={scopeLabel}
                            addToast={addToast}
                            EmailCampaignContentBlock={EmailCampaignContentBlock}
                        />
                    </Route>
                    <Route
                        path={`${match.path}/:id/edit`}
                        render={({ match: editMatch }) => (
                            <EmailCampaignEditor
                                key={editMatch.params.id}
                                baseUrl={baseUrl}
                                id={editMatch.params.id}
                                scope={scope}
                                scopeLabel={scopeLabel}
                                addToast={addToast}
                                EmailCampaignContentBlock={EmailCampaignContentBlock}
                            />
                        )}
                    />
                    <Route
                        path={`${match.path}/:id/view`}
                        render={({ match: viewMatch }) => (
                            <EmailCampaignView
                                key={viewMatch.params.id}
                                baseUrl={baseUrl}
                                id={viewMatch.params.id}
                                scope={scope}
                                scopeLabel={scopeLabel}
                                EmailCampaignContentBlock={EmailCampaignContentBlock}
                            />
                        )}
                    />
                    <Route
                        path={`${match.path}/:id/statistics`}
                        render={({ match: statisticsMatch }) => (
                            <EmailCampaignStatistics
                                key={statisticsMatch.params.id}
                                baseUrl={baseUrl}
                                id={statisticsMatch.params.id}
                                scopeLabel={scopeLabel}
                            />
                        )}
                    />
                    <Redirect to={baseUrl} />
                </Switch>
                <ToastViewport
                    toasts={toasts}
                    onDismiss={dismissToast}
                    labels={{ region: intl.formatMessage({ id: "dextinity.emailCampaigns.notifications", defaultMessage: "Notifications" }) }}
                />
            </ConfigVerification>
        );
    }
    return EmailCampaignsPage;
}
