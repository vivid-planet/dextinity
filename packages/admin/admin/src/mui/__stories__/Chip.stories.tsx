import { ChevronDown } from "@dextinity/admin-icons";
import { Box, Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";

export default {
    title: "components/mui/Chip",
    args: {
        color: "default",
        variant: "filled",
        size: "medium",
        disabled: false,
        clickable: false,
        icon: false,
        deletable: false,
    },
    argTypes: {
        color: {
            name: "Color",
            control: "select",
            options: ["default", "primary", "secondary", "success", "error", "warning"],
        },
        variant: {
            name: "Variant",
            control: "select",
            options: ["filled", "outlined"],
        },
        size: {
            name: "Size",
            control: "select",
            options: ["small", "medium"],
        },
        disabled: {
            name: "Disabled",
            control: "boolean",
        },
        clickable: {
            name: "Clickable",
            control: "boolean",
        },
        icon: {
            name: "Icon",
            control: "boolean",
        },
        deletable: {
            name: "Deletable",
            control: "boolean",
        },
    },
};

type Args = {
    color: "default" | "primary" | "secondary" | "success" | "error" | "warning";
    variant: "filled" | "outlined";
    size: "small" | "medium";
    disabled: boolean;
    clickable: boolean;
    icon: boolean;
    deletable: boolean;
};

export const _Chip = {
    render: ({ color, variant, size, disabled, clickable, icon, deletable }: Args) => {
        return (
            <Stack spacing={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h3" mb={10}>
                            Chips
                        </Typography>
                        <Box mb={10}>
                            <Typography variant="h4" gutterBottom>
                                Customizable Chip
                            </Typography>
                            <Typography gutterBottom variant="body2">
                                Use the story knobs to customize the props of the Chip below.
                            </Typography>
                            <Chip
                                label="Customizable Chip"
                                color={color}
                                variant={variant}
                                size={size}
                                disabled={disabled}
                                clickable={clickable}
                                icon={icon ? <ChevronDown /> : undefined}
                                onDelete={deletable ? () => console.log("Delete") : undefined}
                            />
                        </Box>
                        <Box mb={10}>
                            <Typography variant="h4" gutterBottom>
                                Medium size Chips
                            </Typography>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip clickable label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip icon={<ChevronDown />} clickable label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip variant="outlined" label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip variant="outlined" clickable label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip variant="outlined" icon={<ChevronDown />} clickable label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip variant="outlined" label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        variant="outlined"
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip color="primary" label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip clickable color="primary" label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip color="primary" icon={<ChevronDown />} clickable label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip color="primary" label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        color="primary"
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip color="success" label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip color="success" clickable label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip color="success" icon={<ChevronDown />} clickable label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip color="success" label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        color="success"
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip color="error" label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip color="error" clickable label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip color="error" icon={<ChevronDown />} clickable label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip color="error" label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        color="error"
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip color="warning" label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip color="warning" clickable label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip color="warning" icon={<ChevronDown />} clickable label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip color="warning" label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        color="warning"
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip variant="filled" color="info" label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip variant="filled" color="info" clickable label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip variant="filled" color="info" icon={<ChevronDown />} clickable label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip variant="filled" color="info" label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        variant="filled"
                                        color="info"
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                        <Typography variant="h4" gutterBottom>
                            Small size Chips
                        </Typography>
                        <Box mb={10}>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip size="small" label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" clickable label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" icon={<ChevronDown />} clickable label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        size="small"
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip size="small" variant="outlined" label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" variant="outlined" clickable label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" variant="outlined" icon={<ChevronDown />} clickable label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" variant="outlined" label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip size="small" color="primary" label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" clickable color="primary" label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" icon={<ChevronDown />} clickable color="primary" label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" color="primary" label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        size="small"
                                        color="primary"
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip size="small" color="success" label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" color="success" clickable label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" color="success" icon={<ChevronDown />} clickable label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" color="success" label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        size="small"
                                        color="success"
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip size="small" color="error" label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" color="error" clickable label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" color="error" icon={<ChevronDown />} clickable label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" color="error" label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        size="small"
                                        color="error"
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip size="small" color="warning" label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" color="warning" clickable label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" color="warning" icon={<ChevronDown />} clickable label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" color="warning" label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        size="small"
                                        color="warning"
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid container spacing={2} mb={5}>
                                <Grid>
                                    <Chip size="small" variant="filled" color="info" label="Normal" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" variant="filled" color="info" clickable label="Clickable" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" variant="filled" color="info" icon={<ChevronDown />} clickable label="With Icon" />
                                </Grid>
                                <Grid>
                                    <Chip size="small" variant="filled" color="info" label="Disabled" disabled />
                                </Grid>
                                <Grid>
                                    <Chip
                                        size="small"
                                        variant="filled"
                                        color="info"
                                        label="Deletable"
                                        onDelete={() => {
                                            console.log("Delete");
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </CardContent>
                </Card>
            </Stack>
        );
    },
};
