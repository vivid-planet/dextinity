import { Button } from "@dextinity/admin";
import { ArrowRight } from "@dextinity/admin-icons";
import { Box, Chip, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { componentDocsDecorator } from "./utils/componentDocsDecorator";
import { DocsPage } from "./utils/DocsPage";

type Story = StoryObj<typeof Button>;

const meta: Meta<typeof Button> = {
    component: Button,
    title: "Component Docs/Button",
    tags: ["adminComponentDocs"],
    decorators: [componentDocsDecorator()],
    parameters: {
        docs: {
            page: () => <DocsPage defaultStory={Default} />,
        },
    },
    argTypes: {
        children: {
            control: "text",
        },
        variant: {
            control: "select",
            options: [undefined, "primary", "secondary", "outlined", "destructive", "success", "textLight", "textDark"],
        },
        disabled: {
            control: "boolean",
        },
        startIcon: {
            control: "select",
            options: [undefined, "ArrowRight"],
        },
        endIcon: {
            control: "select",
            options: [undefined, "ArrowRight"],
        },
        responsive: {
            control: "boolean",
        },
        mobileIcon: {
            control: "select",
            options: [undefined, "ArrowRight"],
        },
        mobileBreakpoint: {
            control: "select",
            options: ["xs", "sm", "md", "lg", "xl"],
        },
    },
    args: {
        children: "Button",
    },
};

export default meta;

export const Default: Story = {
    render: ({ startIcon, endIcon, variant, mobileIcon, ...props }) => {
        const buttonNode = (
            <Button
                {...props}
                variant={variant}
                startIcon={startIcon === "ArrowRight" ? <ArrowRight /> : undefined}
                endIcon={endIcon === "ArrowRight" ? <ArrowRight /> : undefined}
                mobileIcon={mobileIcon === "ArrowRight" ? <ArrowRight /> : undefined}
            />
        );

        if (variant === "textLight") {
            return <Box sx={{ backgroundColor: "grey.800", padding: 4 }}>{buttonNode}</Box>;
        }

        return buttonNode;
    },
};

const ListOfButtons = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    columnGap: theme.spacing(4),
    rowGap: theme.spacing(2),
    flexWrap: "wrap",
}));

const DarkListOfButtons = styled(ListOfButtons)(({ theme }) => ({
    backgroundColor: theme.palette.grey[800],
    margin: theme.spacing(-4),
    padding: theme.spacing(4),
}));

export const AllVariants: Story = {
    render: (props) => {
        return (
            <Stack spacing={10}>
                <ListOfButtons>
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
                </ListOfButtons>
                <ListOfButtons>
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
                </ListOfButtons>
                <ListOfButtons>
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
                </ListOfButtons>
                <ListOfButtons>
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
                </ListOfButtons>
                <ListOfButtons>
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
                </ListOfButtons>
                <Box>
                    <DarkListOfButtons>
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
                    </DarkListOfButtons>
                </Box>
                <ListOfButtons>
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
                </ListOfButtons>
            </Stack>
        );
    },
};

/**
 * When using the button in a place where the width can be constrained, such as in a toolbar on a mobile device, you can set the `responsive`.
 *
 * This causes the text-content to be hidden on smaller devices and be moved to a tooltip instead.
 * The button will only show an icon then by default.
 * This requires either a `startIcon` or `endIcon` to be set, or the `mobileIcon` which is used specifically for this purpose.
 * The breakpoint at which the button will be responsive can be set using the `mobileBreakpoint` prop.
 */
export const ResponsiveBehavior: Story = {
    render: (props) => {
        return (
            <Button startIcon={<ArrowRight />} responsive {...props}>
                Responsive Button
            </Button>
        );
    },
};
