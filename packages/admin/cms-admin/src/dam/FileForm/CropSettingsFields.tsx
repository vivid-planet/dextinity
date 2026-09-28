import { Button, Field, FieldContainer, FormSection } from "@dextinity/admin";
import { Reset } from "@dextinity/admin-icons";
import { FormControlLabel, Switch } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { ChangeEvent, JSX } from "react";
import { useForm, useFormState } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { BlockAdminComponentSection } from "../../blocks/common/BlockAdminComponentSection";
import { ChooseFocalPoint } from "../../common/image/ChooseFocalPoint";
import type { EditImageFormValues } from "./EditFile";

interface Props {
    disabled?: boolean;
}

export function CropSettingsFields({ disabled }: Props): JSX.Element {
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

    const Container = disabled ? DisabledFormSection : "div";

    return (
        <Container>
            <FormSection title={<FormattedMessage id="dextinity.dam.file.cropSettings.sectionTitle" defaultMessage="Crop/Focus settings" />}>
                <FieldContainer
                    fullWidth
                    helperText={
                        <>
                            <FormattedMessage
                                id="dextinity.dam.file.croppingInfoText"
                                defaultMessage="Cropping selects the maximum visible area. Depending on the aspect ratio, the image may be cropped further on the page."
                            />
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
                                    onChange({
                                        ...value,
                                        width: 100,
                                        height: 100,
                                        x: 0,
                                        y: 0,
                                    });
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
