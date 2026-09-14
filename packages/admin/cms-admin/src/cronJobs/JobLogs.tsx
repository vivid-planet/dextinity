import { gql, useQuery } from "@apollo/client";
import { Loading, StackPageTitle } from "@dextinity/admin";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import type { GQLKubernetesJobWithLogsQuery, GQLKubernetesJobWithLogsQueryVariables } from "./JobLogs.generated";

const LogsContainer = styled("pre")`
    margin: 0;
    overflow-x: auto;
`;

const jobWithLogsQuery = gql`
    query KubernetesJobWithLogs($name: String!) {
        kubernetesJob(name: $name) {
            id
            name
            label
        }
        kubernetesJobLogs(name: $name)
    }
`;

export function JobLogs(props: { jobName: string }) {
    const { jobName } = props;

    const { loading, data, error } = useQuery<GQLKubernetesJobWithLogsQuery, GQLKubernetesJobWithLogsQueryVariables>(jobWithLogsQuery, {
        variables: { name: jobName },
    });

    if (error) {
        throw error;
    }

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    const logs = data?.kubernetesJobLogs;
    const job = data?.kubernetesJob;

    return (
        <>
            <StackPageTitle
                title={
                    <FormattedMessage
                        id="dextinity.jobLogs.title"
                        defaultMessage="Job logs for {job}"
                        values={{
                            job: job?.label ? `${job?.label} (${job?.name})` : job?.name,
                        }}
                    />
                }
            />
            {logs ? (
                <Box paddingLeft={4}>
                    <LogsContainer>{logs}</LogsContainer>
                </Box>
            ) : (
                <Box padding={4}>
                    <Typography>
                        <FormattedMessage
                            id="dextinity.cronJobs.noLogs"
                            defaultMessage="No logs available. You may consider checking external logging tools if available."
                        />
                    </Typography>
                </Box>
            )}
        </>
    );
}
