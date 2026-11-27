import { type Theme, Typography, useTheme } from "@mui/material";
import type { FunctionComponent } from "react";
import { FormattedMessage } from "react-intl";

import { AvatarStyled, Root } from "./UserCell.sc";

type UserCellProps = {
    id: string;
    name?: string;
};

const initialsForName = (name: string) => {
    const splitName = name.split(" ");
    if (splitName.length > 1) {
        return `${splitName[0].substring(0, 1).toUpperCase()}${splitName[1].substring(0, 1).toUpperCase()}`;
    }
    const dashSplitNames = name.split("-");
    if (dashSplitNames.length > 1) {
        return `${dashSplitNames[0].substring(0, 1).toUpperCase()}${dashSplitNames[1].substring(0, 1).toUpperCase()}`;
    }
    return name.substring(0, 2);
};

const stringToColor = (string: string) => {
    let hash = 0;
    let i;

    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
};

const resolveBackgroundColor = (name: string | undefined, theme: Theme) => {
    if (name) {
        return stringToColor(name);
    }
    return theme.palette.grey[500];
};

export const UserCell: FunctionComponent<UserCellProps> = ({ id, name }) => {
    const theme = useTheme();

    return (
        <Root>
            <AvatarStyled backgroundColor={resolveBackgroundColor(name, theme)}>{name ? initialsForName(name) : "?"}</AvatarStyled>
            <Typography>
                {name ?? <FormattedMessage defaultMessage="Unknown user ({id})" id="actionLog.userCell.unknownUser" values={{ id }} />}
            </Typography>
        </Root>
    );
};
