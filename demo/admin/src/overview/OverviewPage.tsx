import { useQuery } from "@apollo/client";
import { LatestBuildsCard, LatestWarningsCard, useContentScope, useCurrentUser, useUserPermissionCheck } from "@dextinity/cms-admin";
import { OverviewLayout } from "@dextinity/ui";
import { subDays } from "date-fns";
import { type ReactNode, useState } from "react";
import { useIntl } from "react-intl";
import { Link as RouterLink } from "react-router-dom";

import { ContentCountsCard } from "./ContentCountsCard";
import { OverviewClock } from "./OverviewClock";
import { newsCountQuery, pageActivityQuery } from "./OverviewPage.gql";
import type {
    GQLOverviewNewsCountQuery,
    GQLOverviewNewsCountQueryVariables,
    GQLOverviewPageActivityQuery,
    GQLOverviewPageActivityQueryVariables,
} from "./OverviewPage.gql.generated";
import { countPagesEditedSince, PageActivityCard } from "./PageActivityCard";
import { RecentlyEditedCard } from "./RecentlyEditedCard";

function getTimeOfDay(date: Date) {
    const hour = date.getHours();
    return hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
}

export function OverviewPage() {
    const intl = useIntl();
    const user = useCurrentUser();
    const isAllowed = useUserPermissionCheck();
    const contentScope = useContentScope();
    const [now] = useState(() => new Date());
    const editedSince = subDays(now, 1);

    const pageActivity = useQuery<GQLOverviewPageActivityQuery, GQLOverviewPageActivityQueryVariables>(pageActivityQuery, {
        variables: { scope: contentScope.scope },
        skip: !isAllowed("pageTree"),
    });
    const newsCount = useQuery<GQLOverviewNewsCountQuery, GQLOverviewNewsCountQueryVariables>(newsCountQuery, {
        variables: { scope: contentScope.scope, updatedSince: editedSince.toISOString() },
        skip: !isAllowed("news"),
    });

    const scopeUrl = contentScope.match.url;
    const pageTreeUrl = `${scopeUrl}/pages/pagetree/main-navigation`;
    const newsUrl = `${scopeUrl}/structured-content/news`;

    const editedPages = pageActivity.data && countPagesEditedSince(pageActivity.data, editedSince);
    const editedNews = newsCount.data?.editedNews.totalCount;

    return (
        <OverviewLayout
            eyebrow={intl.formatMessage({ id: "overview.eyebrow", defaultMessage: "Dextinity Demo · Overview" })}
            title={intl.formatMessage(
                {
                    id: "overview.greeting",
                    defaultMessage:
                        "{timeOfDay, select, morning {Good morning, {name}} afternoon {Good afternoon, {name}} other {Good evening, {name}}}",
                },
                { timeOfDay: getTimeOfDay(now), name: user.name },
            )}
            summary={
                editedPages !== undefined && editedNews !== undefined
                    ? intl.formatMessage(
                          {
                              id: "overview.summary",
                              defaultMessage:
                                  "In the last 24 hours, <pagesLink>{isLowerBound, select, true {at least {pages} pages} other {{pages, plural, =0 {no pages} one {# page} other {# pages}}}}</pagesLink> and <newsLink>{news, plural, =0 {no news} one {# news article} other {# news articles}}</newsLink> were edited.",
                          },
                          {
                              pages: editedPages.count,
                              isLowerBound: String(editedPages.isLowerBound),
                              news: editedNews,
                              pagesLink: (chunks: ReactNode[]) => <RouterLink to={pageTreeUrl}>{chunks}</RouterLink>,
                              newsLink: (chunks: ReactNode[]) => <RouterLink to={newsUrl}>{chunks}</RouterLink>,
                          },
                      )
                    : undefined
            }
            aside={<OverviewClock />}
        >
            {isAllowed("pageTree") && <RecentlyEditedCard pageTreeUrl={pageTreeUrl} />}
            {isAllowed("pageTree") && <PageActivityCard query={pageActivity} now={now} pageTreeUrl={pageTreeUrl} />}
            {isAllowed("warnings") && <LatestWarningsCard warningsUrl={`${scopeUrl}/system/warnings`} />}
            <ContentCountsCard newsCount={newsCount} newsUrl={newsUrl} />
            {isAllowed("builds") && import.meta.env.MODE !== "development" && <LatestBuildsCard publisherUrl={`${scopeUrl}/system/publisher`} />}
        </OverviewLayout>
    );
}
