import { Stack, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren } from "react";
import { FormattedMessage, useIntl } from "react-intl";

interface FullTextSearchKeyHintsProps {
    hasSearch: boolean;
    hasResults: boolean;
}

export function FullTextSearchKeyHints({ hasSearch, hasResults }: FullTextSearchKeyHintsProps) {
    const intl = useIntl();

    return (
        <Root direction="row" spacing={4} useFlexGap aria-hidden>
            {hasResults && (
                <>
                    <KeyHint keys={["↑", "↓"]}>
                        <FormattedMessage id="dextinity.fullTextSearch.keyHint.move" defaultMessage="Move" />
                    </KeyHint>
                    <KeyHint keys={["↵"]}>
                        <FormattedMessage id="dextinity.fullTextSearch.keyHint.select" defaultMessage="Select" />
                    </KeyHint>
                </>
            )}
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

function KeyHint({ keys, children }: PropsWithChildren<{ keys: string[] }>) {
    return (
        <KeyHintRoot direction="row" spacing={0.5}>
            {keys.map((key) => (
                <KeyboardKey key={key}>{key}</KeyboardKey>
            ))}
            <Typography variant="body2" color="text.secondary" component="span">
                {children}
            </Typography>
        </KeyHintRoot>
    );
}

const Root = styled(Stack)`
    flex-shrink: 0;
    flex-wrap: wrap;
    padding: ${({ theme }) => theme.spacing(2, 4)};
    border-top: 1px solid ${({ theme }) => theme.palette.divider};
    background-color: ${({ theme }) => theme.palette.grey[50]};
`;

const KeyHintRoot = styled(Stack)`
    align-items: center;
`;

const KeyboardKey = styled("kbd")`
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: ${({ theme }) => theme.spacing(0, 1)};
    border: 1px solid ${({ theme }) => theme.palette.divider};
    border-bottom-width: 2px;
    border-radius: ${({ theme }) => Number(theme.shape.borderRadius) * 2}px;
    background-color: ${({ theme }) => theme.palette.background.paper};
    color: ${({ theme }) => theme.palette.text.secondary};
    font-family: inherit;
    font-size: ${({ theme }) => theme.typography.pxToRem(Number(theme.typography.caption.fontSize))};
    line-height: 1;
`;
