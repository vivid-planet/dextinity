import "react-image-crop/dist/ReactCrop.css";

import { useApolloClient } from "@apollo/client";
import { Button, Dialog, DialogFormActions, Icon, KeyValueList, Typography } from "@dextinity/ui";
import { SwitchField } from "@dextinity/ui-react-final-form";
import { styled } from "@mui/material/styles";
import { deepEqual } from "fast-equals";
import { useId } from "react";
import { Form } from "react-final-form";
import { useIntl } from "react-intl";

import { fullCropArea } from "../../common/image/cropArea";
import { ImageCrop } from "../../common/image/ImageCrop";
import { ImageCropSettingsFields } from "../../common/image/ImageCropSettingsFields";
import { useContentScope } from "../../contentScope/Provider";
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

function toCropArea(values: FormValues): CropArea {
    if (values.focalPoint === "SMART") {
        return { focalPoint: "SMART", x: undefined, y: undefined, width: undefined, height: undefined };
    }
    if (values.crop.width && values.crop.height) {
        return {
            focalPoint: values.focalPoint,
            x: values.crop.x,
            y: values.crop.y,
            width: Math.ceil(values.crop.width),
            height: Math.ceil(values.crop.height),
        };
    }
    return { focalPoint: values.focalPoint, ...fullCropArea };
}

/**
 * A dialog to crop an image and set its focus point, e.g. for the image of a block, built with `@dextinity/ui`. With
 * `inheritedDamSettings`, the crop of the asset can be used instead.
 */
export function EditImageDialog({ image, initialValues, onSubmit, onClose, inheritedDamSettings, damFileId }: Props) {
    const intl = useIntl();
    const formId = useId();
    const contentScope = useContentScope();
    const apolloClient = useApolloClient();
    const { entityDependencyMap } = useDependenciesConfig();
    const damDependency = entityDependencyMap["DamFile"];

    const handleSubmit = (values: FormValues) => {
        onSubmit(values.useInheritedDamSettings ? undefined : toCropArea(values));
    };

    return (
        <Form<FormValues>
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
            initialValuesEqual={deepEqual}
        >
            {({ handleSubmit, values }) => {
                const usesInheritedDamSettings = inheritedDamSettings !== undefined && Boolean(values.useInheritedDamSettings);
                return (
                    <Dialog
                        open
                        onOpenChange={(open) => {
                            if (!open) {
                                onClose();
                            }
                        }}
                        size="large"
                        title={intl.formatMessage(
                            { id: "dextinity.blocks.image.edit", defaultMessage: "Edit image „{filename}”" },
                            { filename: image.name },
                        )}
                        description={[
                            intl.formatMessage(
                                { id: "dextinity.blocks.image.dimensions", defaultMessage: "{width}x{height}px" },
                                { width: image.width, height: image.height },
                            ),
                            image.size
                                ? intl.formatMessage(
                                      {
                                          id: "dextinity.blocks.image.fileSize",
                                          defaultMessage: "{size, number, :: .00 measure-unit/digital-megabyte}",
                                      },
                                      { size: image.size / 1024 / 1024 },
                                  )
                                : undefined,
                        ]
                            .filter((part) => part != null)
                            .join(" · ")}
                        labels={{ close: intl.formatMessage({ id: "dextinity.generic.close", defaultMessage: "Close" }) }}
                        footer={
                            <DialogFormActions
                                formId={formId}
                                submitLabel={intl.formatMessage({ id: "dextinity.generic.save", defaultMessage: "Save" })}
                                onCancel={onClose}
                                labels={{ cancel: intl.formatMessage({ id: "dextinity.generic.cancel", defaultMessage: "Cancel" }) }}
                            />
                        }
                    >
                        <Content id={formId} onSubmit={handleSubmit}>
                            <CropStage>
                                <ImageCrop src={image.url} disabled={usesInheritedDamSettings} />
                            </CropStage>
                            <Settings>
                                {inheritedDamSettings !== undefined && (
                                    <SettingsSection>
                                        <Typography variant="section" element="h3">
                                            {intl.formatMessage({ id: "dextinity.blocks.image.dam", defaultMessage: "DAM" })}
                                        </Typography>
                                        <SwitchField name="useInheritedDamSettings">
                                            {intl.formatMessage({
                                                id: "dextinity.blocks.image.useInheritedDamSettings",
                                                defaultMessage: "Use inherited DAM settings?",
                                            })}
                                        </SwitchField>
                                        {damDependency && damFileId && (
                                            <>
                                                <KeyValueList
                                                    items={[
                                                        {
                                                            key: intl.formatMessage({
                                                                id: "dextinity.blocks.image.damPathLabel",
                                                                defaultMessage: "DAM path",
                                                            }),
                                                            value: <DamPathLazy fileId={damFileId} />,
                                                        },
                                                    ]}
                                                />
                                                <div>
                                                    <Button
                                                        variant="outlined"
                                                        color="secondary"
                                                        size="small"
                                                        startIcon={<Icon name="window" />}
                                                        onClick={async () => {
                                                            const path = await damDependency.resolvePath({ apolloClient, id: damFileId });
                                                            window.open(contentScope.match.url + path, "_blank");
                                                        }}
                                                    >
                                                        {intl.formatMessage({
                                                            id: "dextinity.blocks.image.openInDam",
                                                            defaultMessage: "Open in DAM",
                                                        })}
                                                    </Button>
                                                </div>
                                            </>
                                        )}
                                    </SettingsSection>
                                )}
                                <ImageCropSettingsFields disabled={usesInheritedDamSettings} />
                            </Settings>
                        </Content>
                    </Dialog>
                );
            }}
        </Form>
    );
}

const Content = styled("form")`
    display: grid;
    grid-template-columns: minmax(0, 1fr) 300px;
    gap: var(--dextinity-space-6);
    align-items: start;
`;

const CropStage = styled("div")`
    display: grid;
    place-items: center;
    min-block-size: 240px;
    padding: var(--dextinity-space-3);
    border-radius: var(--dextinity-radius-item);
    background: var(--dextinity-color-surface-sunken);

    img {
        max-inline-size: 100%;
        max-block-size: 60vh;
    }
`;

const Settings = styled("div")`
    display: grid;
    gap: var(--dextinity-space-6);
`;

const SettingsSection = styled("div")`
    display: grid;
    gap: var(--dextinity-space-3);
    padding-block-end: var(--dextinity-space-6);
    border-block-end: 1px solid var(--dextinity-color-line);
`;
