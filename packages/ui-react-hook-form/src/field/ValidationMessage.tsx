import type { CSSProperties, ReactNode } from "react";

// @dextinity/ui offers the validation message only inside the field frame, so controls without one get the same look from its tokens
const style: CSSProperties = {
    marginBlockStart: "var(--dextinity-space-1)",
    color: "var(--dextinity-field-message-color-error)",
    fontSize: "var(--dextinity-field-message-font-size)",
    lineHeight: "var(--dextinity-typography-small-line-height)",
};

interface ValidationMessageProps {
    id: string;
    children: ReactNode;
}

export function ValidationMessage({ id, children }: ValidationMessageProps) {
    return (
        <div id={id} style={style}>
            {children}
        </div>
    );
}
