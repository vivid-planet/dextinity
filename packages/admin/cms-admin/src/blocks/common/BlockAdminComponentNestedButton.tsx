import { Icon } from "@dextinity/ui";
import { styled } from "@mui/material/styles";
import type { MouseEventHandler, ReactNode } from "react";
import { useIntl } from "react-intl";

import { BlockAdminComponentPaper } from "./BlockAdminComponentPaper";
import { usePromise } from "./usePromise";

interface Props {
    displayName: ReactNode;
    preview: ReactNode;
    count?: number;
    onClick?: MouseEventHandler<HTMLElement>;
    isValid?: () => Promise<boolean> | boolean;
}

export const BlockAdminComponentNestedButton = ({ displayName, preview, count, onClick, isValid: isValidFn }: Props) => {
    const intl = useIntl();
    const isValid = usePromise(isValidFn, { initialValue: true });

    return (
        <BlockAdminComponentPaper disablePadding>
            <Row type="button" onClick={onClick}>
                <Text>
                    <Title>
                        {!isValid && (
                            <InvalidIcon
                                name="warning-solid"
                                aria-label={intl.formatMessage({ id: "dextinity.blocks.containsErrors", defaultMessage: "Contains errors" })}
                            />
                        )}
                        <TitleText>
                            {displayName}
                            {count !== undefined && ` (${count})`}
                        </TitleText>
                    </Title>
                    <Description>{preview}</Description>
                </Text>
                <Arrow name="chevron-right" />
            </Row>
        </BlockAdminComponentPaper>
    );
};

const Row = styled("button")`
    display: flex;
    align-items: center;
    gap: var(--dextinity-space-3);
    box-sizing: border-box;
    inline-size: 100%;
    padding: var(--dextinity-space-3) var(--dextinity-space-4);
    border: 0;
    border-radius: var(--dextinity-block-radius);
    background: transparent;
    color: var(--dextinity-color-text);
    font-family: var(--dextinity-font-family-text);
    text-align: start;
    cursor: pointer;
    transition: background-color var(--dextinity-motion-duration-short);

    &:hover {
        background: var(--dextinity-color-surface-sunken);
    }

    &:focus-visible {
        outline: 2px solid var(--dextinity-color-focus);
        outline-offset: -2px;
    }
`;

const Text = styled("span")`
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-inline-size: 0;
`;

const Title = styled("span")`
    display: flex;
    align-items: center;
    gap: var(--dextinity-space-1);
    font-size: var(--dextinity-typography-body-size);
    font-weight: var(--dextinity-typography-section-font-weight);
`;

const TitleText = styled("span")`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const Description = styled("span")`
    overflow: hidden;
    color: var(--dextinity-color-text-subtle);
    font-size: var(--dextinity-typography-small-size);
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const InvalidIcon = styled(Icon)`
    flex: none;
    color: var(--dextinity-color-danger);
`;

const Arrow = styled(Icon)`
    flex: none;
    color: var(--dextinity-color-text-subtle);
`;
