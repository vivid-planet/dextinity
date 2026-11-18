import { List, ListItem, Snackbar } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "../../common/buttons/Button";
import { SnackbarProvider, useSnackbarApi } from "../SnackbarProvider";

let counter = 0;

const CustomSnackbar = () => {
    const snackbarApi = useSnackbarApi();

    const handleActionButtonClick = () => {
        window.alert("Action button clicked");
        snackbarApi.hideSnackbar();
    };

    const showCustomSnackbar = () => {
        snackbarApi.showSnackbar(
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                // If no distinct key is set, the Snackbar may update in-place
                // meaning that the autoHideDuration is not reset (https://mui.com/api/snackbar/)
                // Use uuid or object id in production
                key={counter++}
                autoHideDuration={5000}
                message="This is a completely customizable snackbar"
                action={
                    <Button variant="textLight" onClick={handleActionButtonClick}>
                        Custom Button
                    </Button>
                }
            />,
        );
    };

    return (
        <List>
            <ListItem>
                <Button onClick={showCustomSnackbar}>Show Snackbar</Button>
            </ListItem>
            <ListItem>
                <Button variant="secondary" onClick={snackbarApi.hideSnackbar}>
                    Hide Snackbar
                </Button>
            </ListItem>
        </List>
    );
};

const meta: Meta = {
    title: "components/snackbar/CustomSnackbar",
};

export default meta;

type Story = StoryObj;

export const _CustomSnackbar: Story = {
    render: () => {
        return (
            <SnackbarProvider>
                <CustomSnackbar />
            </SnackbarProvider>
        );
    },
};
