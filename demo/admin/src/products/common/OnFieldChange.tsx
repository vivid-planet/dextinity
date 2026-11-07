import { useEffect, useRef } from "react";
import { useField } from "react-final-form";

interface OnFieldChangeProps<Value> {
    name: string;
    /** Called when the value changes after the first render, also when the form is reset. */
    onChange: (value: Value, previousValue: Value) => void;
}

/** Reacts to changes of a form field, e.g. to clear a field that depends on it. */
export function OnFieldChange<Value>({ name, onChange }: OnFieldChangeProps<Value>) {
    const {
        input: { value },
    } = useField<Value>(name, { subscription: { value: true } });
    const previousValue = useRef(value);
    const onChangeRef = useRef(onChange);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (previousValue.current !== value) {
            const previous = previousValue.current;
            previousValue.current = value;
            onChangeRef.current(value, previous);
        }
    }, [value]);

    return null;
}
