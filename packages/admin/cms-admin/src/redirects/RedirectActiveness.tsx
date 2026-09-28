import { gql, useMutation } from "@apollo/client";
import { ChevronDown, Invisible, Visible } from "@dextinity/admin-icons";
import { Chip, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { green } from "@mui/material/colors";
import { type JSX, type MouseEvent, useState } from "react";
import { FormattedMessage } from "react-intl";

import type {
    GQLRedirectActivenessFragment,
    GQLUpdateRedirectActivenessMutation,
    GQLUpdateRedirectActivenessMutationVariables,
} from "./RedirectActiveness.generated";

const updateRedirectActivenessMutation = gql`
    mutation UpdateRedirectActiveness($id: ID!, $input: RedirectUpdateActivenessInput!) {
        updateRedirectActiveness(id: $id, input: $input) {
            id
            active
            activatedAt
        }
    }
`;

export const redirectActivenessFragment = gql`
    fragment RedirectActiveness on Redirect {
        id
        active
    }
`;

interface RedirectActivenessProps {
    redirect: GQLRedirectActivenessFragment;
}

const RedirectActiveness = ({ redirect }: RedirectActivenessProps): JSX.Element => {
    const [updateRedirectActiveness] = useMutation<GQLUpdateRedirectActivenessMutation, GQLUpdateRedirectActivenessMutationVariables>(
        updateRedirectActivenessMutation,
    );
    const [anchorEl, setAnchorEl] = useState<Element | null>(null);

    const handleMenuOpen = (event: MouseEvent) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleActivenessClick = (active: boolean) => {
        updateRedirectActiveness({
            variables: {
                id: redirect.id,
                input: { active: active },
            },
            optimisticResponse: {
                updateRedirectActiveness: {
                    __typename: "Redirect",
                    id: redirect.id,
                    active: active,
                    activatedAt: active ? new Date() : null,
                },
            },
        });

        handleMenuClose();
    };

    return (
        <>
            <Chip
                icon={<ChevronDown />}
                label={
                    <FormattedMessage
                        id="dextinity.pages.redirects.redirect.activeness"
                        defaultMessage="{activeness, select, true {activated} other {deactivated} }"
                        values={{ activeness: redirect.active }}
                    />
                }
                variant="filled"
                color={redirect.active ? "success" : "default"}
                clickable
                onClick={handleMenuOpen}
            />

            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                <MenuItem onClick={() => handleActivenessClick(true)} disabled={redirect.active}>
                    <ListItemIcon>
                        <Visible style={{ color: green[500] }} />
                    </ListItemIcon>
                    <FormattedMessage id="dextinity.pages.redirects.redirect.activate" defaultMessage="Activate" />
                </MenuItem>
                <MenuItem onClick={() => handleActivenessClick(false)} disabled={!redirect.active}>
                    <ListItemIcon>
                        <Invisible />
                    </ListItemIcon>
                    <FormattedMessage id="dextinity.pages.redirects.redirect.deactivate" defaultMessage="Deactivate" />
                </MenuItem>
            </Menu>
        </>
    );
};

export default RedirectActiveness;
