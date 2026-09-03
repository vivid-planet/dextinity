import { Button, Field, FieldContainer, FormSection } from "@dextinity/admin";
import { Reset } from "@dextinity/admin-icons";
import { FormControlLabel, Switch } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { ChangeEvent, JSX } from "react";
import { useForm, useFormState } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { BlockAdminComponentSection } from "../../blocks/common/BlockAdminComponentSection";
import { formatAspectRatio, parseAspectRatio } from "../../common/image/aspectRatio";
import { ChooseFocalPoint } from "../../common/image/ChooseFocalPoint";
import { createInitialCrop, fullImageCrop } from "../../common/image/createInitialCrop";
import type { EditImageFormValues } from "./EditFile";

interface Props {
    disabled?: boolean;
    /**
     * Locks the crop area to a fixed aspect ratio, e.g. `"16x9"`, `"16/9"`, `"16:9"` or `16 / 9`.
     */
    aspectRatio?: string | number;
    /**
     * The image's dimensions in pixels. Needed to reset the crop area to a fixed aspect ratio, because the crop area is
     * stored as a percentage of each axis.
     */
    image?: { width: number; height: number };
}

export function CropSettingsFields({ disabled, aspectRatio, image }: Props): JSX.Element {
    const form = useForm<EditImageFormValues>();
    const {
        values: { focalPoint },
    } = useFormState<EditImageFormValues>();

    const handleSmartFocalPointChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            form.change("focalPoint", "SMART");
        } else {
            form.change("focalPoint", "CENTER");
        }
    };

    const showChooseManualFocusPointButtons = focalPoint !== "SMART";
    const showResetCropAreaButton = focalPoint !== "SMART";

    const aspect = aspectRatio !== undefined ? parseAspectRatio(aspectRatio) : undefined;
    const resetCrop = image !== undefined ? createInitialCrop({ aspect, image }) : fullImageCrop;

    const Container = disabled ? DisabledFormSection : "div";

    return (
        <Container>
            <FormSection title={<FormattedMessage id="dextinity.dam.file.cropSettings.sectionTitle" defaultMessage="Crop/Focus settings" />}>
                <FieldContainer
                    fullWidth
                    helperText={
                        <>
                            {aspectRatio === undefined ? (
                                <FormattedMessage
                                    id="dextinity.dam.file.croppingInfoText"
                                    defaultMessage="Cropping selects the maximum visible area. Depending on the aspect ratio, the image may be cropped further on the page."
                                />
                            ) : (
                                <FormattedMessage
                                    id="dextinity.dam.file.croppingInfoTextFixedAspectRatio"
                                    defaultMessage="Cropping is locked to the {aspectRatio} aspect ratio the image is displayed in, so the page shows exactly the selected area."
                                    values={{ aspectRatio: formatAspectRatio(aspectRatio) }}
                                />
                            )}
                            <br />
                            <br />
                            <FormattedMessage
                                id="dextinity.dam.file.focusPointInfoText"
                                defaultMessage="The focus point marks the most important part of the image, which is always visible. Choose it wisely."
                            />
                        </>
                    }
                >
                    <BlockAdminComponentSection
                        title={<FormattedMessage id="dextinity.dam.file.cropSettings.smartFocusPoint.title" defaultMessage="Smart focus point" />}
                    >
                        <FormControlLabel
                            control={<Switch checked={focalPoint === "SMART"} onChange={handleSmartFocalPointChange} />}
                            label={
                                focalPoint === "SMART" ? (
                                    <FormattedMessage id="dextinity.dam.file.smartFocusPoint.yes" defaultMessage="Yes" />
                                ) : (
                                    <FormattedMessage id="dextinity.dam.file.smartFocusPoint.no" defaultMessage="No" />
                                )
                            }
                        />
                    </BlockAdminComponentSection>
                </FieldContainer>
                {showChooseManualFocusPointButtons && (
                    <Field
                        name="focalPoint"
                        fullWidth
                        helperText={
                            <FormattedMessage
                                id="dextinity.blocks.image.hintSelectFocalPoint"
                                defaultMessage="You can also select the focus point by clicking on the bullets in the image."
                            />
                        }
                    >
                        {({ input: { value, onChange } }) => <ChooseFocalPoint focalPoint={value} onChangeFocalPoint={onChange} />}
                    </Field>
                )}
                {showResetCropAreaButton && (
                    <Field name="crop" fullWidth>
                        {({ input: { value, onChange } }) => (
                            <Button
                                startIcon={<Reset />}
                                onClick={() => {
                                    onChange({ ...value, ...resetCrop });
                                }}
                                variant="outlined"
                            >
                                <FormattedMessage id="dextinity.dam.file.resetCropArea" defaultMessage="Reset crop area" />
                            </Button>
                        )}
                    </Field>
                )}
            </FormSection>
        </Container>
    );
}

const DisabledFormSection = styled("div")`
    opacity: 0.5;
    pointer-events: none;
`;
