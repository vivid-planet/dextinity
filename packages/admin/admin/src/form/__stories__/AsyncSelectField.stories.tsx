import { gql, useApolloClient } from "@apollo/client";
import { Info, WarningSolid } from "@dextinity/admin-icons";
import type { Meta, StoryObj } from "@storybook/react-vite";

import type { Manufacturer } from "../../../.storybook/mocks/handlers";
import { Alert } from "../../alert/Alert";
import { FinalForm } from "../../FinalForm";
import { AsyncSelectField } from "../../form/fields/AsyncSelectField";

type Story = StoryObj<typeof AsyncSelectField>;
const config: Meta<typeof AsyncSelectField> = {
    component: AsyncSelectField,
    title: "components/form/AsyncSelectField",
};
export default config;

/**
 * This story demonstrates the usage of the AsyncSelectField component.
 *
 * Options are fake loaded with a delay and returned as an array of strings.
 */
export const SimpleList: Story = {
    render: () => {
        interface FormValues {
            type: string;
        }
        return (
            <FinalForm<FormValues>
                initialValues={{ type: "value-1" }}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <AsyncSelectField
                                loadOptions={async () => {
                                    // simulate loading
                                    await new Promise((resolve) => setTimeout(resolve, 200));
                                    return ["value-1", "value-2", "value-3", "value-4"];
                                }}
                                getOptionLabel={(option) => {
                                    return option;
                                }}
                                name="type"
                                label="AsyncSelectField"
                                fullWidth
                                variant="horizontal"
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
 * This story demonstrates the usage of the AsyncSelectField component where the options are loaded as objects.
 *
 * The options are loaded as objects, the visual representation must be extracted inside the getOptionLabel function.
 */
export const WithObjectOptions: Story = {
    render: () => {
        interface FormValues {
            type: {
                id: string;
                name: string;
            };
        }
        return (
            <FinalForm<FormValues>
                initialValues={{
                    type: {
                        id: "1",
                        name: "Name 1",
                    },
                }}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <AsyncSelectField
                                loadOptions={async () => {
                                    // simulate loading
                                    await new Promise((resolve) => setTimeout(resolve, 200));

                                    return [
                                        {
                                            id: "1",
                                            name: "Name 1",
                                        },
                                        {
                                            id: "2",
                                            name: "Name 2",
                                        },
                                        {
                                            id: "3",
                                            name: "Name 3",
                                        },
                                        {
                                            id: "4",
                                            name: "Name 4",
                                        },
                                        {
                                            id: "5",
                                            name: "Name 5",
                                        },
                                    ];
                                }}
                                getOptionLabel={(option) => {
                                    return option.name;
                                }}
                                name="type"
                                label="AsyncSelectField"
                                fullWidth
                                variant="horizontal"
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
 * This story demonstrates the usage of the AsyncSelectField where the loading time got extended to visualize the loading state.
 */
export const LongLoading: Story = {
    render: () => {
        interface FormValues {
            type: string;
        }
        return (
            <FinalForm<FormValues>
                initialValues={{ type: "value-1" }}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <AsyncSelectField
                                loadOptions={async () => {
                                    // simulate loading
                                    await new Promise((resolve) => setTimeout(resolve, 4000));
                                    return ["value-1", "value-2", "value-3", "value-4"];
                                }}
                                getOptionLabel={(option) => {
                                    return option;
                                }}
                                name="type"
                                label="AsyncSelectField"
                                fullWidth
                                variant="horizontal"
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
 * This story demonstrates the usage of the AsyncSelectField component where no options are returned.
 */
export const NoOptions: Story = {
    render: () => {
        interface FormValues {
            type: string;
        }
        return (
            <FinalForm<FormValues>
                initialValues={{}}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <AsyncSelectField
                                loadOptions={async () => {
                                    // simulate loading
                                    await new Promise((resolve) => setTimeout(resolve, 200));
                                    return [];
                                }}
                                getOptionLabel={(option) => {
                                    return option;
                                }}
                                name="type"
                                label="AsyncSelectField"
                                fullWidth
                                variant="horizontal"
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
 * If no options are available, the noOptionsText function can be used to customize the label.
 */
export const NoOptionsWithCustomNoOptionsText: Story = {
    render: () => {
        interface FormValues {
            type: string;
        }
        return (
            <FinalForm<FormValues>
                initialValues={{}}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <AsyncSelectField
                                loadOptions={async () => {
                                    // simulate loading
                                    await new Promise((resolve) => setTimeout(resolve, 200));

                                    return [];
                                }}
                                getOptionLabel={(option) => {
                                    return option;
                                }}
                                noOptionsText={
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <Info color="info" />
                                        No options available at this point in time
                                    </div>
                                }
                                name="type"
                                label="AsyncSelectField"
                                fullWidth
                                variant="horizontal"
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
 * This story demonstrates the usage of the AsyncSelectField component where an error occurs while loading the options.
 */
export const ErrorLoadingOptions: Story = {
    render: () => {
        interface FormValues {
            type: string;
        }
        return (
            <FinalForm<FormValues>
                initialValues={{}}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <AsyncSelectField
                                loadOptions={async () => {
                                    // simulate loading
                                    await new Promise((resolve) => setTimeout(resolve, 500));
                                    throw Error("Error loading options");
                                    return [];
                                }}
                                getOptionLabel={(option) => {
                                    return option;
                                }}
                                name="type"
                                label="AsyncSelectField"
                                fullWidth
                                variant="horizontal"
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

export const ErrorLoadingOptionsWithCustomErrorText: Story = {
    render: () => {
        interface FormValues {
            type: string;
        }
        return (
            <FinalForm<FormValues>
                initialValues={{}}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <AsyncSelectField
                                loadOptions={async () => {
                                    // simulate loading
                                    await new Promise((resolve) => setTimeout(resolve, 500));
                                    throw Error("Error loading options");
                                    return [];
                                }}
                                getOptionLabel={(option) => {
                                    return option;
                                }}
                                errorText={
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                        <WarningSolid color="error" />
                                        Error loading options
                                    </div>
                                }
                                name="type"
                                label="AsyncSelectField"
                                fullWidth
                                variant="horizontal"
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
 * This story demonstrates the usage of the AsyncSelectField component where the options are loaded from an API
 *
 * This can be used when ALL options can be loaded at once.
 */
export const AsyncLoadingDataFromApi: Story = {
    render: () => {
        const client = useApolloClient();

        interface FormValues {
            type: {
                id: string;
                name: string;
            };
        }
        return (
            <FinalForm<FormValues>
                initialValues={{}}
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <AsyncSelectField
                                loadOptions={async () => {
                                    const { data } = await client.query<{ manufacturers: Manufacturer[] }>({
                                        query: gql`
                                            query Manufacturers {
                                                manufacturers {
                                                    id
                                                    name
                                                }
                                            }
                                        `,
                                    });

                                    return data.manufacturers;
                                }}
                                getOptionLabel={(option) => {
                                    return option.name;
                                }}
                                name="type"
                                label="AsyncSelectField"
                                fullWidth
                                variant="horizontal"
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

export const MultipleWithoutInitialValues: Story = {
    render: () => {
        interface FormValues {
            type: string;
        }
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
            >
                {({ values }) => {
                    return (
                        <>
                            <AsyncSelectField
                                multiple
                                loadOptions={async () => {
                                    // simulate loading
                                    await new Promise((resolve) => setTimeout(resolve, 200));
                                    return ["value-1", "value-2", "value-3", "value-4"];
                                }}
                                getOptionLabel={(option) => {
                                    return option;
                                }}
                                name="type"
                                label="AsyncSelectField"
                                fullWidth
                                variant="horizontal"
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
