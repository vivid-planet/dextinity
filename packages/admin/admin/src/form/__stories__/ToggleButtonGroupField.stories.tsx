import {
    FocusPointCenter,
    FocusPointEast,
    FocusPointNorth,
    FocusPointNortheast,
    FocusPointNorthwest,
    FocusPointSouth,
    FocusPointSoutheast,
    FocusPointSouthwest,
    FocusPointWest,
    Image,
    Info,
    Video,
    Vimeo,
    YouTube,
} from "@dextinity/admin-icons";
import { Box, Divider } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { Alert } from "../../alert/Alert";
import { FinalForm } from "../../FinalForm";
import { NumberField } from "../../form/fields/NumberField";
import { TextField } from "../../form/fields/TextField";
import { ToggleButtonGroupField } from "../../form/fields/ToggleButtonGroupField";

type Story = StoryObj<typeof ToggleButtonGroupField>;
const config: Meta<typeof ToggleButtonGroupField> = {
    component: ToggleButtonGroupField,
    title: "components/form/Toggle Button Group Field",
};

export default config;

/**
 * This story demonstrates the simple usage of the `ToggleButtonGroupField` component.
 */
export const ToggleButtonFieldStory: Story = {
    name: "Toggle Button Field",
    args: {
        label: "Sample Type",
        name: "type",
        disabled: false,
        options: [
            {
                label: "Label",
                value: "label",
            },
            {
                label: "Label 2",
                value: "label-2",
            },
            {
                label: <Info />,
                value: "icon",
            },
            {
                label: (
                    <Box display="flex" gap={2} alignItems="center" component="span">
                        <Info />
                        Icon and Label
                    </Box>
                ),
                value: "icon+label",
            },
        ],
    },
    render: (args) => {
        interface FormValues {
            type: string;
        }
        return (
            <FinalForm<FormValues>
                initialValues={{ type: "label" }}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <ToggleButtonGroupField {...args} />

                            <Alert title="FormState">
                                <pre>{JSON.stringify(values, null, 2)}</pre>
                            </Alert>
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * Individual options can be disabled by setting `disabled` on the option.
 *
 * Setting `disabled` on the field itself disables the whole group — an option cannot re-enable itself in that case.
 */
export const DisabledOptions: Story = {
    render: () => {
        type SampleType = "label" | "label-2" | "icon" | "icon+label";
        interface FormValues {
            type: SampleType;
        }
        return (
            <FinalForm<FormValues>
                initialValues={{ type: "label" }}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <ToggleButtonGroupField<SampleType>
                                label="Sample Type"
                                name="type"
                                options={[
                                    {
                                        label: "Label",
                                        value: "label",
                                    },
                                    {
                                        label: "Disabled",
                                        value: "label-2",
                                        disabled: true,
                                    },
                                    {
                                        label: <Info />,
                                        value: "icon",
                                        disabled: true,
                                    },
                                    {
                                        label: (
                                            <Box display="flex" gap={2} alignItems="center" component="span">
                                                <Info />
                                                Icon and Label
                                            </Box>
                                        ),
                                        value: "icon+label",
                                    },
                                ]}
                            />

                            <Alert title="FormState">
                                <pre>{JSON.stringify(values, null, 2)}</pre>
                            </Alert>
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * Sometimes it is necessary to show more options, which do not fit into one row, with the `optionsPerRow` prop it is possible to
 * define how many options should be shown in one row.
 */
export const MultipleRowsExample: Story = {
    render: () => {
        type SampleType = "north-west" | "north" | "north-east" | "west" | "center" | "east" | "south-west" | "south" | "south-east";
        interface FormValues {
            type: SampleType;
        }
        return (
            <FinalForm<FormValues>
                initialValues={{ type: "north-west" }}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <ToggleButtonGroupField<SampleType>
                                label="Sample Type"
                                name="type"
                                optionsPerRow={3}
                                options={[
                                    {
                                        label: <FocusPointNorthwest />,
                                        value: "north-west",
                                    },
                                    {
                                        label: <FocusPointNorth />,
                                        value: "north",
                                    },
                                    {
                                        label: <FocusPointNortheast />,
                                        value: "north-east",
                                    },
                                    {
                                        label: <FocusPointWest />,
                                        value: "west",
                                    },
                                    {
                                        label: <FocusPointCenter />,
                                        value: "center",
                                    },
                                    {
                                        label: <FocusPointEast />,
                                        value: "east",
                                    },
                                    {
                                        label: <FocusPointSouthwest />,
                                        value: "south-west",
                                    },
                                    {
                                        label: <FocusPointSouth />,
                                        value: "south",
                                    },
                                    {
                                        label: <FocusPointSoutheast />,
                                        value: "south-east",
                                    },
                                ]}
                            />

                            <Alert title="FormState">
                                <pre>{JSON.stringify(values, null, 2)}</pre>
                            </Alert>
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

/**
 * This story demonstrates the usage of the `ToggleButtonGroupField` component with a more complex form.
 *
 * The `ToggleButtonGroupField` Component is typically used to switch between two or more options, which additionally shows/hides different parts of the form.
 *
 * In this Showcase, the AddressType's - `ToggleButtonGroupField` - toggles between Address and Coordinates and shows/hides the corresponding fields.
 */
export const ToggleButtonFieldAddressSample: Story = {
    render: () => {
        type AddressType = "address" | "coordinates";
        interface FormValues {
            type: AddressType;
            address?: {
                city: string;
                street: string;
                streetNumber: number;
                postcode: string;
            };
            coordinates: {
                longitude: number;
                latitude: number;
            };
        }
        return (
            <FinalForm<FormValues>
                initialValues={{ type: "address" }}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <Box display="flex" gap={2} flexDirection="column">
                            <ToggleButtonGroupField<AddressType>
                                label="AddressType"
                                name="type"
                                options={[
                                    {
                                        label: "Address",
                                        value: "address",
                                    },
                                    {
                                        label: "Coordinates",
                                        value: "coordinates",
                                    },
                                ]}
                            />

                            <Box marginBottom={2}>
                                <Divider />
                            </Box>
                            {values.type === "address" && (
                                <>
                                    <NumberField name="address.postcode" label="Postcode" />
                                    <TextField name="address.city" label="City" />
                                    <TextField name="address.street" label="Street" />
                                </>
                            )}

                            {values.type === "coordinates" && (
                                <>
                                    <NumberField name="coordinates.latitude" label="Latitude" decimals={14} />
                                    <NumberField name="coordinates.longitude" label="Longitude" decimals={14} />
                                </>
                            )}
                            <Alert title="FormState">
                                <pre>{JSON.stringify(values, null, 2)}</pre>
                            </Alert>
                        </Box>
                    );
                }}
            </FinalForm>
        );
    },
};

export const MediaType: Story = {
    render: () => {
        type SampleType = "image" | "video" | "vimeo" | "youtube";
        interface FormValues {
            type: SampleType;
        }

        return (
            <FinalForm<FormValues>
                initialValues={{ type: "image" }}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <ToggleButtonGroupField<SampleType>
                                label="Media Type"
                                name="type"
                                options={[
                                    {
                                        label: <Image />,
                                        value: "image",
                                    },
                                    {
                                        label: <Video />,
                                        value: "video",
                                    },
                                    {
                                        label: <Vimeo />,
                                        value: "vimeo",
                                    },
                                    {
                                        label: <YouTube />,
                                        value: "youtube",
                                    },
                                ]}
                            />

                            <Alert title="FormState">
                                <pre>{JSON.stringify(values, null, 2)}</pre>
                            </Alert>
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};

export const MediaTypeWithText: Story = {
    render: () => {
        type SampleType = "image" | "video" | "vimeo" | "youtube";
        interface FormValues {
            type: SampleType;
        }
        const ButtonContent = styled(Box)`
            display: flex;
            gap: 8px;
            align-items: center;
        `;

        return (
            <FinalForm<FormValues>
                initialValues={{ type: "image" }}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <ToggleButtonGroupField<SampleType>
                                label="Media Type"
                                name="type"
                                options={[
                                    {
                                        label: (
                                            <ButtonContent>
                                                <Image />
                                                Image
                                            </ButtonContent>
                                        ),
                                        value: "image",
                                    },
                                    {
                                        label: (
                                            <ButtonContent>
                                                <Video />
                                                Video
                                            </ButtonContent>
                                        ),
                                        value: "video",
                                    },
                                    {
                                        label: (
                                            <ButtonContent>
                                                <Vimeo />
                                                Vimeo
                                            </ButtonContent>
                                        ),
                                        value: "vimeo",
                                    },
                                    {
                                        label: (
                                            <ButtonContent>
                                                <YouTube />
                                                YouTube
                                            </ButtonContent>
                                        ),
                                        value: "youtube",
                                    },
                                ]}
                            />

                            <Alert title="FormState">
                                <pre>{JSON.stringify(values, null, 2)}</pre>
                            </Alert>
                        </>
                    );
                }}
            </FinalForm>
        );
    },
};
