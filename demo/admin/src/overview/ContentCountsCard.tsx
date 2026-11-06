import { type QueryResult, useQuery } from "@apollo/client";
import { useContentScope, useUserPermissionCheck } from "@dextinity/cms-admin";
import { Card, Icon, StatTile } from "@dextinity/ui";
import { useIntl } from "react-intl";
import { Link as RouterLink } from "react-router-dom";

import { productsCountQuery, redirectsCountQuery, warningsCountQuery } from "./ContentCountsCard.gql";
import type {
    GQLOverviewProductsCountQuery,
    GQLOverviewProductsCountQueryVariables,
    GQLOverviewRedirectsCountQuery,
    GQLOverviewRedirectsCountQueryVariables,
    GQLOverviewWarningsCountQuery,
    GQLOverviewWarningsCountQueryVariables,
} from "./ContentCountsCard.gql.generated";
import type { GQLOverviewNewsCountQuery, GQLOverviewNewsCountQueryVariables } from "./OverviewPage.gql.generated";
import styles from "./OverviewPage.module.css";

interface ContentCountsCardProps {
    newsCount: QueryResult<GQLOverviewNewsCountQuery, GQLOverviewNewsCountQueryVariables>;
    newsUrl: string;
}

export function ContentCountsCard({ newsCount, newsUrl }: ContentCountsCardProps) {
    const intl = useIntl();
    const isAllowed = useUserPermissionCheck();
    const contentScope = useContentScope();
    const scopeUrl = contentScope.match.url;

    const productsCount = useQuery<GQLOverviewProductsCountQuery, GQLOverviewProductsCountQueryVariables>(productsCountQuery, {
        skip: !isAllowed("products"),
    });
    const redirectsCount = useQuery<GQLOverviewRedirectsCountQuery, GQLOverviewRedirectsCountQueryVariables>(redirectsCountQuery, {
        variables: { scope: { domain: contentScope.scope.domain } },
        skip: !isAllowed("pageTree"),
    });
    const warningsCount = useQuery<GQLOverviewWarningsCountQuery, GQLOverviewWarningsCountQueryVariables>(warningsCountQuery, {
        variables: { scopes: [contentScope.scope] },
        skip: !isAllowed("warnings"),
    });

    const formatCount = (count: number | undefined) => (count === undefined ? "–" : intl.formatNumber(count));

    return (
        <Card title={intl.formatMessage({ id: "overview.contentCounts.title", defaultMessage: "Content" })} icon={<Icon name="blocks" duotone />}>
            <div className={styles.tiles}>
                {isAllowed("news") && (
                    <RouterLink to={newsUrl} className={styles.tileLink}>
                        <StatTile
                            value={formatCount(newsCount.data?.newsList.totalCount)}
                            label={intl.formatMessage({ id: "overview.contentCounts.news", defaultMessage: "News" })}
                            context={intl.formatMessage(
                                { id: "overview.contentCounts.newsContext", defaultMessage: "{count} edited in the last 24 hours" },
                                { count: formatCount(newsCount.data?.editedNews.totalCount) },
                            )}
                        />
                    </RouterLink>
                )}
                {isAllowed("products") && (
                    <RouterLink to={`${scopeUrl}/products`} className={styles.tileLink}>
                        <StatTile
                            value={formatCount(productsCount.data?.products.totalCount)}
                            label={intl.formatMessage({ id: "overview.contentCounts.products", defaultMessage: "Products" })}
                            context={intl.formatMessage({ id: "overview.contentCounts.productsContext", defaultMessage: "In all scopes" })}
                        />
                    </RouterLink>
                )}
                {isAllowed("pageTree") && (
                    <RouterLink to={`${scopeUrl}/system/redirects`} className={styles.tileLink}>
                        <StatTile
                            value={formatCount(redirectsCount.data?.paginatedRedirects.totalCount)}
                            label={intl.formatMessage({ id: "overview.contentCounts.redirects", defaultMessage: "Active redirects" })}
                            context={intl.formatMessage(
                                { id: "overview.contentCounts.redirectsContext", defaultMessage: "On {domain}" },
                                { domain: contentScope.scope.domain },
                            )}
                        />
                    </RouterLink>
                )}
                {isAllowed("warnings") && (
                    <RouterLink to={`${scopeUrl}/system/warnings`} className={styles.tileLink}>
                        <StatTile
                            value={formatCount(warningsCount.data?.warnings.totalCount)}
                            label={intl.formatMessage({ id: "overview.contentCounts.warnings", defaultMessage: "Open warnings" })}
                            context={intl.formatMessage({ id: "overview.contentCounts.warningsContext", defaultMessage: "In this scope" })}
                        />
                    </RouterLink>
                )}
            </div>
        </Card>
    );
}
