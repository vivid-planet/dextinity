import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { InfoContainer, InfoContent, TitleContainer } from "./ActionLogHeader.sc";

export interface ActionLogHeaderProps {
    action?: ReactNode;
    dbTypes?: string[];
    id: string;
    title: ReactNode;
}

export const ActionLogHeader = ({ action, dbTypes = [], id, title }: ActionLogHeaderProps) => {
    return (
        <Box>
            <TitleContainer>
                <Typography variant="h3">{title}</Typography>
            </TitleContainer>

            <InfoContainer>
                <InfoContent>
                    <Typography variant="overline">
                        <FormattedMessage
                            defaultMessage="UUID: {uuid}"
                            id="actionLog.actionLogGrid.uuid"
                            values={{
                                uuid: (
                                    <Typography component="span" variant="caption">
                                        {id}
                                    </Typography>
                                ),
                            }}
                        />
                    </Typography>

                    {dbTypes.length > 0 && (
                        <Typography variant="overline">
                            <FormattedMessage
                                defaultMessage="DB-Type: {uuid}"
                                id="actionLog.actionLogGrid.entity"
                                values={{
                                    uuid: (
                                        <Typography component="span" variant="caption">
                                            {dbTypes.join(", ")}
                                        </Typography>
                                    ),
                                }}
                            />
                        </Typography>
                    )}
                </InfoContent>

                {action}
            </InfoContainer>
        </Box>
    );
};
