import { Alert, Button, useSnackbarApi } from "@dextinity/admin";
import { Upload } from "@dextinity/admin-icons";
import { Snackbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useQueryClient } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { type ChangeEvent, useState } from "react";
import { FormattedMessage } from "react-intl";

import { getErrorMessage } from "../../core/client/index.js";
import { damQueryKeys } from "./damApi.types.js";
import { useDamApi } from "./DamApiProvider.js";

export function UploadFilesButton({ folderId }: { folderId?: string }) {
    const { client, scope } = useDamApi();
    const queryClient = useQueryClient();
    const snackbarApi = useSnackbarApi();
    const [uploading, setUploading] = useState(false);

    const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        event.target.value = "";
        setUploading(true);

        const failedUploads: string[] = [];
        for (const file of files) {
            try {
                await parseResponse(client.files.upload.$post({ form: { file, scope: JSON.stringify(scope), ...(folderId && { folderId }) } }));
            } catch (error) {
                failedUploads.push(`${file.name}: ${getErrorMessage(error)}`);
            }
        }

        setUploading(false);
        await queryClient.invalidateQueries({ queryKey: damQueryKeys.all });

        snackbarApi.showSnackbar(
            <Snackbar autoHideDuration={failedUploads.length > 0 ? null : 5000}>
                {failedUploads.length > 0 ? (
                    <Alert severity="error" title={<FormattedMessage id="dextinity.dam.uploadFailed" defaultMessage="Upload failed" />}>
                        {failedUploads.join("\n")}
                    </Alert>
                ) : (
                    <Alert severity="success">
                        <FormattedMessage
                            id="dextinity.dam.uploadSucceeded"
                            defaultMessage="{count, plural, one {# file uploaded} other {# files uploaded}}"
                            values={{ count: files.length }}
                        />
                    </Alert>
                )}
            </Snackbar>,
        );
    };

    return (
        <Button variant="primary" responsive startIcon={<Upload />} component="label" disabled={uploading}>
            <FormattedMessage id="dextinity.dam.uploadFiles" defaultMessage="Upload files" />
            <HiddenFileInput type="file" multiple onChange={handleChange} />
        </Button>
    );
}

const HiddenFileInput = styled("input")`
    display: none;
`;
