import { Search } from "@dextinity/admin-icons";
import { Card, CardContent, Checkbox, FormControlLabel, Grid, InputAdornment, InputBase, Typography } from "@mui/material";
import { type ChangeEvent, useState } from "react";

import { FieldContainer } from "../../form/FieldContainer";

export default {
    title: "components/form",
};

export const SingleTextField = {
    render: () => {
        const [searchString1, setSearchString1] = useState<string>("");
        const [searchString2, setSearchString2] = useState<string>("");
        const [checkboxValue, setCheckboxValue] = useState<boolean>(false);

        return (
            <div style={{ width: 400 }}>
                <Grid container spacing={4}>
                    <Grid size={12}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h4" gutterBottom>
                                    Single TextField outside of form
                                </Typography>
                                <FieldContainer fullWidth>
                                    <InputBase
                                        autoFocus
                                        placeholder="Search..."
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        }
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchString1(e.target.value)}
                                        value={searchString1}
                                    />
                                </FieldContainer>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={12}>
                        <Card variant="outlined">
                            <CardContent>
                                <Typography variant="h4" gutterBottom>
                                    With Checkbox
                                </Typography>
                                <FieldContainer fullWidth>
                                    <InputBase
                                        placeholder="Search..."
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <Search />
                                            </InputAdornment>
                                        }
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchString2(e.target.value)}
                                        value={searchString2}
                                    />
                                </FieldContainer>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={checkboxValue}
                                            onChange={(e: ChangeEvent<HTMLInputElement>) => setCheckboxValue(e.target.checked)}
                                        />
                                    }
                                    label="Additional Setting"
                                />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
                <div>
                    <pre>{JSON.stringify({ searchString1, searchString2, checkboxValue }, undefined, 2)}</pre>
                </div>
            </div>
        );
    },

    name: "Single TextField",
};
