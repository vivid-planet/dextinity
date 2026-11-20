import { Card, CardContent, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Navigate, Route, Routes } from "react-router";

import { Alert } from "../../../alert/Alert";
import { MainNavigationItemRouterLink } from "../../../mui/mainNavigation/ItemRouterLink";
import { MainNavigation } from "../../../mui/mainNavigation/MainNavigation";
import { MasterLayout } from "../../../mui/MasterLayout";
import { RouteWithErrorBoundary } from "../RouteWithErrorBoundary";

const ViewWithNoError = () => {
    return (
        <Card variant="outlined">
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    View with No Error
                </Typography>
                <Alert severity="info">
                    <Typography>Use the RouteWithErrorBoundary component to create a boundary for app routes.</Typography>
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

const meta: Meta = {
    title: "components/error/RouteWithErrorBoundary",
};

export default meta;

type Story = StoryObj;

export const _RouteWithErrorBoundary: Story = {
    render: () => {
        return (
            <MasterLayout menuComponent={MasterMenu}>
                <Routes>
                    <Route
                        path="/no-error-route/*"
                        element={
                            <RouteWithErrorBoundary>
                                <ViewWithNoError />
                            </RouteWithErrorBoundary>
                        }
                    />
                    <Route
                        path="/error-route/*"
                        element={
                            <RouteWithErrorBoundary>
                                <ViewWithError />
                            </RouteWithErrorBoundary>
                        }
                    />
                    <Route index element={<Navigate to="/no-error-route" replace />} />
                </Routes>
            </MasterLayout>
        );
    },

    name: "RouteWithErrorBoundary",
};
