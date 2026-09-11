import { Alert, Button } from "@dextinity/admin";
import { Snackbar } from "@mui/material";
import { useState } from "react";

export default {
    title: "@dextinity/admin/alert/Alert",
};

export const AlertInSnackbar = {
    render: () => {
        const [showSnackbar, setShowSnackbar] = useState(false);
        return (
            <>
                <Button
                    onClick={() => {
                        setShowSnackbar(true);
                    }}
                    variant="textDark"
                >
                    Show snackbar
                </Button>
                <Snackbar open={showSnackbar} onClose={() => setShowSnackbar(false)} autoHideDuration={2000}>
                    <Alert severity="success" onClose={() => setShowSnackbar(false)}>
                        Notification Text
                    </Alert>
                </Snackbar>
            </>
        );
    },

    name: "Alert in Snackbar",
};
