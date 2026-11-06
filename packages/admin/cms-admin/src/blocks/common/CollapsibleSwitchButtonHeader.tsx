import { Switch } from "@dextinity/ui";
import type { ReactNode } from "react";

import { useCollapsible } from "./Collapsible";

interface CollapsibleSwitchButtonHeaderProps {
    checked: boolean;
    title?: ReactNode;
}

export const CollapsibleSwitchButtonHeader = ({ checked, title }: CollapsibleSwitchButtonHeaderProps) => {
    const collapsible = useCollapsible();

    return (
        <Switch checked={checked} onChange={() => collapsible?.onToggle()}>
            {title}
        </Switch>
    );
};
