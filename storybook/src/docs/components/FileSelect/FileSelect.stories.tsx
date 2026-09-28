import { FileSelect, type FileSelectItem } from "@dextinity/admin";
import { Card, CardContent } from "@mui/material";
import type { Meta } from "@storybook/react-vite";

export default {
    title: "Docs/Components/FileSelect",
    decorators: [
        (story) => (
            <Card>
                <CardContent>{story()}</CardContent>
            </Card>
        ),
    ],
} as Meta<typeof FileSelect>;

export const Basic = {
    render: () => {
        const value: FileSelectItem[] = [
            {
                name: "Filename.xyz",
                size: 4.3 * 1024 * 1024, // 4.3 MB
            },
            {
                name: "Another file.png",
                size: 568 * 1024, // 568 KB
            },
            {
                name: "File that is uploading.jpg",
                loading: true,
            },
            {
                name: "Failed to upload.png",
                size: 200 * 1024 * 1024, // 200 MB
                error: "The file is too large",
            },
        ];

        return (
            <FileSelect
                onDrop={(acceptedFiles, fileRejections) => {
                    // Handle what happens with the dropped files
                }}
                onRemove={(file) => {
                    // Handle remove
                }}
                onDownload={(file) => {
                    // Handle download
                }}
                files={value}
                maxFileSize={10 * 1024 * 1024} // 10 MB
                maxFiles={5}
            />
        );
    },
    name: "FileSelect",
};

export const Readonly = {
    render: () => {
        const value: FileSelectItem[] = [
            {
                name: "Filename.xyz",
                size: 4.3 * 1024 * 1024, // 4.3 MB
            },
            {
                name: "Another file.png",
                size: 568 * 1024, // 568 KB
            },
        ];

        return (
            <FileSelect
                onDownload={(file) => {
                    // Handle download
                }}
                files={value}
                readOnly
            />
        );
    },
    name: "ReadOnly FileSelect",
};

export const GridWithPreview = {
    render: () => {
        const value: FileSelectItem[] = [
            {
                name: "Filename.xyz",
                size: 4.3 * 1024 * 1024, // 4.3 MB
            },
            {
                name: "Another file.png",
                size: 568 * 1024, // 568 KB
            },
            {
                name: "And another file.png",
                size: 5.6 * 1024 * 1024, // 5.6 MB
            },
            {
                name: "Yet another file.pdf",
                size: 8.2 * 1024 * 1024, // 8.2 MB
            },
            {
                name: "And again another file.jpg",
                size: 3.4 * 1024 * 1024, // 3.4 MB
            },
            {
                name: "One last file.png",
                size: 1.2 * 1024 * 1024, // 1.2 MB
            },
        ];

        return (
            <FileSelect
                onDownload={(file) => {
                    // Handle download
                }}
                files={value}
                readOnly
                layout="grid"
            />
        );
    },
    name: "Grid with preview",
};
