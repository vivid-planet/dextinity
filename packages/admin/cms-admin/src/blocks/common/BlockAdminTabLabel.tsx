import { Icon } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren } from "react";
import { useIntl } from "react-intl";

import { usePromise } from "./usePromise";

interface BlockAdminTabLabelProps {
    isValid?: () => Promise<boolean> | boolean;
}

export function BlockAdminTabLabel({ children, isValid: isValidFn }: PropsWithChildren<BlockAdminTabLabelProps>) {
    const intl = useIntl();
    const isValid = usePromise(isValidFn, { initialValue: true });

    return (
        <Root>
            {!isValid && (
                <InvalidIcon
                    name="warning-triangle-fill"
                    aria-label={intl.formatMessage({ id: "dextinity.blocks.containsErrors", defaultMessage: "Contains errors" })}
                />
            )}
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
