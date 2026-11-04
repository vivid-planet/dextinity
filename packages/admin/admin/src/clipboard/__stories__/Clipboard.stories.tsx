import { Grid } from "@mui/material";
import { useState } from "react";

import { Alert } from "../../alert/Alert";
import { Button } from "../../common/buttons/Button";
import { readClipboardText } from "../readClipboardText";
import { writeClipboardText } from "../writeClipboardText";

export default {
    title: "components/clipboard/Clipboard",
};

export const ClipboardFallbackSizeLimit = function () {
    const writtenClipboardContent = "a".repeat(1024 * 1024 * 10); // 10MB
    const [readClipboardContent, setReadClipboardContent] = useState<string | undefined>();

    return (
        <Grid container spacing={2}>
            <Grid size={12}>
                <Alert severity="info">To test this story, either a) disallow clipboard access in your browser, or b) try it in Firefox.</Alert>
            </Grid>
            <Grid>
                <Button
                    onClick={() => {
                        writeClipboardText(writtenClipboardContent);
                    }}
                >
                    Write clipboard
                </Button>
            </Grid>
            <Grid>
                <Button
                    onClick={async () => {
                        setReadClipboardContent(await readClipboardText());
                    }}
                >
                    Read clipboard
                </Button>
            </Grid>
            {readClipboardContent && (
                <Grid size={12}>
                    {writtenClipboardContent === readClipboardContent ? (
                        <Alert severity="success">Read clipboard content matches written clipboard content.</Alert>
                    ) : (
                        <Alert severity="error">Read clipboard content does not match written clipboard content.</Alert>
                    )}
                </Grid>
            )}
        </Grid>
    );
};

ClipboardFallbackSizeLimit.storyName = "Clipboard fallback size limit";
