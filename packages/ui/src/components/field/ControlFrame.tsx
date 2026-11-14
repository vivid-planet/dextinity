import { clsx } from "clsx";
import { type AriaAttributes, type CSSProperties, type ReactNode, useEffect, useId, useRef } from "react";

import { Field, type FieldControlProps, type FieldLayout, type FieldOwnerState } from "./Field";
import { useFieldContext } from "./fieldContext";

/**
 * The accessible name and description of a control. Inside a `Field`, the field's label names the control and its message describes
 * it; on its own, a control without a visible label needs `aria-label` or `aria-labelledby`.
 */
export interface ControlAriaProps {
    /** Accessible name of the control on its own, without a visible label. Inside a `Field`, the field's label names it. */
    "aria-label"?: string;
    /** The id of the element that names the control. Takes the place of the field's label inside a `Field`. */
    "aria-labelledby"?: string;
    /** The ids of elements that describe the control, added to the field's message inside a `Field`. */
    "aria-describedby"?: string;
    /**
     * Shows the value as invalid on its own. Inside a `Field`, set `state="error"` and a `validationMessage` on the field instead.
     *
     * @defaultValue `false`
     */
    "aria-invalid"?: AriaAttributes["aria-invalid"];
}

/**
 * Whether an `aria-invalid` value marks the value as invalid.
 */
export function isAriaInvalid(value: AriaAttributes["aria-invalid"]) {
    return value === true || value === "true" || value === "grammar" || value === "spelling";
}

/**
 * The props of a control that takes its label, message, and state from a surrounding `Field`. A control takes no other HTML attributes:
 * put `onFocus`, `onBlur`, or `data-*` attributes on the `Field`, whose root receives the focus events that bubble up from the control.
 * On its own, put the control in a `Field` without `label` for them.
 */
export interface PureControlProps extends ControlAriaProps {
    /**
     * Prevents interaction with the control. Ignored inside a `Field`, which takes it from its own `disabled`.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /**
     * Shows the value without letting the user change it. Ignored inside a `Field`, which takes it from its own `readOnly`.
     *
     * @defaultValue `false`
     */
    readOnly?: boolean;
    /** The control's id. Ignored inside a `Field`, which links its label and message to its own id. */
    id?: string;
    /** Added alongside the component's own classes on the control's box. Has no visible effect inside a `Field`; style the field instead. */
    className?: string;
    /** Inline styles for the control's box. Has no visible effect inside a `Field`. */
    style?: CSSProperties;
}

/**
 * Warns in development when a control sits in a `Field` with a layout it doesn't fit, e.g. a `RadioGroup` in a field without
 * `layout="group"`, which then points its `<label>` at no element and draws a box around the group.
 */
function useFieldLayoutWarning(controlName: string, fittingLayouts: ReadonlyArray<FieldLayout>) {
    const layout = useFieldContext()?.ownerState.layout;
    const fits = layout == null || fittingLayouts.includes(layout);
    const expected = fittingLayouts[0];
    useEffect(() => {
        if (process.env.NODE_ENV !== "production" && !fits) {
            console.warn(`${controlName}: put it in a <Field layout="${expected}">. The surrounding Field has layout="${layout}".`);
        }
    }, [controlName, expected, fits, layout]);
}

/**
 * Warns in development about a single `Checkbox` or `Switch` with its own text in a `Field` with a label: the text names the control,
 * so the field's label names nothing.
 */
export function useSingleChoiceFieldWarning(controlName: string, hasText: boolean) {
    const field = useFieldContext();
    const hasFieldLabel = field?.control["aria-labelledby"] != null;
    useFieldLayoutWarning(controlName, ["group"]);
    useEffect(() => {
        if (process.env.NODE_ENV !== "production" && hasText && hasFieldLabel) {
            console.warn(`${controlName}: its text names it, so the label of the surrounding Field names nothing. Leave out the Field's label.`);
        }
    }, [controlName, hasFieldLabel, hasText]);
}

/**
 * The control's `disabled`, `readOnly`, and `required`: the surrounding field's, or the control's own outside a field.
 */
export function useControlState(disabled: boolean | undefined, readOnly: boolean | undefined) {
    const field = useFieldContext();
    return {
        disabled: field != null ? field.control.disabled : disabled === true,
        readOnly: field != null ? field.control.readOnly : readOnly === true,
        required: field != null ? field.control.required : false,
    };
}

/**
 * The props a control inside its frame connects to: the field's, merged with the control's own name and description.
 */
export interface FrameControlProps extends FieldControlProps {
    "aria-label": string | undefined;
}

/**
 * The state of a control's frame.
 */
interface FrameState {
    ownerState: FieldOwnerState;
    /**
     * An id that names the control, to compose with the ids of the control's parts, e.g. `${nameId} ${valueId}`: the field's label, the
     * control's `aria-labelledby`, or a hidden copy of its `aria-label`.
     */
    nameId: string | undefined;
    /** The id of the field's hidden "Required" text, for a control whose role can't take `aria-required`, e.g. a button. */
    requiredDescriptionId: string | undefined;
}

interface ControlNameOptions extends ControlAriaProps {
    field: { control: FieldControlProps };
}

function useControlName({
    field,
    "aria-label": ariaLabel,
    "aria-labelledby": ariaLabelledBy,
    "aria-describedby": ariaDescribedBy,
}: ControlNameOptions) {
    const hiddenLabelId = `${useId()}name`;
    const labelledBy = ariaLabelledBy ?? field.control["aria-labelledby"];
    const needsHiddenLabel = labelledBy == null && ariaLabel != null && ariaLabel !== "";
    const control: FrameControlProps = {
        ...field.control,
        "aria-label": ariaLabel,
        "aria-labelledby": labelledBy,
        "aria-describedby": clsx(field.control["aria-describedby"], ariaDescribedBy) || undefined,
    };
    const nameId = needsHiddenLabel ? hiddenLabelId : labelledBy;
    const hiddenLabel = needsHiddenLabel ? (
        <span id={hiddenLabelId} hidden>
            {ariaLabel}
        </span>
    ) : null;
    return { control, nameId, hiddenLabel };
}

interface ControlFrameProps extends ControlAriaProps {
    /** The control's component name, for the warning about a field with the wrong layout. */
    controlName: string;
    /** The control's id on its own. Inside a `Field`, the field's id applies. */
    id?: string;
    disabled?: boolean;
    readOnly?: boolean;
    /** How the frame on its own holds the control, see the `layout` of `Field`. */
    layout?: "inline" | "stacked";
    /** An error the control found itself, shown in place of the field's message. */
    error?: string;
    /** A count shown at the end of the label row. */
    counter?: string;
    /** Shows the field as loading. */
    pending?: boolean;
    /** Added to the frame on its own. Inside a `Field`, the field's own `className` applies. */
    className?: string;
    /** Inline styles for the frame on its own. */
    style?: CSSProperties;
    children: (control: FrameControlProps, frame: FrameState) => ReactNode;
}

function ControlFrameContent({
    error,
    counter,
    pending,
    children,
    ...ariaProps
}: Pick<ControlFrameProps, "error" | "counter" | "pending" | "children"> & ControlAriaProps) {
    const field = useFieldContext();
    if (field == null) {
        throw new Error("ControlFrameContent must be rendered inside a Field.");
    }
    const { setControlReport } = field;
    const reported = useRef(false);

    useEffect(() => {
        const hasReport = error != null || counter != null || pending === true;
        if (!hasReport && !reported.current) {
            return;
        }
        reported.current = hasReport;
        setControlReport({ error, counter, pending });
    }, [setControlReport, error, counter, pending]);

    useEffect(
        () => () => {
            if (reported.current) {
                setControlReport({});
            }
        },
        [setControlReport],
    );

    const { control, nameId, hiddenLabel } = useControlName({ field, ...ariaProps });
    return (
        <>
            {hiddenLabel}
            {children(control, { ownerState: field.ownerState, nameId, requiredDescriptionId: field.requiredDescriptionId })}
        </>
    );
}

/**
 * The box of a box-shaped control, e.g. `Select` or `DatePicker`. Inside a `Field`, the control takes the field's box, id, label,
 * message, and state. On its own, it draws a box without label, and shows its own errors below it.
 */
export function ControlFrame({
    controlName,
    id,
    disabled = false,
    readOnly = false,
    layout = "inline",
    error,
    counter,
    pending,
    className,
    style,
    children,
    ...ariaProps
}: ControlFrameProps) {
    const field = useFieldContext();
    useFieldLayoutWarning(controlName, layout === "stacked" ? ["stacked"] : ["inline", "stacked"]);
    const content = (
        <ControlFrameContent error={error} counter={counter} pending={pending} {...ariaProps}>
            {children}
        </ControlFrameContent>
    );
    if (field != null) {
        return content;
    }
    return (
        <Field
            controlId={id}
            disabled={disabled}
            readOnly={readOnly}
            state={isAriaInvalid(ariaProps["aria-invalid"]) ? "error" : "default"}
            layout={layout}
            className={className}
            style={style}
        >
            {content}
        </Field>
    );
}

interface GroupControlOptions extends ControlAriaProps {
    /** The control's component name, for the warning about a field with the wrong layout. */
    controlName: string;
    disabled?: boolean;
    readOnly?: boolean;
    /**
     * Adds the field's hidden "Required" text to the description, for a control whose role can't take `aria-required`, e.g.
     * `role="group"`.
     *
     * @defaultValue `false`
     */
    describeRequired?: boolean;
}

/**
 * The connections of a control that draws its own frame, e.g. `RadioGroup` or `Slider`: inside a `Field` with `layout="group"`, the
 * field's id, label, message, and state, merged with the control's own name and description; on its own, the control's props.
 */
export function useGroupControl({ controlName, disabled = false, readOnly = false, describeRequired = false, ...ariaProps }: GroupControlOptions) {
    const field = useFieldContext();
    useFieldLayoutWarning(controlName, ["group"]);
    const standaloneField = {
        control: {
            id: "",
            "aria-labelledby": undefined,
            "aria-describedby": undefined,
            "aria-invalid": isAriaInvalid(ariaProps["aria-invalid"]) ? (true as const) : undefined,
            "aria-required": undefined,
            "aria-busy": undefined,
            disabled,
            readOnly,
            required: false,
        },
    };
    const requiredDescriptionId = describeRequired ? field?.requiredDescriptionId : undefined;
    const { control, nameId, hiddenLabel } = useControlName({
        field: field ?? standaloneField,
        ...ariaProps,
        "aria-describedby": clsx(requiredDescriptionId, ariaProps["aria-describedby"]) || undefined,
    });
    return { control, nameId, hiddenLabel };
}
