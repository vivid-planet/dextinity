import { useQuery } from "@apollo/client";
import { Button, Card, CardRow, EmptyState, Icon, Link, Skeleton, StatusIndicator, type StatusIndicatorStatus } from "@dextinity/ui";
import { FormattedMessage, useIntl } from "react-intl";
import { Link as RouterLink, useHistory } from "react-router-dom";

import { useContentScope } from "../contentScope/Provider";
import { useDependenciesConfig } from "../dependencies/dependenciesConfig";
import type { GQLWarningSeverity } from "../graphql.generated";
import { latestWarningsQuery } from "./LatestWarningsDashboardWidget";
import type {
    GQLLatestWarningsListFragment,
    GQLLatestWarningsQuery,
    GQLLatestWarningsQueryVariables,
} from "./LatestWarningsDashboardWidget.generated";
import { useWarningSourceUrl } from "./useWarningSourceUrl";
import { WarningMessage } from "./WarningMessage";
import { useWarningsConfig } from "./warningsConfig";
import { warningSeverityLabels } from "./WarningSeverity";

const severityStatus: Record<GQLWarningSeverity, StatusIndicatorStatus> = {
    high: "critical",
    medium: "warning",
    low: "info",
};

export interface LatestWarningsCardProps {
    /** The URL of the full list of warnings, linked from the card's header and from warnings without a resolvable source. */
    warningsUrl?: string;
    /** Lists the warnings of all content scopes instead of only the current one. */
    showAllScopes?: boolean;
}

/**
 * The latest open warnings on an overview, built with `@dextinity/ui`. Each row leads to the source of the warning.
 */
export function LatestWarningsCard({ warningsUrl, showAllScopes = false }: LatestWarningsCardProps) {
    const intl = useIntl();
    const { scope: currentScope, values: scopeValues } = useContentScope();
    const scopes = showAllScopes ? scopeValues.map((item) => item.scope) : [currentScope];
    const { data, loading, error, refetch } = useQuery<GQLLatestWarningsQuery, GQLLatestWarningsQueryVariables>(latestWarningsQuery, {
        variables: { scopes },
        notifyOnNetworkStatusChange: true,
    });
    const warnings = data?.warnings.nodes ?? [];

    return (
        <Card
            title={intl.formatMessage({ id: "dextinity.latestWarningsCard.title", defaultMessage: "Warnings" })}
            icon={<Icon name="warning" duotone />}
            link={
                warningsUrl !== undefined && (
                    <Link render={<RouterLink to={warningsUrl} />} endIcon={<Icon name="arrow-right" />}>
                        <FormattedMessage id="dextinity.latestWarningsCard.all" defaultMessage="All" />
                    </Link>
                )
            }
        >
            {loading ? (
                <Skeleton variant="row" count={3} />
            ) : error ? (
                <EmptyState
                    icon={<Icon name="error" />}
                    title={intl.formatMessage({ id: "dextinity.latestWarningsCard.error.title", defaultMessage: "Couldn't load" })}
                    description={intl.formatMessage({
                        id: "dextinity.latestWarningsCard.error.description",
                        defaultMessage: "The warnings couldn't be loaded. Your content is not affected.",
                    })}
                    actions={
                        <Button variant="outlined" color="secondary" size="small" startIcon={<Icon name="reload" />} onClick={() => refetch()}>
                            <FormattedMessage id="dextinity.latestWarningsCard.error.retry" defaultMessage="Load again" />
                        </Button>
                    }
                />
            ) : warnings.length === 0 ? (
                <EmptyState
                    icon={<Icon name="check" />}
                    title={intl.formatMessage({ id: "dextinity.latestWarningsCard.empty", defaultMessage: "No open warnings" })}
                />
            ) : (
                warnings.map((warning) => <LatestWarningRow key={warning.id} warning={warning} warningsUrl={warningsUrl} />)
            )}
        </Card>
    );
}

function LatestWarningRow({ warning, warningsUrl }: { warning: GQLLatestWarningsListFragment; warningsUrl?: string }) {
    const intl = useIntl();
    const history = useHistory();
    const { messages } = useWarningsConfig();
    const { entityDependencyMap } = useDependenciesConfig();
    const loadSourceUrl = useWarningSourceUrl(warning.sourceInfo);

    const createdAt = intl.formatDate(warning.createdAt, { dateStyle: "medium", timeStyle: "short" });
    const source = entityDependencyMap[warning.sourceInfo.rootEntityName]?.displayName ?? warning.sourceInfo.rootEntityName;
    const rowProps = {
        title: <WarningMessage message={warning.message} warningMessages={messages} />,
        subtitle: (
            <FormattedMessage
                id="dextinity.latestWarningsCard.warningContext"
                defaultMessage="{source} · {createdAt}"
                values={{ source, createdAt }}
            />
        ),
        end: (
            <StatusIndicator status={severityStatus[warning.severity]}>{intl.formatMessage(warningSeverityLabels[warning.severity])}</StatusIndicator>
        ),
    };

    if (loadSourceUrl) {
        return <CardRow {...rowProps} render={<button type="button" />} onClick={async () => history.push(await loadSourceUrl())} />;
    }
    if (warningsUrl !== undefined) {
        return <CardRow {...rowProps} render={<RouterLink to={warningsUrl} />} />;
    }
    return <CardRow {...rowProps} render={<div />} />;
}
