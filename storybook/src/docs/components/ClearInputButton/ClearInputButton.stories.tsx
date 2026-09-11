import { ClearInputButton } from "@dextinity/admin";
import { Cut } from "@dextinity/admin-icons";
import { Box, InputAdornment, InputBase, Typography } from "@mui/material";
import { useState } from "react";

export default {
    title: "Docs/Components/ClearInputButton",
};

export const Default = {
    render: () => {
        return (
            <Box display="flex" alignItems="center">
                <Box marginRight={15}>
                    <Typography variant="body1">Input Field with Default ClearInputButton:</Typography>
                </Box>
                <InputBase
                    endAdornment={
                        <InputAdornment position="end">
                            <ClearInputButton />
                        </InputAdornment>
                    }
                />
            </Box>
        );
    },
};

export const ClearableInputField = {
    render: () => {
        const [inputText, setInputText] = useState<string>("");

        return (
            <Box display="flex" alignItems="center">
                <Box marginRight={15}>
                    <Typography variant="body1">Input Field with clearable onClick Button Functionality:</Typography>
                </Box>
                <InputBase
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    endAdornment={
                        <InputAdornment position="end">
                            <ClearInputButton onClick={() => setInputText("")} />
                        </InputAdornment>
                    }
                />
            </Box>
        );
    },
};

export const Disabled = {
    render: () => {
        return (
            <Box display="flex" alignItems="center">
                <Box marginRight={15}>
                    <Typography variant="body1">Input Field with disabled ClearInputButton:</Typography>
                </Box>
                <InputBase
                    endAdornment={
                        <InputAdornment position="end">
                            <ClearInputButton disabled={true} />
                        </InputAdornment>
                    }
                />
            </Box>
        );
    },
};

export const CustomClearIcon = {
    render: () => {
        return (
            <Box display="flex" alignItems="center">
                <Box marginRight={15}>
                    <Typography variant="body1">Input Field with Custom ClearInputButton Icon:</Typography>
                </Box>
                <InputBase
                    endAdornment={
                        <InputAdornment position="end">
                            <ClearInputButton icon={<Cut />} />
                        </InputAdornment>
                    }
                />
            </Box>
        );
    },
};
