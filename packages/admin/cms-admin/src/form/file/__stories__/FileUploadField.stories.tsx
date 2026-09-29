import { Alert, FinalForm } from "@dextinity/admin";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { FileUploadField } from "../FileUploadField";
import type { GQLFinalFormFileUploadDownloadableFragment, GQLFinalFormFileUploadFragment } from "../FinalFormFileUpload.generated";

type Story = StoryObj<typeof FileUploadField>;
const config: Meta<typeof FileUploadField> = {
    component: FileUploadField,
    title: "form/file/FileUploadField",
};
export default config;

/**
 * Example of a single file upload
 *
 */
export const Default: Story = {
    render: () => {
        interface FormValues {
            value: GQLFinalFormFileUploadFragment;
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
                            <FileUploadField name="value" label="File Upload Field" fullWidth variant="horizontal" />

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
 * Example of a single file upload with an already initialized image.
 *
 * Note that in the formstate the file object is present right from the start, and only the internal id, name and size is available.
 */
export const DefaultWithInitializedImage: Story = {
    render: () => {
        interface FormValues {
            value: GQLFinalFormFileUploadFragment;
        }
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
                initialValues={{
                    value: {
                        size: 123456,
                        id: "mock-file-id-123",
                        name: "cactus-in-sun.jpg",
                    },
                }}
            >
                {({ values }) => {
                    return (
                        <>
                            <FileUploadField name="value" label="File Upload Field" fullWidth variant="horizontal" />

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
 * Example of a multi file upload
 *
 * Its important to set `maxFiles` when using `multiple`, otherwise the user could upload an unlimited number of files.
 */
export const MultiFileUpload: Story = {
    render: () => {
        interface FormValues {
            value: Array<GQLFinalFormFileUploadFragment>;
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
                            <FileUploadField name="value" label="File Upload Field" fullWidth variant="horizontal" maxFiles={5} multiple />

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
 * Example of a multi file upload with already initialized files.
 */
export const MultiFileUploadWithDefaultValues: Story = {
    render: () => {
        interface FormValues {
            value: Array<GQLFinalFormFileUploadFragment>;
        }
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
                initialValues={{
                    value: [
                        {
                            size: 123456,
                            id: "mock-file-id-123",
                            name: "cactus-in-sun.jpg",
                        },
                        {
                            size: 54323,
                            id: "mock-file-id-360",
                            name: "red-flower.jpg",
                        },
                        {
                            size: 665343,
                            id: "mock-file-id-429",
                            name: "rasperry.jpg",
                        },
                    ],
                }}
            >
                {({ values }) => {
                    return (
                        <>
                            <FileUploadField name="value" label="File Upload Field" fullWidth variant="horizontal" maxFiles={5} multiple />

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
 * Example of a single file upload with file download enabled
 *
 * File download gets automatically enabled when downloadUrl is present on the uploaded file object
 */
export const WithDownload: Story = {
    render: () => {
        interface FormValues {
            value: GQLFinalFormFileUploadDownloadableFragment;
        }
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
                initialValues={{
                    value: {
                        size: 123456,
                        id: "mock-file-id-123",
                        name: "cactus-in-sun.jpg",
                        imageUrl: "https://picsum.photos/id/35/200/300",
                        downloadUrl: "https://picsum.photos/id/35/2000/3000",
                    },
                }}
            >
                {({ values }) => {
                    return (
                        <>
                            <FileUploadField name="value" label="File Upload Field" fullWidth variant="horizontal" />

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
 * Example of a file upload with grid layout and image preview
 */
export const WithPreview: Story = {
    render: () => {
        interface FormValues {
            value: GQLFinalFormFileUploadFragment;
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
                            <FileUploadField name="value" label="File Upload Field" fullWidth variant="horizontal" layout="grid" />

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
 * Example of a multi file upload with grid layout, image preview and file download enabled
 *
 * Note that the maxFiles of 3 is reached with the initialized files, so no more files can be uploaded until one is removed.
 */
export const WithPreviewAndMultiFileUploadInitialized: Story = {
    render: () => {
        interface FormValues {
            value: Array<GQLFinalFormFileUploadDownloadableFragment>;
        }
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
                initialValues={{
                    value: [
                        {
                            size: 123456,
                            id: "mock-file-id-123",
                            name: "cactus-in-sun.jpg",
                            imageUrl: "https://picsum.photos/id/35/200/300",
                            downloadUrl: "https://picsum.photos/id/35/2000/3000",
                        },
                        {
                            size: 54323,
                            id: "mock-file-id-123",
                            name: "cactus-in-sun.jpg",
                            imageUrl: "https://picsum.photos/id/360/200/300",
                            downloadUrl: "https://picsum.photos/id/360/2000/3000",
                        },
                        {
                            size: 665343,
                            id: "mock-file-id-123",
                            name: "cactus-in-sun.jpg",
                            imageUrl: "https://picsum.photos/id/429/200/300",
                            downloadUrl: "https://picsum.photos/id/429/2000/3000",
                        },
                    ],
                }}
            >
                {({ values }) => {
                    return (
                        <>
                            <FileUploadField
                                name="value"
                                label="File Upload Field"
                                fullWidth
                                variant="horizontal"
                                layout="grid"
                                multiple
                                maxFiles={3}
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
 * Example of a file upload with grid layout, image preview and file download enabled
 */
export const WithPreviewAndDownload: Story = {
    render: () => {
        interface FormValues {
            value: GQLFinalFormFileUploadDownloadableFragment;
        }
        return (
            <FinalForm<FormValues>
                mode="edit"
                onSubmit={() => {
                    // not handled
                }}
                subscription={{ values: true }}
                initialValues={{
                    value: {
                        size: 123456,
                        id: "mock-file-id-123",
                        name: "cactus-in-sun.jpg",
                        imageUrl: "https://picsum.photos/id/35/200/300",
                        downloadUrl: "https://picsum.photos/id/35/2000/3000",
                    },
                }}
            >
                {({ values }) => {
                    return (
                        <>
                            <FileUploadField name="value" label="File Upload Field" fullWidth variant="horizontal" layout="grid" />

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
