import { Stack, StackBreadcrumbs } from "@dextinity/admin";
import { css, styled } from "@mui/material/styles";
import type { PropsWithChildren, ReactNode } from "react";
import { FormattedMessage } from "react-intl";

interface Props {
    title?: ReactNode;
}

const BlockAdminComponentRoot = (props: PropsWithChildren<Props>) => {
    const { children, title = <FormattedMessage id="dextinity.blocks" defaultMessage="Blocks" /> } = props;

    return (
        <Stack topLevelTitle={title}>
            <StickyBreadcrumbs>
                <StackBreadcrumbs />
            </StickyBreadcrumbs>
            <ChildrenContainer>{children}</ChildrenContainer>
        </Stack>
    );
};

export { BlockAdminComponentRoot };

const StickyBreadcrumbs = styled("div")(
    ({ theme }) => css`
        position: sticky;
        top: 0;
        z-index: 15;
        padding-bottom: ${theme.spacing(4)};
        background-color: ${theme.palette.background.default};
    `,
);

const ChildrenContainer = styled("div")`
    .DextinityAdminRte-root > .DextinityAdminRteToolbar-root,
    .DextinityAdminTipTapToolbar-root {
        top: 70px;
    }
`;
