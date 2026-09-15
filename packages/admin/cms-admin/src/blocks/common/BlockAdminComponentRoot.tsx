import { Stack, StackBreadcrumbs } from "@dextinity/admin";
import { styled } from "@mui/material/styles";
import type { PropsWithChildren, ReactNode } from "react";
import { FormattedMessage } from "react-intl";

interface Props {
    title?: ReactNode;
}

const BlockAdminComponentRoot = (props: PropsWithChildren<Props>) => {
    const { children, title = <FormattedMessage id="dextinity.blocks" defaultMessage="Blocks" /> } = props;

    return (
        <Stack topLevelTitle={title}>
            <StackBreadcrumbs
                sx={({ palette, spacing }) => ({
                    marginBottom: spacing(4),
                    position: "sticky",
                    zIndex: 15,
                    backgroundColor: palette.background.default,
                    top: 0,
                    // The breadcrumbs have a fixed height, so the gap below them has to be painted separately to keep the content scrolling underneath hidden.
                    "&::before": {
                        content: '""',
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        height: spacing(4),
                        backgroundColor: palette.background.default,
                    },
                })}
            />
            <ChildrenContainer>{children}</ChildrenContainer>
        </Stack>
    );
};

export { BlockAdminComponentRoot };

const ChildrenContainer = styled("div")`
    .DextinityAdminRte-root > .DextinityAdminRteToolbar-root,
    .DextinityAdminTipTapToolbar-root {
        top: 70px;
    }
`;
