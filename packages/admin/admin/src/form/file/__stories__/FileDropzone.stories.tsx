import { Card, CardContent, Stack } from "@mui/material";
import type { Meta } from "@storybook/react-vite";
import { useState } from "react";

import { FileDropzone, type FileDropzoneProps } from "../../../form/file/FileDropzone";

type FileRejections = Parameters<Required<FileDropzoneProps>["onDropRejected"]>[0];

export default {
    title: "components/form/File",
    decorators: [
        (story) => (
            <Card sx={{ maxWidth: 440 }}>
                <CardContent>
                    <Stack spacing={4}>{story()}</Stack>
                </CardContent>
            </Card>
        ),
    ],
    args: {
        disabled: false,
        multiple: false,
        hasError: false,
    },
    argTypes: {
        disabled: {
            name: "Disabled",
            control: "boolean",
        },
        multiple: {
            name: "Multiple",
            control: "boolean",
        },
        hasError: {
            name: "Has errors",
            control: "boolean",
        },
    },
} as Meta<typeof FileDropzone>;

type Args = {
    disabled: boolean;
    multiple: boolean;
    hasError: boolean;
};

export const _FileDropzone = {
    render: ({ disabled, multiple, hasError }: Args) => {
        const [files, setFiles] = useState<File[]>([]);
        const [rejectedFiles, setRejectedFiles] = useState<FileRejections>([]);

        return (
            <>
                <FileDropzone
                    disabled={disabled}
                    multiple={multiple}
                    hasError={hasError}
                    onDrop={(files) => {
                        setFiles(files);
                        setRejectedFiles([]);
                    }}
                    onDropRejected={(rejectedFiles) => {
                        setFiles([]);
                        setRejectedFiles(rejectedFiles);
                    }}
                />
                <pre>{JSON.stringify({ files, rejectedFiles }, null, 2)}</pre>
            </>
        );
    },

    name: "FileDropzone",
};
