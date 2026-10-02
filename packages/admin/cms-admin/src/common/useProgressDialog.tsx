import { Button, messages } from "@dextinity/admin";
import {
    Box,
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    LinearProgress,
    type LinearProgressProps,
    Typography,
} from "@mui/material";
import { type ReactNode, useCallback, useState } from "react";
import { FormattedMessage } from "react-intl";

function LinearProgressWithLabel({ message, ...props }: LinearProgressProps & { value: number; message?: ReactNode }) {
    return (
        <Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box sx={{ width: "100%", mr: 1 }}>
                    <LinearProgress variant="determinate" {...props} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">{`${Math.round(props.value)}%`}</Typography>
                </Box>
            </Box>
            {message && (
                <Typography variant="body2" color="text.secondary">
                    {message}
                </Typography>
            )}
        </Box>
    );
}

function ProgressDialog(props: { title: ReactNode; progress: number | undefined; message?: ReactNode; onCancel?: () => void }) {
    return (
        <>
            {props.progress !== undefined && (
                <Dialog open={true}>
                    <DialogTitle>{props.title}</DialogTitle>
                    <DialogContent>
                        <LinearProgressWithLabel value={props.progress} message={props.message} />
                    </DialogContent>
                    {props.onCancel && (
                        <DialogActions>
                            <Button onClick={props.onCancel} variant="textDark">
                                <FormattedMessage {...messages.cancel} />
                            </Button>
                        </DialogActions>
                    )}
                </Dialog>
            )}
        </>
    );
}

export function useProgressDialog(options: { title: ReactNode; onCancel?: () => void }) {
    const [progress, setProgress] = useState<{
        progress: number | undefined;
        message?: ReactNode;
    }>({
        progress: undefined,
        message: undefined,
    });

    const updateProgress = useCallback((progress: number | undefined, message?: ReactNode) => {
        setProgress({ progress, message });
    }, []);

    return {
        progress: progress.progress,
        message: progress.message,
        updateProgress,
        dialog: <ProgressDialog title={options.title} onCancel={options.onCancel} progress={progress.progress} message={progress.message} />,
    };
}
