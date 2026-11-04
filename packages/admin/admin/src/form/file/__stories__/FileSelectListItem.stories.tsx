import { Card, CardContent, Stack } from "@mui/material";
import type { Meta } from "@storybook/react-vite";

import type { FileSelectItem } from "../../../form/file/fileSelectItemTypes";
import { FileSelectListItem } from "../../../form/file/FileSelectListItem";

const fileSize = 1.8 * 1024 * 1024; // 1.8 MB

const fileItems: Record<string, FileSelectItem> = {
    "Valid File": { name: "Filename.xyz", size: fileSize },
    "Long File Name": {
        name: "This is a really long file name that should cause the text to be truncated and show a tooltip.png",
        size: fileSize,
    },
    Loading: { name: "Filename.xyz", loading: true },
    "Error (no details)": { name: "Filename.xyz", error: true },
    "Error (with details)": { name: "Filename.xyz", error: "File too large" },
    Skeleton: { loading: true },
};

const filePreviewOptions = {
    None: undefined,
    "Generic Preview": true,
    "Image Preview": "https://picsum.photos/756/756",
};

const downloadMethods = ["No download", "Download function", "Download URL"];

export default {
    title: "components/form/File",
    decorators: [
        (story) => (
            <Card sx={{ maxWidth: 300 }}>
                <CardContent>
                    <Stack spacing={4}>{story()}</Stack>
                </CardContent>
            </Card>
        ),
    ],
    args: {
        selectedFile: fileItems["Valid File"],
        showFilePreview: filePreviewOptions["None"],
        downloadMethod: downloadMethods[0],
        canBeDeleted: true,
        disabled: false,
    },
    argTypes: {
        selectedFile: {
            name: "File Item",
            control: "select",
            options: Object.keys(fileItems),
            mapping: fileItems,
        },
        showFilePreview: {
            name: "Field Preview",
            control: "select",
            options: Object.keys(filePreviewOptions),
            mapping: filePreviewOptions,
        },
        downloadMethod: {
            name: "Can be downloaded",
            control: "select",
            options: downloadMethods,
        },
        canBeDeleted: {
            name: "Can Be Deleted",
            control: "boolean",
        },
        disabled: {
            name: "Disabled",
            control: "boolean",
        },
    },
} as Meta<typeof FileSelectListItem>;

type Args = {
    selectedFile: FileSelectItem;
    showFilePreview?: boolean | string;
    downloadMethod: string;
    canBeDeleted: boolean;
    disabled: boolean;
};

export const _FileSelectListItem = {
    render: ({ selectedFile, showFilePreview, downloadMethod, canBeDeleted, disabled }: Args) => {
        return (
            <FileSelectListItem
                file={selectedFile}
                onClickDownload={downloadMethod === "Download function" ? () => alert("Downloading file") : undefined}
                downloadUrl={downloadMethod === "Download URL" ? "https://example.com" : undefined}
                onClickDelete={canBeDeleted ? () => alert("Delete") : undefined}
                filePreview={showFilePreview}
                disabled={disabled}
            />
        );
    },

    name: "FileSelectListItem",
};
