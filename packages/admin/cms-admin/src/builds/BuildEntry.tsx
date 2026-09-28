import { gql, useQuery } from "@apollo/client";
import { AppHeaderDropdown, LocalErrorScopeApolloContext, useFocusAwarePolling } from "@dextinity/admin";
import { SsgRunning, SsgStandby } from "@dextinity/admin-icons";
import { Box, List, ListItem, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { differenceInMinutes, parseISO } from "date-fns";
import type { ReactNode } from "react";
import { FormattedMessage, FormattedTime } from "react-intl";

import type { GQLBuildStatusQuery } from "./BuildEntry.generated";
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

const BuildStatusPopperContent = ({ data: { autoBuildStatus, builds } }: { data: GQLBuildStatusQuery }) => {
    const content: ReactNode[] = [];
    const lastBuild = builds.length > 0 ? builds[0] : undefined;

    if (lastBuild) {
        if (lastBuild.status === "active" || lastBuild.status === "pending") {
            let remainingRuntime: number | undefined;

            if (lastBuild.estimatedCompletionTime) {
                remainingRuntime = Math.abs(differenceInMinutes(parseISO(lastBuild.estimatedCompletionTime), new Date()));
            }

            content.push(
                <Typography variant="body2">
                    <FormattedMessage id="dextinity.header.buildStatus.buildRunning" defaultMessage="Publication is in progress." />
                    {remainingRuntime !== undefined && (
                        <>
                            {" "}
                            <FormattedMessage
                                id="dextinity.header.buildStatus.estimatedCompletion"
                                defaultMessage="Estimated time to finish: {remainingRuntime, plural,
                                    =0 {< 1 min}
                                    other {± # min}
                                }"
                                values={{ remainingRuntime }}
                            />
                        </>
                    )}
                </Typography>,
            );
        } else if (autoBuildStatus.hasChangesSinceLastBuild) {
            const nextCheck = parseISO(autoBuildStatus.nextCheck);

            content.push(
                <Typography variant="body2">
                    <FormattedMessage
                        id="dextinity.header.buildStatus.nextScheduledBuild"
                        defaultMessage="New content changes found. Next publication is planned for: "
                    />{" "}
                    <FormattedTime value={nextCheck} />
                </Typography>,
            );
            content.push(<PublishButton />);
        }

        if (lastBuild.status === "failed") {
            content.push(
                <Typography variant="body2" color="error">
                    <FormattedMessage id="dextinity.header.buildStatus.lastBuildFailure" defaultMessage="Last publication failed" />
                </Typography>,
            );
        }
    }

    if (!autoBuildStatus.hasChangesSinceLastBuild) {
        content.push(
            <Typography variant="body2">
                <FormattedMessage id="dextinity.header.buildStatus.noChanges" defaultMessage="No new content changes" />
            </Typography>,
        );
    }

    return (
        <>
            {content.map((item, index) => (
                <ListItem key={index} dense={false} divider={index !== content.length - 1}>
                    {item}
                </ListItem>
            ))}
        </>
    );
};

export function BuildEntry() {
    const { data, error, refetch, startPolling, stopPolling } = useQuery<GQLBuildStatusQuery>(buildStatusQuery, {
        skip: process.env.NODE_ENV === "development",
        fetchPolicy: "network-only",
        context: LocalErrorScopeApolloContext,
    });

    useFocusAwarePolling({
        pollInterval: process.env.NODE_ENV === "production" ? 10000 : undefined,
        skip: process.env.NODE_ENV === "development",
        refetch,
        startPolling,
        stopPolling,
    });

    const running = data?.builds[0]?.status === "active" || data?.builds[0]?.status === "pending";

    return (
        <AppHeaderDropdown
            startIcon={running ? <SsgRunning color="primary" /> : <SsgStandby />}
            dropdownArrow={null}
            slotProps={{
                button: {
                    slotProps: {
                        content: {
                            sx: (theme) => ({
                                paddingX: "17px",

                                [theme.breakpoints.up("md")]: {
                                    paddingX: theme.spacing(4),
                                },
                            }),
                        },
                    },
                },
            }}
        >
            <Content>
                <List>
                    <ListItem dense={false}>
                        <Typography variant="body2">
                            <strong>
                                <FormattedMessage id="dextinity.header.buildStatus.staticSiteGeneration" defaultMessage="Static Site Generation" />
                            </strong>
                        </Typography>
                    </ListItem>
                    {error !== undefined && (
                        <ListItem dense={false}>
                            <Typography variant="body2" color="error">
                                <FormattedMessage id="dextinity.header.buildStatus.error" defaultMessage="Failed to fetch build status" />
                            </Typography>
                        </ListItem>
                    )}
                    {data && <BuildStatusPopperContent data={data} />}
                </List>
            </Content>
        </AppHeaderDropdown>
    );
}

const Content = styled(Box)`
    padding: ${({ theme }) => theme.spacing(1, 0)};
    width: 300px;
    min-height: 40px;
`;
