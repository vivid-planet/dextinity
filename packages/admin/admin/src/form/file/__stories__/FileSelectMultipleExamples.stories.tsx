import { Box, Grid, Typography } from "@mui/material";
import { useState } from "react";

import { FileSelect } from "../../../form/file/FileSelect";
import type { FileSelectItem } from "../../../form/file/fileSelectItemTypes";

type StoryProps = {
    noBackground?: boolean;
    hasExistingFiles?: boolean;
};

const dummyFiles: FileSelectItem[] = [
    { name: "lorem ipsum.png", size: 3e5 },
    {
        name: "This is a file with a really long name to test truncating in the file list.jpeg",
        size: 6e6,
    },
    {
        name: "failed.png",
        error: true,
    },
];

const dummyFileDownload = (file: any) => {
    alert(`Pretend "${file.name}" was just downloaded.`);
};

const SingleFileSelectStory = ({ noBackground, hasExistingFiles }: StoryProps) => {
    const [file, setFile] = useState<FileSelectItem | undefined>(hasExistingFiles ? dummyFiles[0] : undefined);
    const [tooManyFilesSelected, setTooManyFilesSelected] = useState(false);

    return (
        <Box padding={4} sx={{ backgroundColor: noBackground ? "transparent" : "white" }}>
            <Typography variant="h6" gutterBottom>
                Single File Select
            </Typography>
            <FileSelect
                onDrop={(acceptedFiles, rejectedFiles) => {
                    const tooManyFilesWereDropped = rejectedFiles.some((rejection) =>
                        rejection.errors.some((error) => error.code === "too-many-files"),
                    );

                    setTooManyFilesSelected(tooManyFilesWereDropped);

                    if (!tooManyFilesWereDropped) {
                        if (acceptedFiles.length > 0) {
                            setFile({
                                name: acceptedFiles[0].name,
                                size: acceptedFiles[0].size,
                            });
                        }
                        if (rejectedFiles.length > 0) {
                            setFile({
                                name: rejectedFiles[0].file.name,
                                error: true,
                            });
                        }
                    }
                }}
                onRemove={() => {
                    setFile(undefined);
                }}
                onDownload={dummyFileDownload}
                maxFileSize={1024 * 1024 * 5} // 5 MB
                files={file ? [file] : []}
                error={tooManyFilesSelected ? "Selection was canceled. You can only select one file." : undefined}
            />
        </Box>
    );
};

const MultipleFileSelectStory = ({ noBackground, hasExistingFiles }: StoryProps) => {
    const [files, setFiles] = useState<FileSelectItem[]>(hasExistingFiles ? dummyFiles : []);
    const [tooManyFilesSelected, setTooManyFilesSelected] = useState(false);
    const maxNumberOfFiles = 4;

    return (
        <Box padding={4} sx={{ backgroundColor: noBackground ? "transparent" : "white" }}>
            <Typography variant="h6" gutterBottom>
                Multiple File Select
            </Typography>
            <FileSelect
                onDrop={(acceptedFiles, rejectedFiles) => {
                    const tooManyFilesWereDropped = rejectedFiles.some((rejection) =>
                        rejection.errors.some((error) => error.code === "too-many-files"),
                    );

                    setTooManyFilesSelected(tooManyFilesWereDropped);

                    if (!tooManyFilesWereDropped) {
                        setFiles((existingFiles) => {
                            return [
                                ...existingFiles,
                                ...acceptedFiles.map((file) => ({
                                    name: file.name,
                                    size: file.size,
                                })),
                                ...rejectedFiles.map((file) => ({
                                    name: file.file.name,
                                    error: true,
                                })),
                            ];
                        });
                    }
                }}
                onRemove={(fileToRemove) => setFiles(files.filter((file) => file.name !== fileToRemove.name))}
                onDownload={dummyFileDownload}
                files={files}
                maxFiles={maxNumberOfFiles}
                maxFileSize={1024 * 1024 * 5} // 5 MB
                error={
                    tooManyFilesSelected
                        ? `Selection was canceled. You can only select a maximum of ${maxNumberOfFiles} files, please reduce your selection.`
                        : undefined
                }
            />
        </Box>
    );
};

export default {
    title: "components/form/File",
    args: {
        noBackground: false,
    },
    argTypes: {
        noBackground: {
            name: "No background",
            control: "boolean",
        },
    },
};

type Args = {
    noBackground: boolean;
};

export const FileSelectMultipleExamples = {
    render: ({ noBackground }: Args) => {
        return (
            <div>
                <Grid container spacing={4}>
                    <Grid size={6}>
                        <SingleFileSelectStory noBackground={noBackground} />
                    </Grid>
                    <Grid size={6}>
                        <MultipleFileSelectStory noBackground={noBackground} />
                    </Grid>
                    <Grid size={6}>
                        <SingleFileSelectStory noBackground={noBackground} hasExistingFiles />
                    </Grid>
                    <Grid size={6}>
                        <MultipleFileSelectStory noBackground={noBackground} hasExistingFiles />
                    </Grid>
                </Grid>
            </div>
        );
    },

    name: "File Select (multiple examples)",
};
