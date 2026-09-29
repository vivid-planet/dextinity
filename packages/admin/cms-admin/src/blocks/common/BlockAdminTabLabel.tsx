import { Warning } from "@dextinity/admin-icons";
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
            {!isValid && <Warning color="error" />}
            {children}
        </Root>
    );
}

const Root = styled("span")``;
