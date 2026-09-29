import { Add, ArrowRight, Favorite, Wrench } from "@dextinity/admin-icons";
import { Box, Chip, Stack } from "@mui/material";
import type { Meta } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { Button, type ButtonProps } from "../Button";

const config: Meta<typeof Button> = {
    component: Button,
    title: "components/common/buttons/Button",
};

export default config;

type DefaultStoryArgs = {
    variant: ButtonProps["variant"];
    responsive: boolean;
    disabled: boolean;
    startIcon: boolean;
    endIcon: boolean;
};

export const Default = {
    parameters: {
        layout: "fullscreen",
    },
    args: {
        variant: "primary",
        responsive: false,
        disabled: false,
        startIcon: true,
        endIcon: false,
    },
    argTypes: {
        variant: {
            name: "Variant",
            control: "select",
            options: ["primary", "secondary", "outlined", "destructive", "success", "textLight", "textDark"],
        },
        responsive: {
            name: "Responsive",
            control: "boolean",
        },
        disabled: {
            name: "Disabled",
            control: "boolean",
        },
        startIcon: {
            name: "Start Icon",
            control: "boolean",
        },
        endIcon: {
            name: "End Icon",
            control: "boolean",
        },
    },

    render: ({ startIcon, endIcon, disabled, variant, responsive }: DefaultStoryArgs) => {
        const showDarkBackground = variant === "textLight";

        return (
            <Box py={10} px={8} bgcolor={showDarkBackground ? "#333" : "transparent"}>
                <Button
                    onClick={() => {
                        alert("Button clicked");
                    }}
                    startIcon={startIcon ? <Wrench /> : undefined}
                    endIcon={endIcon ? <Favorite /> : undefined}
                    disabled={disabled}
                    variant={variant}
                    responsive={responsive}
                >
                    This is a button
                </Button>
            </Box>
        );
    },
};

export const AllVariants = {
    render: () => {
        return (
            <Stack spacing={10}>
                <Stack direction="row" alignItems="center" spacing={8}>
                    <Button>Button</Button>
                    <Button startIcon={<ArrowRight />}>Button</Button>
                    <Button endIcon={<ArrowRight />}>Button</Button>
                    <Button endIcon={<Chip label="5" />}>Button</Button>
                    <Button startIcon={<ArrowRight />} endIcon={<Chip label="5" />}>
                        Button
                    </Button>
                    <Button
                        endIcon={
                            <>
                                <ArrowRight />
                                <Chip label="5" />
                            </>
                        }
                    >
                        Button
                    </Button>
                    <Button>
                        <ArrowRight />
                    </Button>
                    <Button endIcon={<ArrowRight />} disabled>
                        Button
                    </Button>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={8}>
                    <Button variant="secondary">Button</Button>
                    <Button variant="secondary" startIcon={<ArrowRight />}>
                        Button
                    </Button>
                    <Button variant="secondary" endIcon={<ArrowRight />}>
                        Button
                    </Button>
                    <Button variant="secondary" endIcon={<Chip label="5" />}>
                        Button
                    </Button>
                    <Button variant="secondary" startIcon={<ArrowRight />} endIcon={<Chip label="5" />}>
                        Button
                    </Button>
                    <Button
                        variant="secondary"
                        endIcon={
                            <>
                                <ArrowRight />
                                <Chip label="5" />
                            </>
                        }
                    >
                        Button
                    </Button>
                    <Button variant="secondary">
                        <ArrowRight />
                    </Button>
                    <Button variant="secondary" endIcon={<ArrowRight />} disabled>
                        Button
                    </Button>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={8}>
                    <Button variant="outlined">Button</Button>
                    <Button variant="outlined" startIcon={<ArrowRight />}>
                        Button
                    </Button>
                    <Button variant="outlined" endIcon={<ArrowRight />}>
                        Button
                    </Button>
                    <Button variant="outlined" endIcon={<Chip label="5" />}>
                        Button
                    </Button>
                    <Button variant="outlined" startIcon={<ArrowRight />} endIcon={<Chip label="5" />}>
                        Button
                    </Button>
                    <Button
                        variant="outlined"
                        endIcon={
                            <>
                                <ArrowRight />
                                <Chip label="5" />
                            </>
                        }
                    >
                        Button
                    </Button>
                    <Button variant="outlined">
                        <ArrowRight />
                    </Button>
                    <Button variant="outlined" endIcon={<ArrowRight />} disabled>
                        Button
                    </Button>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={8}>
                    <Button variant="destructive">Button</Button>
                    <Button variant="destructive" startIcon={<ArrowRight />}>
                        Button
                    </Button>
                    <Button variant="destructive" endIcon={<ArrowRight />}>
                        Button
                    </Button>
                    <Button variant="destructive" endIcon={<Chip label="5" />}>
                        Button
                    </Button>
                    <Button variant="destructive" startIcon={<ArrowRight />} endIcon={<Chip label="5" />}>
                        Button
                    </Button>
                    <Button
                        variant="destructive"
                        endIcon={
                            <>
                                <ArrowRight />
                                <Chip label="5" />
                            </>
                        }
                    >
                        Button
                    </Button>
                    <Button variant="destructive">
                        <ArrowRight />
                    </Button>
                    <Button variant="destructive" endIcon={<ArrowRight />} disabled>
                        Button
                    </Button>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={8}>
                    <Button variant="success">Button</Button>
                    <Button variant="success" startIcon={<ArrowRight />}>
                        Button
                    </Button>
                    <Button variant="success" endIcon={<ArrowRight />}>
                        Button
                    </Button>
                    <Button variant="success" endIcon={<Chip label="5" />}>
                        Button
                    </Button>
                    <Button variant="success" startIcon={<ArrowRight />} endIcon={<Chip label="5" />}>
                        Button
                    </Button>
                    <Button
                        variant="success"
                        endIcon={
                            <>
                                <ArrowRight />
                                <Chip label="5" />
                            </>
                        }
                    >
                        Button
                    </Button>
                    <Button variant="success">
                        <ArrowRight />
                    </Button>
                    <Button variant="success" endIcon={<ArrowRight />} disabled>
                        Button
                    </Button>
                </Stack>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={8}
                    paddingTop={8}
                    paddingBottom={8}
                    sx={{ backgroundColor: (theme) => theme.palette.grey[800] }}
                >
                    <Button variant="textLight">Button</Button>
                    <Button variant="textLight" startIcon={<ArrowRight />}>
                        Button
                    </Button>
                    <Button variant="textLight" endIcon={<ArrowRight />}>
                        Button
                    </Button>
                    <Button variant="textLight" endIcon={<Chip label="5" />}>
                        Button
                    </Button>
                    <Button variant="textLight" startIcon={<ArrowRight />} endIcon={<Chip label="5" />}>
                        Button
                    </Button>
                    <Button
                        variant="textLight"
                        endIcon={
                            <>
                                <ArrowRight />
                                <Chip label="5" />
                            </>
                        }
                    >
                        Button
                    </Button>
                    <Button variant="textLight">
                        <ArrowRight />
                    </Button>
                    <Button variant="textLight" endIcon={<ArrowRight />} disabled>
                        Button
                    </Button>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={8}>
                    <Button variant="textDark">Button</Button>
                    <Button variant="textDark" startIcon={<ArrowRight />}>
                        Button
                    </Button>
                    <Button variant="textDark" endIcon={<ArrowRight />}>
                        Button
                    </Button>
                    <Button variant="textDark" endIcon={<Chip label="5" />}>
                        Button
                    </Button>
                    <Button variant="textDark" startIcon={<ArrowRight />} endIcon={<Chip label="5" />}>
                        Button
                    </Button>
                    <Button
                        variant="textDark"
                        endIcon={
                            <>
                                <ArrowRight />
                                <Chip label="5" />
                            </>
                        }
                    >
                        Button
                    </Button>
                    <Button variant="textDark">
                        <ArrowRight />
                    </Button>
                    <Button variant="textDark" endIcon={<ArrowRight />} disabled>
                        Button
                    </Button>
                </Stack>
            </Stack>
        );
    },
};

type ResponsiveArgs = {
    startIcon: boolean;
    endIcon: boolean;
    mobileIcon: "auto" | "startIcon" | "endIcon" | ReactNode;
    mobileBreakpoint: "xs" | "sm" | "md" | "lg" | "xl";
    disabled: boolean;
};

export const Responsive = {
    args: {
        startIcon: true,
        endIcon: false,
        mobileIcon: "auto",
        mobileBreakpoint: "sm",
        disabled: false,
    },
    argTypes: {
        startIcon: {
            name: "Start Icon",
            control: "boolean",
        },
        endIcon: {
            name: "End Icon",
            control: "boolean",
        },
        mobileIcon: {
            name: "Mobile Icon",
            control: "select",
            options: ["auto", "startIcon", "endIcon", "custom"],
        },
        mobileBreakpoint: {
            name: "Mobile Breakpoint",
            control: "select",
            options: ["xs", "sm", "md", "lg", "xl"],
        },
        disabled: {
            name: "Disabled",
            control: "boolean",
        },
    },
    render: ({ startIcon, endIcon, mobileIcon, mobileBreakpoint, disabled }: ResponsiveArgs) => {
        const customMobileIcon = <Favorite />;

        return (
            <Stack direction="row" alignItems="center" spacing={2}>
                <Button
                    responsive
                    startIcon={startIcon ? <Wrench /> : undefined}
                    endIcon={endIcon ? <Add /> : undefined}
                    mobileIcon={mobileIcon === "custom" ? customMobileIcon : mobileIcon}
                    mobileBreakpoint={mobileBreakpoint}
                    disabled={disabled}
                >
                    This is a responsive button
                </Button>
            </Stack>
        );
    },
};
