const fieldAdapterOptionKeys = [
    "required",
    "requiredMessage",
    "afterSubmit",
    "allowNull",
    "beforeSubmit",
    "data",
    "defaultValue",
    "format",
    "formatOnBlur",
    "initialValue",
    "isEqual",
    "parse",
    "validate",
    "validateFields",
] as const;

type FieldAdapterOptionKey = (typeof fieldAdapterOptionKeys)[number];

export function splitFieldAdapterProps<Props extends object>(
    props: Props,
): [Pick<Props, Extract<keyof Props, FieldAdapterOptionKey>>, Omit<Props, FieldAdapterOptionKey>] {
    const options: Record<string, unknown> = {};
    const rest: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
        if ((fieldAdapterOptionKeys as readonly string[]).includes(key)) {
            options[key] = value;
        } else {
            rest[key] = value;
        }
    }
    return [options as Pick<Props, Extract<keyof Props, FieldAdapterOptionKey>>, rest as Omit<Props, FieldAdapterOptionKey>];
}
