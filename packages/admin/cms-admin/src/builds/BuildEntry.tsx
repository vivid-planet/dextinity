import { gql, useQuery } from "@apollo/client";
import { LocalErrorScopeApolloContext, useFocusAwarePolling } from "@dextinity/admin";
import { Icon, IconButton, Popover, ProgressBar } from "@dextinity/ui";
import { differenceInMinutes, parseISO } from "date-fns";
import { useState } from "react";
import { FormattedMessage, FormattedRelativeTime, FormattedTime, useIntl } from "react-intl";

import { JobStatusIndicator } from "../cronJobs/JobStatusIndicator";
import type { GQLBuildStatusQuery } from "./BuildEntry.generated";
import { BuildStatusContent, BuildStatusError, BuildStatusRow, BuildStatusText } from "./BuildEntry.sc";
import { PublishButton } from "./PublishButton";

const buildStatusQuery = gql`
    query BuildStatus {
        autoBuildStatus {
            hasChangesSinceLastBuild
            lastCheck
            nextCheck
        }
        builds(limit: 1) {
            id
            status
            name
            trigger
            startTime
            completionTime
            estimatedCompletionTime
        }
    }
`;

function BuildStatus({ data: { autoBuildStatus, builds } }: { data: GQLBuildStatusQuery }) {
    const lastBuild = builds.length > 0 ? builds[0] : undefined;
    const isRunning = lastBuild?.status === "active" || lastBuild?.status === "pending";
    const lastBuildTime = lastBuild?.completionTime ?? lastBuild?.startTime;
    const remainingRuntime = lastBuild?.estimatedCompletionTime
        ? Math.abs(differenceInMinutes(parseISO(lastBuild.estimatedCompletionTime), new Date()))
        : undefined;

    return (
        <>
            {lastBuild && (
                <BuildStatusRow>
                    <JobStatusIndicator status={lastBuild.status} />
                    {lastBuildTime && (
                        <BuildStatusText>
                            <FormattedRelativeTime
                                value={-differenceInMinutes(new Date(), parseISO(lastBuildTime))}
                                unit="minute"
                                updateIntervalInSeconds={60}
                                numeric="auto"
                            />
                        </BuildStatusText>
                    )}
                </BuildStatusRow>
            )}
            {isRunning && (
                <>
                    <ProgressBar
                        value={null}
                        size="small"
                        label={<FormattedMessage id="dextinity.header.buildStatus.buildRunning" defaultMessage="Publication is in progress." />}
                    />
                    {remainingRuntime !== undefined && (
                        <BuildStatusText>
                            <FormattedMessage
                                id="dextinity.header.buildStatus.estimatedCompletion"
                                defaultMessage="Estimated time to finish: {remainingRuntime, plural,
                                    =0 {< 1 min}
                                    other {± # min}
                                }"
                                values={{ remainingRuntime }}
                            />
                        </BuildStatusText>
                    )}
                </>
            )}
            {lastBuild?.status === "failed" && (
                <BuildStatusError>
                    <FormattedMessage id="dextinity.header.buildStatus.lastBuildFailure" defaultMessage="Last publication failed" />
                </BuildStatusError>
            )}
            {autoBuildStatus.hasChangesSinceLastBuild ? (
                !isRunning && (
                    <>
                        <BuildStatusText>
                            <FormattedMessage
                                id="dextinity.header.buildStatus.nextScheduledBuild"
                                defaultMessage="New content changes found. Next publication is planned for: "
                            />{" "}
                            <FormattedTime value={parseISO(autoBuildStatus.nextCheck)} />
                        </BuildStatusText>
                        <PublishButton size="small" />
                    </>
                )
            ) : (
                <BuildStatusText>
                    <FormattedMessage id="dextinity.header.buildStatus.noChanges" defaultMessage="No new content changes" />
                </BuildStatusText>
            )}
        </>
    );
}

/**
 * The status of the static site generation for the top bar: whether a build is running, how the last one went, and when the next one is
 * planned.
 */
export function BuildEntry() {
    const intl = useIntl();
    const [open, setOpen] = useState(false);
    const isStatusUnavailable = process.env.NODE_ENV === "development";
    const { data, error, refetch, startPolling, stopPolling } = useQuery<GQLBuildStatusQuery>(buildStatusQuery, {
        skip: isStatusUnavailable,
        fetchPolicy: "network-only",
        context: LocalErrorScopeApolloContext,
    });

    useFocusAwarePolling({
        pollInterval: process.env.NODE_ENV === "production" ? 10000 : undefined,
        skip: isStatusUnavailable,
        refetch,
        startPolling,
        stopPolling,
    });

    const running = data?.builds[0]?.status === "active" || data?.builds[0]?.status === "pending";
    const title = intl.formatMessage({ id: "dextinity.header.buildStatus.staticSiteGeneration", defaultMessage: "Static Site Generation" });

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            placement="bottom-end"
            title={title}
            trigger={
                <IconButton aria-label={title} variant="text" color={running ? "primary" : "secondary"}>
                    <Icon name={running ? "static-site-generator-running" : "static-site-generator-standby"} />
                </IconButton>
            }
        >
            <BuildStatusContent>
                {error !== undefined && (
                    <BuildStatusError>
                        <FormattedMessage id="dextinity.header.buildStatus.error" defaultMessage="Failed to fetch build status" />
                    </BuildStatusError>
                )}
                {data && <BuildStatus data={data} />}
                {isStatusUnavailable && (
                    <BuildStatusText>
                        <FormattedMessage
                            id="dextinity.header.buildStatus.unavailableInDevelopment"
                            defaultMessage="The build status isn't available in local development."
                        />
                    </BuildStatusText>
                )}
            </BuildStatusContent>
        </Popover>
    );
}
