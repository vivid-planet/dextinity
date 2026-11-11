import { gql, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext } from "@dextinity/admin";
import { Button, Card, CardRow, EmptyState, Icon, Link, Skeleton } from "@dextinity/ui";
import { parseISO } from "date-fns";
import { FormattedMessage, useIntl } from "react-intl";
import { Link as RouterLink } from "react-router-dom";

import { JobRuntime } from "../cronJobs/JobRuntime";
import { JobStatusIndicator } from "../cronJobs/JobStatusIndicator";
import type { GQLLatestBuildsQuery, GQLLatestBuildsQueryVariables } from "./LatestBuildsCard.generated";

const latestBuildsQuery = gql`
    query LatestBuilds {
        builds(limit: 5) {
            id
            status
            name
            trigger
            startTime
            completionTime
        }
    }
`;

export interface LatestBuildsCardProps {
    /** The URL of the publisher, linked from the card's header and from each build. */
    publisherUrl: string;
}

/**
 * The latest site builds on an overview, built with `@dextinity/ui`.
 */
export function LatestBuildsCard({ publisherUrl }: LatestBuildsCardProps) {
    const intl = useIntl();
    const { data, loading, error, refetch } = useQuery<GQLLatestBuildsQuery, GQLLatestBuildsQueryVariables>(latestBuildsQuery, {
        notifyOnNetworkStatusChange: true,
        context: LocalErrorScopeApolloContext,
    });
    const builds = data?.builds ?? [];

    return (
        <Card
            title={intl.formatMessage({ id: "dextinity.latestBuildsCard.title", defaultMessage: "Builds" })}
            icon={<Icon name="online" duotone />}
            link={
                <Link render={<RouterLink to={publisherUrl} />} endIcon={<Icon name="arrow-right" />}>
                    <FormattedMessage id="dextinity.latestBuildsCard.publisher" defaultMessage="Publisher" />
                </Link>
            }
        >
            {loading ? (
                <Skeleton variant="row" count={3} />
            ) : error ? (
                <EmptyState
                    icon={<Icon name="error" />}
                    title={intl.formatMessage({ id: "dextinity.latestBuildsCard.error.title", defaultMessage: "Couldn't load" })}
                    description={intl.formatMessage({
                        id: "dextinity.latestBuildsCard.error.description",
                        defaultMessage: "The builds couldn't be loaded. Your content is not affected.",
                    })}
                    actions={
                        <Button variant="outlined" color="secondary" size="small" startIcon={<Icon name="reload" />} onClick={() => refetch()}>
                            <FormattedMessage id="dextinity.latestBuildsCard.error.retry" defaultMessage="Load again" />
                        </Button>
                    }
                />
            ) : builds.length === 0 ? (
                <EmptyState
                    icon={<Icon name="online" />}
                    title={intl.formatMessage({ id: "dextinity.latestBuildsCard.empty", defaultMessage: "No builds yet" })}
                />
            ) : (
                builds.map((build) => (
                    <CardRow
                        key={build.id}
                        render={<RouterLink to={publisherUrl} />}
                        title={build.name ?? intl.formatMessage({ id: "dextinity.latestBuildsCard.unnamedBuild", defaultMessage: "Build" })}
                        subtitle={
                            <JobRuntime
                                startTime={build.startTime ? parseISO(build.startTime) : undefined}
                                completionTime={build.completionTime ? parseISO(build.completionTime) : undefined}
                            />
                        }
                        end={<JobStatusIndicator status={build.status} />}
                    />
                ))
            )}
        </Card>
    );
}
