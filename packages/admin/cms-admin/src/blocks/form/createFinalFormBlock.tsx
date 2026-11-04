import type { FieldRenderProps } from "react-final-form";

import type { BlockInterface } from "../types";
import { resolveNewState } from "../utils";

const createFinalFormBlock = (block: BlockInterface) => {
    return ({ input: { value, onChange } }: FieldRenderProps<unknown>) => (
        <block.AdminComponent state={value} updateState={(setStateAction) => onChange(resolveNewState({ prevState: value, setStateAction }))} />
    );
};

export { createFinalFormBlock };
