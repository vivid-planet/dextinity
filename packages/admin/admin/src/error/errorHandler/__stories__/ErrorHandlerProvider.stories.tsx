import { Box, Card, CardContent, Link, List, ListItem, ListItemText, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ErrorInfo, useState } from "react";

import { Alert } from "../../../alert/Alert";
import { ErrorBoundary } from "../../errorboundary/ErrorBoundary";
import { ErrorHandlerProvider } from "../ErrorHandlerProvider";

const ThrowingView = () => {
    throw new Error("Some error occurred");
    return null;
};

const HealthyView = () => {
    return <Typography>View renders without error.</Typography>;
};

type CapturedError = {
    message: string;
    componentStack: string;
};

const meta: Meta<Args> = {
    title: "components/error/ErrorHandlerProvider",
    args: {
        renderViewWithErrors: false,
    },
    argTypes: {
        renderViewWithErrors: {
            name: "Render view with errors",
            control: "boolean",
        },
    },
};

export default meta;

type Story = StoryObj<Args>;

type Args = {
    renderViewWithErrors: boolean;
};

export const _ErrorHandlerProvider: Story = {
    render: ({ renderViewWithErrors }) => {
        const [capturedErrors, setCapturedErrors] = useState<CapturedError[]>([]);

        const handleError = (error: Error, errorInfo: ErrorInfo) => {
            setCapturedErrors((prev) => [...prev, { message: error.message, componentStack: errorInfo.componentStack ?? "" }]);
        };

        return (
            <>
                <Box
                    sx={{
                        marginBottom: 4,
                    }}
                >
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h3" gutterBottom>
                                ErrorHandlerProvider
                            </Typography>
                            <Alert severity="info">
                                <Typography
                                    sx={{
                                        marginBottom: "16px",
                                    }}
                                >
                                    <code>ErrorHandlerProvider</code> exposes a single <code>onError</code> callback to every descendant{" "}
                                    <code>ErrorBoundary</code>. The boundary still renders its visible Alert UI; the callback is invoked additively
                                    from <code>componentDidCatch</code> for centralized error reporting (e.g., Sentry).
                                </Typography>
                                <Typography
                                    sx={{
                                        marginBottom: "16px",
                                    }}
                                >
                                    Toggle the knob to throw inside the boundary and watch the captured errors appear below.
                                </Typography>
                                <Typography
                                    sx={{
                                        marginBottom: "16px",
                                    }}
                                >
                                    More info on Error Boundaries:{" "}
                                    <Link href="https://reactjs.org/docs/error-boundaries.html">https://reactjs.org/docs/error-boundaries.html</Link>
                                </Typography>
                            </Alert>
                        </CardContent>
                    </Card>
                </Box>
                <Box
                    sx={{
                        marginBottom: 4,
                    }}
                >
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h5" gutterBottom>
                                Boundary
                            </Typography>
                            <ErrorHandlerProvider onError={handleError}>
                                <ErrorBoundary key={`errorBoundary_${renderViewWithErrors}`}>
                                    {renderViewWithErrors ? <ThrowingView /> : <HealthyView />}
                                </ErrorBoundary>
                            </ErrorHandlerProvider>
                        </CardContent>
                    </Card>
                </Box>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h5" gutterBottom>
                            Captured errors ({capturedErrors.length})
                        </Typography>
                        {capturedErrors.length === 0 ? (
                            <Typography color="textSecondary">No errors captured yet.</Typography>
                        ) : (
                            <List dense>
                                {capturedErrors.map((entry, index) => (
                                    <ListItem key={index} alignItems="flex-start">
                                        <ListItemText
                                            primary={entry.message}
                                            secondary={
                                                <Typography component="pre" variant="caption" sx={{ whiteSpace: "pre-wrap" }}>
                                                    {entry.componentStack}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </CardContent>
                </Card>
            </>
        );
    },

    name: "ErrorHandlerProvider",
};
