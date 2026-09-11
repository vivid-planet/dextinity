import "react-image-crop/dist/ReactCrop.css";

import { useApolloClient } from "@apollo/client";
import { CancelButton, Field, FormSection, messages, SaveButton } from "@dextinity/admin";
import { OpenNewTab } from "@dextinity/admin-icons";
import {
    Box,
    // eslint-disable-next-line no-restricted-imports
    Button,
    // eslint-disable-next-line no-restricted-imports
    Dialog,
    DialogActions,
    DialogContent as MuiDialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    Switch,
    Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import isEqual from "lodash.isequal";
import type { ChangeEvent } from "react";
import { Form } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { ImageCrop } from "../../common/image/ImageCrop";
import { useContentScope } from "../../contentScope/Provider";
import { CropSettingsFields } from "../../dam/FileForm/CropSettingsFields";
import type { EditImageFormValues } from "../../dam/FileForm/EditFile";
import { useDependenciesConfig } from "../../dependencies/dependenciesConfig";
import { DamPathLazy } from "../../form/file/DamPathLazy";
import type { GQLFocalPoint } from "../../graphql.generated";

type CropArea = {
    focalPoint: GQLFocalPoint;
    width?: number;
    height?: number;
    x?: number;
    y?: number;
};

const imageStyle = { maxWidth: "60vw", maxHeight: "70vh" };

interface FormValues extends EditImageFormValues {
    useInheritedDamSettings?: boolean;
}

interface Props {
    image: {
        name: string;
        url: string;
        width: number;
        height: number;
        size?: number;
    };
    damFileId: string;
    onClose: () => void;
    initialValues: {
        useInheritedDamSettings?: boolean;
        cropArea?: CropArea;
    };
    onSubmit: (cropArea: CropArea | undefined) => void;
    inheritedDamSettings?: { cropArea: CropArea };
}

const DialogContent = styled(MuiDialogContent)`
    display: grid;
    grid-template-columns: auto 320px;
    padding: 0;
    padding-left: 40px;
`;

export function EditImageDialog({ image, initialValues, onSubmit, onClose, inheritedDamSettings, damFileId }: Props) {
    const contentScope = useContentScope();
    const apolloClient = useApolloClient();
    const { entityDependencyMap } = useDependenciesConfig();

    const handleSubmit = (values: FormValues) => {
        if (values.useInheritedDamSettings) {
            onSubmit(undefined);
        } else {
            let cropArea: CropArea;

            if (values.focalPoint === "SMART") {
                cropArea = {
                    focalPoint: "SMART",
                    x: undefined,
                    y: undefined,
                    width: undefined,
                    height: undefined,
                };
            } else {
                cropArea = {
                    focalPoint: values.focalPoint ?? undefined,
                    x: values.crop.x,
                    y: values.crop.y,
                    width: values.crop.width ? Math.ceil(values.crop.width) : undefined,
                    height: values.crop.height ? Math.ceil(values.crop.height) : undefined,
                };
            }

            onSubmit(cropArea);
        }
    };

    return (
        <Form
            onSubmit={handleSubmit}
            initialValues={{
                useInheritedDamSettings: initialValues.useInheritedDamSettings,
                focalPoint: initialValues.cropArea?.focalPoint ?? "SMART",
                crop: {
                    width: initialValues.cropArea?.width ?? 100,
                    height: initialValues.cropArea?.height ?? 100,
                    x: initialValues.cropArea?.x ?? 0,
                    y: initialValues.cropArea?.y ?? 0,
                },
            }}
            initialValuesEqual={isEqual}
        >
            {({ handleSubmit, values }) => (
                <Dialog open onClose={onClose} maxWidth={false}>
                    <DialogFormWrapper onSubmit={handleSubmit}>
                        <DialogTitle>
                            <Grid container justifyContent="space-between">
                                <Grid>
                                    <Typography>
                                        <FormattedMessage
                                            id="dextinity.blocks.image.edit"
                                            defaultMessage="Edit image „{filename}”"
                                            values={{
                                                filename: image.name,
                                            }}
                                        />
                                    </Typography>
                                </Grid>
                                <Grid>
                                    <Typography>
                                        <FormattedMessage
                                            id="dextinity.blocks.image.dimensions"
                                            defaultMessage="{width}x{height}px"
                                            values={{
                                                width: image.width,
                                                height: image.height,
                                            }}
                                        />
                                        {image.size && (
                                            <FormattedMessage
                                                id="dextinity.blocks.image.size"
                                                defaultMessage=" | {size, number, :: .00 measure-unit/digital-megabyte}"
                                                values={{
                                                    size: image.size / 1024 / 1024,
                                                }}
                                            />
                                        )}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </DialogTitle>
                        <DialogContent>
                            <ImageCrop src={image.url} style={imageStyle} disabled={values.useInheritedDamSettings} />
                            <div>
                                {inheritedDamSettings !== undefined && (
                                    <>
                                        <Box padding={8} paddingTop={0}>
                                            <FormSection
                                                title={<FormattedMessage id="dextinity.blocks.image.dam" defaultMessage="DAM" />}
                                                disableMarginBottom
                                            >
                                                <Field
                                                    name="useInheritedDamSettings"
                                                    label={
                                                        <FormattedMessage
                                                            id="dextinity.blocks.image.useInheritedDamSettings"
                                                            defaultMessage="Use inherited DAM settings?"
                                                        />
                                                    }
                                                    type="checkbox"
                                                >
                                                    {({ input: { checked, onChange } }) => <YesNoSwitch checked={checked} onChange={onChange} />}
                                                </Field>
                                            </FormSection>
                                        </Box>

                                        {entityDependencyMap["DamFile"] && damFileId && (
                                            <Box padding={7} paddingTop={0}>
                                                <>
                                                    <Typography variant="subtitle1">
                                                        <FormattedMessage id="dextinity.blocks.image.damPath" defaultMessage="DAM Path: " />
                                                    </Typography>
                                                    <Typography mb={2}>
                                                        <DamPathLazy fileId={damFileId} />
                                                    </Typography>
                                                </>
                                                <Button
                                                    variant="outlined"
                                                    color="inherit"
                                                    onClick={async () => {
                                                        const path = await entityDependencyMap["DamFile"].resolvePath({
                                                            apolloClient,
                                                            id: damFileId,
                                                        });
                                                        const url = contentScope.match.url + path;
                                                        window.open(url, "_blank");
                                                    }}
                                                    startIcon={<OpenNewTab />}
                                                >
                                                    <FormattedMessage id="dextinity.blocks.image.openInDam" defaultMessage="Open in DAM" />
                                                </Button>
                                            </Box>
                                        )}
                                        <Divider sx={{ marginLeft: 8, marginRight: 8 }} />
                                    </>
                                )}
                                <Box padding={8}>
                                    <CropSettingsFields disabled={inheritedDamSettings === undefined ? false : values.useInheritedDamSettings} />
                                </Box>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <CancelButton type="button" onClick={onClose} />
                            <SaveButton type="submit" />
                        </DialogActions>
                    </DialogFormWrapper>
                </Dialog>
            )}
        </Form>
    );
}

interface YesNoSwitchProps {
    checked?: boolean;
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}

const YesNoSwitch = ({ checked, onChange }: YesNoSwitchProps) => {
    return (
        <FormControlLabel
            control={<Switch checked={checked} onChange={onChange} />}
            label={checked ? <FormattedMessage {...messages.yes} /> : <FormattedMessage {...messages.no} />}
        />
    );
};

const DialogFormWrapper = styled("form")`
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: min-content auto min-content;
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    max-height: 100%;
    overflow: hidden;
`;
