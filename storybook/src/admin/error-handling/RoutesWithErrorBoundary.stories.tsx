import { Alert, ErrorBoundary, MainNavigation, MainNavigationItemRouterLink, MasterLayout } from "@dextinity/admin";
import { Card, CardContent, Typography } from "@mui/material";
import { Navigate, Route, Routes } from "react-router";

import { storyRouterDecorator } from "../../story-router.decorator";

const ViewWithNoError = () => {
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    View with No Error
                </Typography>
                <Alert severity="info">
                    <Typography>Wrap the element of a route in an ErrorBoundary to create a boundary for app routes.</Typography>
                    <Typography>Try to click on the second route (Error Route) to display a route which throws an error.</Typography>
                </Alert>
            </CardContent>
        </Card>
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

function MasterMenu() {
    return (
        <MainNavigation>
            <MainNavigationItemRouterLink primary="No Error Route" to="/no-error-route" />
            <MainNavigationItemRouterLink primary="Error Route" to="/error-route" />
        </MainNavigation>
    );
}

export default {
    title: "@dextinity/admin/error-handling/error-boundaries",
    decorators: [storyRouterDecorator()],
};

export const RoutesWithErrorBoundary = {
    render: () => {
        return (
            <MasterLayout menuComponent={MasterMenu}>
                <Routes>
                    <Route
                        path="/no-error-route"
                        element={
                            <ErrorBoundary key="no-error-route">
                                <ViewWithNoError />
                            </ErrorBoundary>
                        }
                    />
                    <Route
                        path="/error-route"
                        element={
                            <ErrorBoundary key="error-route">
                                <ViewWithError />
                            </ErrorBoundary>
                        }
                    />
                    <Route path="/" element={<Navigate to="/no-error-route" replace />} />
                </Routes>
            </MasterLayout>
        );
    },

    name: "Routes with ErrorBoundary",
};
