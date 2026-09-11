import { Alert, ErrorBoundary } from "@dextinity/admin";
import { Box, Card, CardContent, Link, Typography } from "@mui/material";
import type { Meta } from "@storybook/react-vite";

const ViewWithNoError = () => {
    return (
        <div>
            <Typography>View with No Error</Typography>
        </div>
    );
};

const ViewWithError = () => {
    throw new Error("Some error occurred");
    return (
        <div>
            <Typography>Error</Typography>
        </div>
    );
};

export default {
    title: "@dextinity/admin/error-handling/error-boundaries",
    args: {
        renderViewWithErrors: false,
    },
    argTypes: {
        renderViewWithErrors: {
            name: "Render view with errors",
            control: "boolean",
        },
    },
} as Meta<typeof ErrorBoundary>;

type Args = {
    renderViewWithErrors: boolean;
};

export const _ErrorBoundary = {
    render: ({ renderViewWithErrors }: Args) => {
        return (
            <>
                <Box marginBottom={4}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h3" gutterBottom>
                                Error Boundaries
                            </Typography>
                            <Alert severity="info">
                                <Typography paragraph>
                                    Error boundaries catch errors anywhere in their child component tree, stops the whole application from crashing
                                    and show a UI to the User to the affected area. The rest of the application should still be accessible
                                </Typography>
                                <Typography paragraph>
                                    More infos to Error Boundaries can be found here:{" "}
                                    <Link href="https://reactjs.org/docs/error-boundaries.html">https://reactjs.org/docs/error-boundaries.html</Link>
                                </Typography>
                                <Typography paragraph>Go to knobs and try to render a view with an error</Typography>
                            </Alert>
                        </CardContent>
                    </Card>
                </Box>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Error Boundaries
                        </Typography>
                        <ErrorBoundary key={`errorBoundary_${renderViewWithErrors}`}>
                            {renderViewWithErrors ? <ViewWithError /> : <ViewWithNoError />}
                        </ErrorBoundary>
                    </CardContent>
                </Card>
            </>
        );
    },

    name: "ErrorBoundary",
};
