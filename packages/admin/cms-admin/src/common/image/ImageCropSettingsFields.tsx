import { Button, Icon, type IconName, Typography } from "@dextinity/ui";
import { SegmentedControlField, SwitchField } from "@dextinity/ui-react-final-form";
import { styled } from "@mui/material/styles";
import { useForm, useFormState } from "react-final-form";
import { type IntlShape, useIntl } from "react-intl";

import type { EditImageFormValues } from "../../dam/FileForm/EditFile";
import type { GQLFocalPoint } from "../../graphql.generated";

type ManualFocalPoint = Exclude<GQLFocalPoint, "SMART">;

const focalPointIcons: Record<ManualFocalPoint, IconName> = {
    NORTHWEST: "focus-point-northwest",
    NORTHEAST: "focus-point-northeast",
    CENTER: "focus-point-center",
    SOUTHWEST: "focus-point-southwest",
    SOUTHEAST: "focus-point-southeast",
};

function getFocalPointLabel(intl: IntlShape, focalPoint: ManualFocalPoint) {
    switch (focalPoint) {
        case "NORTHWEST":
            return intl.formatMessage({ id: "dextinity.image.focalPoint.northwest", defaultMessage: "Top left" });
        case "NORTHEAST":
            return intl.formatMessage({ id: "dextinity.image.focalPoint.northeast", defaultMessage: "Top right" });
        case "CENTER":
            return intl.formatMessage({ id: "dextinity.image.focalPoint.center", defaultMessage: "Center" });
        case "SOUTHWEST":
            return intl.formatMessage({ id: "dextinity.image.focalPoint.southwest", defaultMessage: "Bottom left" });
        case "SOUTHEAST":
            return intl.formatMessage({ id: "dextinity.image.focalPoint.southeast", defaultMessage: "Bottom right" });
    }
}

interface ImageCropSettingsFieldsProps {
    disabled?: boolean;
}

/**
 * The crop and focus point settings of an image, built with `@dextinity/ui`, for a React Final Form form with `EditImageFormValues`. The
 * crop area itself is drawn on the image with `ImageCrop`.
 */
export function ImageCropSettingsFields({ disabled }: ImageCropSettingsFieldsProps) {
    const intl = useIntl();
    const form = useForm<EditImageFormValues>();
    const {
        values: { focalPoint },
    } = useFormState<EditImageFormValues>({ subscription: { values: true } });
    const isSmartFocalPoint = focalPoint === "SMART";

    return (
        <Root>
            <Typography variant="section" element="h3">
                {intl.formatMessage({ id: "dextinity.dam.file.cropSettings.sectionTitle", defaultMessage: "Crop/Focus settings" })}
            </Typography>
            <SwitchField<GQLFocalPoint>
                name="focalPoint"
                disabled={disabled}
                format={(value) => value === "SMART"}
                parse={(checked) => (checked ? "SMART" : "CENTER")}
                description={intl.formatMessage({
                    id: "dextinity.dam.file.focusPointInfoText",
                    defaultMessage: "The focus point marks the most important part of the image, which is always visible. Choose it wisely.",
                })}
            >
                {intl.formatMessage({ id: "dextinity.dam.file.cropSettings.smartFocusPoint.title", defaultMessage: "Smart focus point" })}
            </SwitchField>
            {!isSmartFocalPoint && (
                <>
                    <FocalPointGroup>
                        <Typography variant="label">
                            {intl.formatMessage({ id: "dextinity.blocks.image.focalPoint", defaultMessage: "Set manual focus point" })}
                        </Typography>
                        <SegmentedControlField<ManualFocalPoint, GQLFocalPoint>
                            name="focalPoint"
                            disabled={disabled}
                            overflow="wrap"
                            aria-label={intl.formatMessage({ id: "dextinity.blocks.image.focalPoint", defaultMessage: "Set manual focus point" })}
                            options={(Object.keys(focalPointIcons) as ManualFocalPoint[]).map((value) => ({
                                value,
                                icon: <Icon name={focalPointIcons[value]} />,
                                "aria-label": getFocalPointLabel(intl, value),
                            }))}
                        />
                        <Hint>
                            {intl.formatMessage({
                                id: "dextinity.blocks.image.hintSelectFocalPoint",
                                defaultMessage: "You can also select the focus point by clicking on the bullets in the image.",
                            })}
                        </Hint>
                    </FocalPointGroup>
                    <div>
                        <Button
                            variant="outlined"
                            color="secondary"
                            size="small"
                            disabled={disabled}
                            startIcon={<Icon name="reset" />}
                            onClick={() => form.change("crop", { x: 0, y: 0, width: 100, height: 100 })}
                        >
                            {intl.formatMessage({ id: "dextinity.dam.file.resetCropArea", defaultMessage: "Reset crop area" })}
                        </Button>
                    </div>
                </>
            )}
            <Hint>
                {intl.formatMessage({
                    id: "dextinity.dam.file.croppingInfoText",
                    defaultMessage:
                        "Cropping selects the maximum visible area. Depending on the aspect ratio, the image may be cropped further on the page.",
                })}
            </Hint>
        </Root>
    );
}

const Root = styled("div")`
    display: grid;
    gap: var(--dextinity-space-4);
`;

const FocalPointGroup = styled("div")`
    display: grid;
    justify-items: start;
    gap: var(--dextinity-space-2);
`;

const Hint = styled("p")`
    margin: 0;
    color: var(--dextinity-color-text-subtle);
    font-size: var(--dextinity-typography-small-size);
`;
