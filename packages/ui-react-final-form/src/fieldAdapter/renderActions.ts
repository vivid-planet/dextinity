import type { ReactNode } from "react";

import type { FieldAdapterActions } from "./fieldAdapterProps";

export function renderActions<Value>(actions: FieldAdapterActions<Value> | undefined, value: Value, setValue: (value: Value) => void): ReactNode {
    return typeof actions === "function" ? actions({ value, setValue }) : actions;
}
