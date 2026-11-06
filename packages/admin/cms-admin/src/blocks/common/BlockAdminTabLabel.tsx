import { Icon } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren } from "react";

import { usePromise } from "./usePromise";

interface BlockAdminTabLabelProps {
    isValid?: () => Promise<boolean> | boolean;
}

export function BlockAdminTabLabel({ children, isValid: isValidFn }: PropsWithChildren<BlockAdminTabLabelProps>) {
    const isValid = usePromise(isValidFn, { initialValue: true });

    return (
        <Root>
            {!isValid && <InvalidIcon name="warning-solid" />}
            {children}
        </Root>
    );
}

const Root = styled("span")`
    display: inline-flex;
    align-items: center;
    gap: var(--dextinity-space-1);
`;

const InvalidIcon = styled(Icon)`
    color: var(--dextinity-color-danger);
`;
