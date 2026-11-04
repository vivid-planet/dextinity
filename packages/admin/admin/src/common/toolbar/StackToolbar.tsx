import type { ComponentProps } from "react";

import { useIsActiveStackSwitch } from "../../stack/useIsActiveStackSwitch";
import { Toolbar } from "./Toolbar";

export function StackToolbar(props: ComponentProps<typeof Toolbar>) {
    const isActiveStackSwitch = useIsActiveStackSwitch();

    // When inside a Stack, only the last Toolbar should be shown
    if (!isActiveStackSwitch) {
        return null;
    }

    return <Toolbar {...props} />;
}
