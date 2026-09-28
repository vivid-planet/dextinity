import { gql, useQuery } from "@apollo/client";
import { Button, useErrorDialog } from "@dextinity/admin";
import { Typography } from "@mui/material";
import { useState } from "react";

import { apolloSwapiStoryDecorator } from "../../../../apollo-story.decorator";
import { errorDialogStoryProviderDecorator } from "./error-dialog-provider.decorator";

export default {
    title: "Docs/Components/Error Handling/Error Dialog",
    decorators: [apolloSwapiStoryDecorator(), errorDialogStoryProviderDecorator()],
};

export const ManualErrorDialog = {
    render: () => {
        const Story = () => {
            const errorDialog = useErrorDialog();
            return (
                <div>
                    <Button
                        onClick={() => {
                            errorDialog?.showError({
                                title: "Error",
                                userMessage: "You can close the error dialog by pressing ok",
                                error: "This is an error detail information e.g. stack trace, which is only shown in development mode",
                            });
                        }}
                    >
                        Show Error Dialog
                    </Button>
                </div>
            );
        };
        return <Story />;
    },
};

export const AutomaticErrorOnGraphqlError = {
    render: () => {
        const Story = () => {
            const [brokenQuery, setBrokenQuery] = useState(false);
            const query = brokenQuery ? "{ allFilms { films { somenotavailablefield } } }" : "{ allFilms { films { title } } }";
            const { data, error } = useQuery(gql`
                ${query}
            `);
            return (
                <div>
                    <div style={{ backgroundColor: brokenQuery ? "red" : "green" }}>
                        <Typography variant="h4">Current Query: {brokenQuery ? "broken" : "working"}</Typography>
                    </div>
                    <Typography>Query: {query}</Typography>
                    <Button
                        onClick={() => {
                            setBrokenQuery(!brokenQuery);
                        }}
                    >
                        <Typography>Change Query</Typography>
                    </Button>
                    {error ? (
                        <div>
                            <Typography>
                                Error:
                                <br />
                                {JSON.stringify(error)}
                            </Typography>
                        </div>
                    ) : (
                        <div>
                            <Typography>
                                Response:
                                <br />
                                {JSON.stringify(data)}
                            </Typography>
                        </div>
                    )}
                </div>
            );
        };
        return <Story />;
    },
    name: "Automatic Error on Graphql Error",
};
