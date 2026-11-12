import isEqual from "lodash.isequal";
import { Field, useForm, useFormState } from "react-final-form";
import ReactCrop, { type ReactCropProps } from "react-image-crop";

import type { EditImageFormValues } from "../../dam/FileForm/EditFile";
import type { GQLFocalPoint } from "../../graphql.generated";
import * as sc from "./ImageCrop.sc";

const focalPoints: GQLFocalPoint[] = ["CENTER", "NORTHEAST", "NORTHWEST", "SOUTHEAST", "SOUTHWEST"];

type ImageCropProps = {
    src: string;
    disabled?: ReactCropProps["disabled"];
    style?: ReactCropProps["style"];
};

const clipValue = (value?: number) => {
    return value === undefined ? undefined : Math.max(0, Math.min(100, value));
};

export const ImageCrop = (props: ImageCropProps) => {
    const form = useForm<EditImageFormValues>();
    const {
        values: { focalPoint },
    } = useFormState<EditImageFormValues>();

    const disabled = props.disabled === true || focalPoint === "SMART";

    const handleFocalPointChange = (newFocalPoint: GQLFocalPoint) => {
        form.change("focalPoint", newFocalPoint);
    };

    return (
        <Field name="crop" isEqual={isEqual}>
            {({ input: { value, onChange } }) => (
                <sc.ImageContainer>
                    <ReactCrop
                        {...props}
                        crop={disabled ? {} : { ...value, unit: "%" }}
                        ruleOfThirds={true}
                        disabled={disabled}
                        style={{ width: "auto", height: "auto" }}
                        onChange={(newCrop, percentCrop) => {
                            // A pointer down without a drag reports an empty selection, which must not replace the existing crop area
                            if (percentCrop.width === 0 || percentCrop.height === 0) {
                                return;
                            }

                            onChange({
                                x: clipValue(percentCrop.x),
                                y: clipValue(percentCrop.y),
                                width: clipValue(percentCrop.width),
                                height: clipValue(percentCrop.height),
                            });
                        }}
                        renderSelectionAddon={() => {
                            return (
                                <>
                                    {focalPoints.map((point) => (
                                        <sc.FocalPointHandle
                                            key={point}
                                            point={point}
                                            selected={point === focalPoint}
                                            type="button"
                                            onClick={() => handleFocalPointChange(point)}
                                        />
                                    ))}
                                </>
                            );
                        }}
                    >
                        <img src={props.src} />
                    </ReactCrop>
                </sc.ImageContainer>
            )}
        </Field>
    );
};
