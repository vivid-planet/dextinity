import { Alert } from "@dextinity/admin";
import { Snackbar, type SnackbarProps } from "@mui/material";
import { FormattedMessage } from "react-intl";

export const FailedToPasteSnackbar = (props: Partial<SnackbarProps>) => {
    return (
        <Snackbar autoHideDuration={5000} {...props}>
            <Alert severity="error">
                <FormattedMessage id="dextinity.tableBlock.couldNotPasteClipboardData" defaultMessage="Could not paste the clipboard data" />
            </Alert>
        </Snackbar>
    );
};
