import { SnackbarProvider, UndoSnackbar, useSnackbarApi } from "@dextinity/admin";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { type MouseEvent, useState } from "react";

const UndoSnackbarExample = () => {
    const [chosenOption, setChosenOption] = useState("one");
    const snackbarApi = useSnackbarApi();

    const handleUndo = (prevOption: string) => {
        setChosenOption(prevOption);
    };

    const handleChange = (event: MouseEvent<HTMLElement>, newOption: string) => {
        const prevOption = chosenOption;
        setChosenOption(newOption);

        snackbarApi.showSnackbar(
            <UndoSnackbar message={`Changed from ${chosenOption} to ${newOption}`} payload={prevOption} onUndoClick={handleUndo} />,
        );
    };

    return (
        <>
            <strong>Choose another option:</strong>
            <br />
            <br />
            <ToggleButtonGroup value={chosenOption} exclusive onChange={handleChange}>
                <ToggleButton value="one">One</ToggleButton>
                <ToggleButton value="two">Two</ToggleButton>
                <ToggleButton value="three">Three</ToggleButton>
            </ToggleButtonGroup>
        </>
    );
};

export default {
    title: "@dextinity/admin/snackbar",
};

export const _UndoSnackbar = () => {
    return (
        <SnackbarProvider>
            <UndoSnackbarExample />
        </SnackbarProvider>
    );
};
