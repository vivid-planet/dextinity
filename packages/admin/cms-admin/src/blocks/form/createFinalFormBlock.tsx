import { type FieldRenderProps, useForm } from "react-final-form";

import type { BlockInterface } from "../types";
import { resolveNewState } from "../utils";

const createFinalFormBlock = (block: BlockInterface) => {
    return function FinalFormBlock({ input: { name, value, onChange } }: FieldRenderProps<unknown>) {
        const form = useForm();

        return (
            <block.AdminComponent
                state={value}
                updateState={(setStateAction) => {
                    // Several updates can happen before the next render, so `value` from this render may be outdated
                    const fieldState = form.getFieldState(name);
                    onChange(resolveNewState({ prevState: fieldState ? fieldState.value : value, setStateAction }));
                }}
            />
        );
    };
};

export { createFinalFormBlock };
