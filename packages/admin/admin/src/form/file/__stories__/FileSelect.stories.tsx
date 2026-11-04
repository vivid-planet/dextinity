import { Card, CardContent, Stack } from "@mui/material";
import type { Meta } from "@storybook/react-vite";

import { FileSelect } from "../../../form/file/FileSelect";
import type { FileSelectItem } from "../../../form/file/fileSelectItemTypes";

export default {
    title: "components/form/File",
    decorators: [
        (story, context) => (
            <Card sx={{ maxWidth: context.args.layout === "grid" ? 960 : 440 }}>
                <CardContent>
                    <Stack spacing={4}>{story()}</Stack>
                </CardContent>
            </Card>
        ),
    ],
    args: {
        layout: "list",
        disabled: false,
        readOnly: false,
        multiple: false,
        hasError: false,
        hasMaxFileSize: false,
        hasMaxFiles: false,
        onlyAllowImages: false,
        filesSelection: "No files",
    },
    argTypes: {
        layout: {
            name: "Layout",
            control: "select",
            options: ["list", "grid"],
        },
        disabled: {
            name: "Disabled",
            control: "boolean",
        },
        readOnly: {
            name: "Readonly",
            control: "boolean",
        },
        multiple: {
            name: "Multiple",
            control: "boolean",
        },
        hasError: {
            name: "Has Error",
            control: "boolean",
        },
        hasMaxFileSize: {
            name: "Limit file size (5 MB)",
            control: "boolean",
        },
        hasMaxFiles: {
            name: "Max number of files (4)",
            control: "boolean",
        },
        onlyAllowImages: {
            name: "Only allow images",
            control: "boolean",
        },
        filesSelection: {
            name: "Existing files",
            control: "select",
            options: ["No files", "One valid file", "Three valid files", "Four files (one too large)", "Four files (one uploading)"],
        },
    },
} as Meta<typeof FileSelect>;

type Args = {
    layout: "list" | "grid";
    disabled: boolean;
    readOnly: boolean;
    multiple: boolean;
    hasError: boolean;
    hasMaxFileSize: boolean;
    hasMaxFiles: boolean;
    onlyAllowImages: boolean;
    filesSelection: "No files" | "One valid file" | "Three valid files" | "Four files (one too large)" | "Four files (one uploading)";
};

export const _FileSelect = {
    render: ({ layout, disabled, readOnly, multiple, hasError, hasMaxFileSize, hasMaxFiles, onlyAllowImages, filesSelection }: Args) => {
        console.log(layout);
        const exampleFiles: Record<string, FileSelectItem> = {
            "fileName.xyz": {
                name: "Filename.xyz",
                size: 4.3 * 1024 * 1024, // 4.3 MB
            },
            "anotherFile.png": {
                name: "Another file.png",
                size: 568 * 1024, // 568 KB
            },
            "fileNumberThree.jpg": {
                name: "File number three.jpg",
                size: 1.8 * 1024 * 1024, // 1.8 MB
            },
            "fileUploading.jpg": {
                name: "File that is uploading.jpg",
                loading: true,
            },
            "fileTooLarge.png": {
                name: "Failed to upload.png",
                size: 200 * 1024 * 1024, // 200 MB
                error: "The file is too large",
            },
        };

        const filesMapping = {
            "No files": [] as FileSelectItem[],
            "One valid file": [exampleFiles["fileName.xyz"]],
            "Three valid files": [exampleFiles["fileName.xyz"], exampleFiles["anotherFile.png"], exampleFiles["fileNumberThree.jpg"]],
            "Four files (one too large)": [
                exampleFiles["fileName.xyz"],
                exampleFiles["anotherFile.png"],
                exampleFiles["fileNumberThree.jpg"],
                exampleFiles["fileTooLarge.png"],
            ],
            "Four files (one uploading)": [
                exampleFiles["fileName.xyz"],
                exampleFiles["anotherFile.png"],
                exampleFiles["fileNumberThree.jpg"],
                exampleFiles["fileUploading.jpg"],
            ],
        };

        return (
            <FileSelect
                onDrop={(acceptedFiles, rejectedFiles) => {
                    console.log(acceptedFiles, rejectedFiles);
                }}
                onRemove={() => {
                    console.log("Removing file");
                }}
                onDownload={() => {
                    console.log("Downloading file");
                }}
                layout={layout}
                files={filesMapping[filesSelection]}
                disabled={disabled}
                readOnly={readOnly}
                multiple={multiple}
                maxFileSize={
                    hasMaxFileSize
                        ? 5 * 1024 * 1024 // 5 MB
                        : undefined
                }
                maxFiles={hasMaxFiles ? 4 : undefined}
                error={hasError ? "An error occurred" : undefined}
                accept={onlyAllowImages ? { "image/*": [] } : undefined}
            />
        );
    },

    name: "FileSelect",
};
