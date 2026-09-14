import { Button, FormSection, useStoredState } from "@dextinity/admin";
import { InputBase, Stack } from "@mui/material";

export default {
    title: "Docs/Hooks/useStoredState",
};

export const LocalStorage = {
    render: () => {
        const [storedState, setStoredState] = useStoredState<number>("stored_state_stories_key", 0);
        return (
            <FormSection title={`Stored State: ${storedState}`} disableMarginBottom>
                <Stack direction="row" spacing={2}>
                    <Button
                        onClick={() => {
                            setStoredState(storedState + 1);
                        }}
                    >
                        Increment Stored State
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => {
                            setStoredState(0);
                        }}
                    >
                        Reset
                    </Button>
                </Stack>
            </FormSection>
        );
    },

    name: "LocalStorage",
};

export const SessionStorage = {
    render: () => {
        const [storedState, setStoredState] = useStoredState<string>("stored_state_stories_session_storage_key", "Dextinity", window.sessionStorage);
        return (
            <FormSection title={`Stored State: ${storedState}`} disableMarginBottom>
                <InputBase
                    value={storedState}
                    onChange={(event) => {
                        setStoredState(event.target.value);
                    }}
                />
            </FormSection>
        );
    },

    name: "SessionStorage",
};
