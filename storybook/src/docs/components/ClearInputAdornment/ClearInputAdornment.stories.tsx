import { ClearInputAdornment, FieldContainer } from "@dextinity/admin";
import { Cut } from "@dextinity/admin-icons";
import { Grid, InputBase } from "@mui/material";
import { useState } from "react";

export default {
    title: "Docs/Components/Clear Input Adornment",
};

export const Basic = {
    render: () => {
        const [inputText, setInputText] = useState<string>("Lorem ipsum");

        return (
            <Grid container spacing={4}>
                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                    }}
                >
                    <FieldContainer label="Using ClearInputAdornment in an input" fullWidth>
                        <InputBase
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            endAdornment={inputText ? <ClearInputAdornment position="end" onClick={() => setInputText("")} /> : undefined}
                        />
                    </FieldContainer>
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                    }}
                >
                    <FieldContainer label="Custom icon" fullWidth>
                        <InputBase
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            endAdornment={
                                inputText ? <ClearInputAdornment position="end" onClick={() => setInputText("")} icon={<Cut />} /> : undefined
                            }
                        />
                    </FieldContainer>
                </Grid>
            </Grid>
        );
    },
};
