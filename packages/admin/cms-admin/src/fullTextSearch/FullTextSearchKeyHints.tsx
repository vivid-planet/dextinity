import { Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren } from "react";
import { FormattedMessage, useIntl } from "react-intl";

import { KeyboardKey } from "./KeyboardKey";
import { shortcutKey, useShortcutModifierKey } from "./useShortcutModifierKey";

interface FullTextSearchKeyHintsProps {
    hasSearch: boolean;
}

export function FullTextSearchKeyHints({ hasSearch }: FullTextSearchKeyHintsProps) {
    const intl = useIntl();
    const modifierKey = useShortcutModifierKey();

    return (
        <Root direction="row" spacing={4} useFlexGap flexWrap="wrap" aria-hidden>
            <OpenSearchKeyHint keys={[modifierKey.label, shortcutKey]}>
                <FormattedMessage id="dextinity.fullTextSearch.keyHint.open" defaultMessage="Open search" />
            </OpenSearchKeyHint>
            <KeyHint keys={[intl.formatMessage({ id: "dextinity.fullTextSearch.escapeKey", defaultMessage: "Esc" })]}>
                {hasSearch ? (
                    <FormattedMessage id="dextinity.fullTextSearch.keyHint.clear" defaultMessage="Clear" />
                ) : (
                    <FormattedMessage id="dextinity.fullTextSearch.keyHint.close" defaultMessage="Close" />
                )}
            </KeyHint>
        </Root>
    );
}

function KeyHint({ keys, children, className }: PropsWithChildren<{ keys: string[]; className?: string }>) {
    return (
        <Stack direction="row" spacing={0.5} alignItems="center" className={className}>
            {keys.map((key) => (
                <KeyboardKey key={key}>{key}</KeyboardKey>
            ))}
            <Typography variant="body2" color="text.secondary" component="span">
                {children}
            </Typography>
        </Stack>
    );
}

// Touch devices usually have no keyboard to open the search with
const OpenSearchKeyHint = styled(KeyHint)`
    ${({ theme }) => theme.breakpoints.down("md")} {
        display: none;
    }
`;

const Root = styled(Stack)`
    flex-shrink: 0;
    padding: ${({ theme }) => theme.spacing(2, 4)};
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
    background-color: ${({ theme }) => theme.palette.grey[50]};
`;
