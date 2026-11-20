import { Typography } from "@mui/material";
import { FormattedDate, FormattedMessage } from "react-intl";

import { Root, VersionTitle } from "./DiffHeader.sc";

export interface DiffHeaderProps {
    createdAt?: string;
    userId?: string;
    userName?: string;
    version?: number;
}

export const DiffHeader = ({ createdAt, userId, userName, version }: DiffHeaderProps) => {
    return (
        <Root>
            <VersionTitle variant="subtitle1">
                <FormattedMessage defaultMessage="Version {version}" id="actionLog.actionLogCompare.diffHeader.version" values={{ version }} />
            </VersionTitle>

            <Typography color="textSecondary" variant="caption">
                <FormattedMessage
                    defaultMessage="{user} on {date}"
                    id="actionLog.actionLogCompare.diffHeader.userAndTime"
                    values={{
                        date: (
                            <Typography color="textSecondary" variant="overline" component="span">
                                <FormattedDate dateStyle="short" timeStyle="short" value={createdAt} />
                            </Typography>
                        ),
                        user: (
                            <Typography color="textSecondary" variant="overline" component="span">
                                {userName ?? (
                                    <FormattedMessage
                                        defaultMessage="Unknown user ({id})"
                                        id="actionLog.actionLogCompare.diffHeader.unknownUser"
                                        values={{ id: userId }}
                                    />
                                )}
                            </Typography>
                        ),
                    }}
                />
            </Typography>
        </Root>
    );
};
