import type { SnackbarCloseReason, SnackbarProps } from "@mui/material";
import { cloneElement, createContext, type ReactElement, type ReactNode, type SyntheticEvent, useContext, useState } from "react";
import { v4 as uuid } from "uuid";

import type { UndoSnackbarProps } from "./UndoSnackbar";

export interface SnackbarApi {
    showSnackbar: (newSnackbar: ReactElement<Omit<SnackbarProps | UndoSnackbarProps<unknown>, "open">>) => void;
    hideSnackbar: () => void;
}

const SnackbarContext = createContext<SnackbarApi | null>(null);

export const useSnackbarApi = () => {
    const context = useContext(SnackbarContext);

    if (context === null) {
        throw new Error("No snackbar context found. Please ensure that you have called `SnackbarProvider` higher up in your tree.");
    }

    return context;
};

type SnackbarCloseEvent = SyntheticEvent<any> | Event;
type HandleClose = (event: SnackbarCloseEvent, reason: SnackbarCloseReason, onClose?: SnackbarProps["onClose"]) => void;

export const SnackbarProvider = ({ children }: { children?: ReactNode }) => {
    const [open, setOpen] = useState<boolean>(false);
    const [snackbar, setSnackbar] = useState<ReactElement<Omit<SnackbarProps | UndoSnackbarProps<unknown>, "open">>>();
    const [key, setKey] = useState(uuid());

    const updateSnackbar = (newSnackbar: ReactElement<Omit<SnackbarProps | UndoSnackbarProps<unknown>, "open">>) => {
        setKey(uuid());
        setSnackbar(newSnackbar);
        if (newSnackbar !== undefined) {
            setOpen(true);
        }
    };

    const hideSnackbar = () => {
        setOpen(false);
        // setTimeout is needed, otherwise the onClose event is not triggered
        setTimeout(() => {
            setSnackbar(undefined);
        }, 0);
    };

    const handleClose: HandleClose = (event, reason, onClose) => {
        if (reason === "timeout") {
            hideSnackbar();
        }

        onClose?.(event, reason);
    };

    return (
        <SnackbarContext.Provider
            value={{
                showSnackbar: updateSnackbar,
                hideSnackbar: hideSnackbar,
            }}
        >
            {children}
            {snackbar !== undefined &&
                cloneElement<SnackbarProps>(snackbar, {
                    key,
                    open: open,
                    onClose: (event, reason) => handleClose(event, reason, snackbar?.props.onClose),
                })}
        </SnackbarContext.Provider>
    );
};
