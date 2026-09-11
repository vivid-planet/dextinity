import { Field, FieldContainer } from "@dextinity/admin";
import { ColorPicker, type ColorPickerColorPreviewProps, FinalFormColorPicker } from "@dextinity/admin-color-picker";
import { StateFilled, StateRing, Warning } from "@dextinity/admin-icons";
import { Grid } from "@mui/material";
import { useState } from "react";
import { Form } from "react-final-form";

export default {
    title: "Docs/Components/Color Picker",
};

export const Basic = {
    render: () => {
        const [colorOne, setColorOne] = useState<string | undefined>("#00ff00");
        const [colorTwo, setColorTwo] = useState<string | undefined>("rgba(255, 127, 80, 0.75)");
        const [colorThree, setColorThree] = useState<string | undefined>();
        const [colorFour, setColorFour] = useState<string | undefined>();
        const [colorFive, setColorFive] = useState<string | undefined>();

        return (
            <Grid container spacing={4} sx={{ pb: 2 }}>
                <Grid
                    size={{
                        md: 3,
                    }}
                >
                    <FieldContainer label="Color Picker" fullWidth>
                        <ColorPicker fullWidth value={colorOne} onChange={setColorOne} />
                    </FieldContainer>
                </Grid>
                <Grid
                    size={{
                        md: 3,
                    }}
                >
                    <FieldContainer label="With Alpha Slider" fullWidth>
                        <ColorPicker fullWidth value={colorTwo} onChange={setColorTwo} colorFormat="rgba" />
                    </FieldContainer>
                </Grid>
                <Grid
                    size={{
                        md: 3,
                    }}
                >
                    <FieldContainer label="With Color Palette" fullWidth>
                        <ColorPicker
                            fullWidth
                            value={colorThree}
                            onChange={setColorThree}
                            colorPalette={[
                                "#f94144",
                                "#f3722c",
                                "#f8961e",
                                "#f9844a",
                                "#f9c74f",
                                "#90be6d",
                                "#43aa8b",
                                "#4d908e",
                                "#577590",
                                "#277da1",
                                "red",
                                "blue",
                                "lime",
                                "#29B6F6",
                                "#14CC33",
                                "#A02710",
                                "#226600",
                                "#009FBF",
                            ]}
                        />
                    </FieldContainer>
                </Grid>
                <Grid
                    size={{
                        md: 3,
                    }}
                >
                    <FieldContainer label="Disabled" fullWidth disabled>
                        <ColorPicker fullWidth disabled value={colorFour} onChange={setColorFour} />
                    </FieldContainer>
                </Grid>
                <Grid
                    size={{
                        md: 3,
                    }}
                >
                    <FieldContainer label="Required" fullWidth required>
                        <ColorPicker fullWidth required value={colorFive} onChange={setColorFive} />
                    </FieldContainer>
                </Grid>
            </Grid>
        );
    },
};

export const FinalForm = {
    render: () => {
        return (
            <Form initialValues={{ color1: "#00ff00", color2: "rgba(255, 127, 80, 0.75)" }} onSubmit={() => {}}>
                {() => (
                    <Grid container spacing={4} sx={{ pb: 2 }}>
                        <Grid
                            size={{
                                md: 3,
                            }}
                        >
                            <Field name="color1" label="Color-Picker" fullWidth component={FinalFormColorPicker} />
                        </Grid>
                        <Grid
                            size={{
                                md: 3,
                            }}
                        >
                            <Field name="color2" label="With Alpha Slider" fullWidth component={FinalFormColorPicker} colorFormat="rgba" />
                        </Grid>
                        <Grid
                            size={{
                                md: 3,
                            }}
                        >
                            <Field
                                name="color3"
                                label="With Color Palette"
                                fullWidth
                                component={FinalFormColorPicker}
                                colorPalette={[
                                    "#f94144",
                                    "#f3722c",
                                    "#f8961e",
                                    "#f9844a",
                                    "#f9c74f",
                                    "#90be6d",
                                    "#43aa8b",
                                    "#4d908e",
                                    "#577590",
                                    "#277da1",
                                    "red",
                                    "blue",
                                    "lime",
                                    "#29B6F6",
                                    "#14CC33",
                                    "#A02710",
                                    "#226600",
                                    "#009FBF",
                                ]}
                            />
                        </Grid>
                        <Grid
                            size={{
                                md: 3,
                            }}
                        >
                            <Field name="color4" label="Disabled" fullWidth disabled component={FinalFormColorPicker} />
                        </Grid>
                        <Grid
                            size={{
                                md: 3,
                            }}
                        >
                            <Field name="color5" label="Required" fullWidth required component={FinalFormColorPicker} />
                        </Grid>
                    </Grid>
                )}
            </Form>
        );
    },
};

export const Customized = {
    render: () => {
        const [colorOne, setColorOne] = useState<string | undefined>("#00ff00");
        const [colorTwo, setColorTwo] = useState<string | undefined>();

        const CustomColorPreview = ({ color }: ColorPickerColorPreviewProps) => {
            return <StateFilled htmlColor={color} sx={{ fontSize: 24 }} />;
        };

        const CustomColorEmptyPreview = () => {
            return <StateRing color="warning" sx={{ fontSize: 24 }} />;
        };

        const CustomColorInvalidPreview = () => {
            return <Warning color="error" sx={{ fontSize: 24 }} />;
        };

        return (
            <Grid container spacing={4} sx={{ pb: 2 }}>
                <Grid
                    size={{
                        md: 6,
                    }}
                >
                    <FieldContainer label="Without Picker" fullWidth>
                        <ColorPicker
                            fullWidth
                            value={colorOne}
                            onChange={setColorOne}
                            colorPalette={[
                                "#f94144",
                                "#f3722c",
                                "#f8961e",
                                "#f9844a",
                                "#f9c74f",
                                "#90be6d",
                                "#43aa8b",
                                "#4d908e",
                                "#577590",
                                "#277da1",
                                "red",
                                "blue",
                                "lime",
                                "#29B6F6",
                                "#14CC33",
                                "#A02710",
                                "#226600",
                                "#009FBF",
                            ]}
                            hidePicker
                        />
                    </FieldContainer>
                </Grid>
                <Grid
                    size={{
                        md: 6,
                    }}
                >
                    <FieldContainer label="Custom Color Preview" fullWidth>
                        <ColorPicker
                            fullWidth
                            value={colorTwo}
                            onChange={setColorTwo}
                            components={{
                                ColorPickerColorPreview: CustomColorPreview,
                                ColorPickerInvalidPreview: CustomColorInvalidPreview,
                                ColorPickerEmptyPreview: CustomColorEmptyPreview,
                            }}
                        />
                    </FieldContainer>
                </Grid>
            </Grid>
        );
    },
};
