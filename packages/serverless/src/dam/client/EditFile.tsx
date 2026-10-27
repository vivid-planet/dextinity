import { FieldSet, FileIcon, FinalForm, Loading, TextField } from "@dextinity/admin";
import { Card, CardContent, CardMedia, Grid, Typography } from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { parseResponse } from "hono/client";
import { FormattedMessage, useIntl } from "react-intl";

import { createImageUrl, type DamFileDetails, damQueryKeys } from "./damApi.types.js";
import { useDamApi } from "./DamApiProvider.js";
import { FormattedFileSize } from "./FormattedFileSize.js";

interface FormValues {
    name: string;
    title: string;
    altText: string;
}

export function EditFile({ id }: { id: string }) {
    const intl = useIntl();
    const { client } = useDamApi();
    const queryClient = useQueryClient();
    const { data: file } = useQuery({
        queryKey: damQueryKeys.file(id),
        queryFn: () => parseResponse(client.files[":id"].$get({ param: { id } })),
    });

    if (!file) {
        return <Loading behavior="fillPageHeight" />;
    }

    const handleSubmit = async ({ name, title, altText }: FormValues) => {
        await parseResponse(client.files[":id"].$patch({ param: { id }, json: { name, title: title || null, altText: altText || null } }));
        await queryClient.invalidateQueries({ queryKey: damQueryKeys.all });
    };

    return (
        <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 8 }}>
                <FinalForm<FormValues>
                    mode="edit"
                    initialValues={{ name: file.name, title: file.title ?? "", altText: file.altText ?? "" }}
                    onSubmit={handleSubmit}
                >
                    <FieldSet title={<FormattedMessage id="dextinity.dam.fileSettings" defaultMessage="File settings" />}>
                        <TextField
                            name="name"
                            label={intl.formatMessage({ id: "dextinity.dam.filename", defaultMessage: "Filename" })}
                            required
                            fullWidth
                        />
                        <TextField name="title" label={intl.formatMessage({ id: "dextinity.dam.title", defaultMessage: "Title" })} fullWidth />
                        <TextField
                            name="altText"
                            label={intl.formatMessage({ id: "dextinity.dam.altText", defaultMessage: "Alt text" })}
                            fullWidth
                            multiline
                            minRows={2}
                        />
                    </FieldSet>
                </FinalForm>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
                <FilePreview file={file} />
            </Grid>
        </Grid>
    );
}

function FilePreview({ file }: { file: DamFileDetails }) {
    const { resolveUrl } = useDamApi();

    return (
        <Card>
            {file.image ? (
                <CardMedia component="img" image={resolveUrl(createImageUrl(file.image, { width: 640 }))} alt={file.altText ?? ""} />
            ) : (
                <CardContent>
                    <FileIcon fileType={file.mimetype} fontSize="large" />
                </CardContent>
            )}
            <CardContent>
                <Typography variant="subtitle2">{file.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                    {file.image ? (
                        <FormattedMessage
                            id="dextinity.dam.imageDetails"
                            defaultMessage="{mimetype} · {size} · {width} × {height} px"
                            values={{
                                mimetype: file.mimetype,
                                size: <FormattedFileSize key="size" bytes={file.size} />,
                                width: file.image.width,
                                height: file.image.height,
                            }}
                        />
                    ) : (
                        <FormattedMessage
                            id="dextinity.dam.fileDetails"
                            defaultMessage="{mimetype} · {size}"
                            values={{ mimetype: file.mimetype, size: <FormattedFileSize key="size" bytes={file.size} /> }}
                        />
                    )}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    <FormattedMessage id="dextinity.dam.damPath" defaultMessage="Path: {damPath}" values={{ damPath: file.damPath }} />
                </Typography>
            </CardContent>
        </Card>
    );
}
