import { gql, useQuery } from "@apollo/client";
import { Button, useFocusAwarePolling } from "@dextinity/admin";
import { Pause, Play } from "@dextinity/admin-icons";
import { Typography } from "@mui/material";
import { useState } from "react";

import { apolloStoryDecorator } from "../../../apollo-story.decorator";

export default {
    title: "Docs/Hooks/useFocusAwarePolling",
    decorators: [apolloStoryDecorator(`https://api.spacex.land/graphql/`)],
};

export const BasicExample = {
    render: () => {
        const { data, loading, error, refetch, startPolling, stopPolling } = useQuery(
            gql`
                query LaunchesPast {
                    launchesPastResult(limit: 1) {
                        data {
                            id
                            mission_name
                            launch_date_local
                        }
                    }
                }
            `,
            {
                notifyOnNetworkStatusChange: true, // Only necessary to show loading indicator while polling
            },
        );

        useFocusAwarePolling({
            pollInterval: 10000,
            refetch,
            startPolling,
            stopPolling,
        });

        return (
            <>
                <Typography>
                    Most recent launch:
                    {loading
                        ? "Checking..."
                        : data && (
                              <>
                                  {data.launchesPastResult.data[0].mission_name}, {data.launchesPastResult.data[0].launch_date_local}
                              </>
                          )}
                </Typography>
                {error && <Typography color="error">Error: {JSON.stringify(error)}</Typography>}
            </>
        );
    },

    name: "Basic example",
};

export const WithSkipOption = {
    render: () => {
        const [paused, setPaused] = useState(false);

        const { data, loading, error, refetch, startPolling, stopPolling } = useQuery(
            gql`
                query LaunchesPast {
                    launchesPastResult(limit: 1) {
                        data {
                            id
                            mission_name
                            launch_date_local
                        }
                    }
                }
            `,
            {
                notifyOnNetworkStatusChange: true, // Only necessary to show loading indicator while polling
                skip: paused,
            },
        );

        useFocusAwarePolling({
            pollInterval: 10000,
            skip: paused, // <-- Make sure to add skip here too!
            refetch,
            startPolling,
            stopPolling,
        });

        return (
            <>
                <Typography>
                    Most recent launch:
                    {loading
                        ? "Checking..."
                        : data && (
                              <>
                                  {data.launchesPastResult.data[0].mission_name}, {data.launchesPastResult.data[0].launch_date_local}
                              </>
                          )}
                </Typography>
                <Button onClick={() => setPaused(!paused)} startIcon={paused ? <Play /> : <Pause />}>
                    {paused ? "Resume" : "Pause"}
                </Button>
                {error && <Typography color="error">Error: {JSON.stringify(error)}</Typography>}
            </>
        );
    },

    name: "With skip option",
};
