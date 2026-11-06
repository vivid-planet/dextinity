import { useQuery } from "@apollo/client";
import { useContentScope } from "@dextinity/cms-admin";
import { Card, CardRow, EmptyState, Icon, Link, Skeleton } from "@dextinity/ui";
import { latestContentUpdatesQuery } from "@src/dashboard/LatestContentUpdates";
import type { GQLLatestContentUpdatesQuery, GQLLatestContentUpdatesQueryVariables } from "@src/dashboard/LatestContentUpdates.generated";
import { categoryToUrlParam } from "@src/pageTree/pageTreeCategories";
import { FormattedMessage, FormattedRelativeTime, useIntl } from "react-intl";
import { Link as RouterLink } from "react-router-dom";

import { LoadError } from "./LoadError";

interface RecentlyEditedCardProps {
    pageTreeUrl: string;
}

export function RecentlyEditedCard({ pageTreeUrl }: RecentlyEditedCardProps) {
    const intl = useIntl();
    const contentScope = useContentScope();
    const { data, loading, error, refetch } = useQuery<GQLLatestContentUpdatesQuery, GQLLatestContentUpdatesQueryVariables>(
        latestContentUpdatesQuery,
        { variables: { scope: contentScope.scope }, notifyOnNetworkStatusChange: true },
    );
    const nodes = data?.paginatedPageTreeNodes.nodes ?? [];

    return (
        <Card
            title={intl.formatMessage({ id: "overview.recentlyEdited.title", defaultMessage: "Recently edited" })}
            icon={<Icon name="recent" duotone />}
            link={
                <Link render={<RouterLink to={pageTreeUrl} />} endIcon={<Icon name="arrow-right" />}>
                    <FormattedMessage id="overview.recentlyEdited.pageTree" defaultMessage="Page tree" />
                </Link>
            }
        >
            {loading ? (
                <Skeleton variant="row" count={3} />
            ) : error ? (
                <LoadError onRetry={() => refetch()} />
            ) : nodes.length === 0 ? (
                <EmptyState
                    icon={<Icon name="page" />}
                    title={intl.formatMessage({ id: "overview.recentlyEdited.empty", defaultMessage: "No pages yet" })}
                />
            ) : (
                nodes.map((node) => (
                    <CardRow
                        key={node.id}
                        render={<RouterLink to={`${contentScope.match.url}/pages/pagetree/${categoryToUrlParam(node.category)}/${node.id}/edit`} />}
                        title={node.name}
                        subtitle={node.path}
                        end={<FormattedRelativeTime value={secondsSince(node.updatedAt)} numeric="auto" updateIntervalInSeconds={60} />}
                    />
                ))
            )}
        </Card>
    );
}

function secondsSince(date: string) {
    return Math.round((new Date(date).getTime() - Date.now()) / 1000);
}
