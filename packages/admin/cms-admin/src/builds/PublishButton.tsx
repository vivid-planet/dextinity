import { Button } from "@dextinity/admin";
import { styled } from "@mui/material/styles";
import { useState } from "react";
import { FormattedMessage } from "react-intl";

import { StartBuildsDialog } from "./StartBuildsDialog";

export const PublishButton = () => {
    const [isStartBuildsDialogOpen, setIsStartBuildsDialogOpen] = useState(false);

    const handlePublishClick = () => {
        setIsStartBuildsDialogOpen(true);
    };

    return (
        <Root>
            <Button onClick={handlePublishClick} disabled={process.env.NODE_ENV === "development"} fullWidth>
                <FormattedMessage id="dextinity.pages.publisher.build" defaultMessage="Start builds" />
            </Button>
            <StartBuildsDialog
                open={isStartBuildsDialogOpen}
                onClose={() => {
                    setIsStartBuildsDialogOpen(false);
                }}
            />
        </Root>
    );
};

const Root = styled("div")`
    position: relative;
    width: 100%;
    margin: ${({ theme }) => theme.spacing(1)};
`;
