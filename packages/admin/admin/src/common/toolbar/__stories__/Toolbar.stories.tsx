import { ArrowRight, Save } from "@dextinity/admin-icons";
import { Box, Chip, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { FormattedMessage } from "react-intl";

import { StackPage } from "../../../stack/Page";
import { Stack } from "../../../stack/Stack";
import { StackLink } from "../../../stack/StackLink";
import { StackSwitch } from "../../../stack/Switch";
import { Button } from "../../buttons/Button";
import { HelpDialogButton } from "../../buttons/helpDialogButton/HelpDialogButton";
import { FillSpace } from "../../FillSpace";
import { ToolbarActions } from "../actions/ToolbarActions";
import { ToolbarAutomaticTitleItem } from "../automatictitleitem/ToolbarAutomaticTitleItem";
import { ToolbarBackButton } from "../backbutton/ToolbarBackButton";
import { ToolbarItem } from "../item/ToolbarItem";
import { Toolbar } from "../Toolbar";

function StackWrapper({ children }: { children: ReactNode }) {
    return (
        <Stack topLevelTitle="Stack Root">
            <StackSwitch initialPage="root">
                <StackPage name="root">
                    {children}
                    <StackLink pageName="detail" payload="x">
                        Go to detail page
                    </StackLink>
                </StackPage>
                <StackPage name="detail" title=" Stack Detail">
                    {children}
                </StackPage>
            </StackSwitch>
        </Stack>
    );
}

function Story() {
    return (
        <Toolbar>
            <ToolbarBackButton />
            <ToolbarAutomaticTitleItem />
            <ToolbarItem>
                <Chip label="Chip text" />
            </ToolbarItem>
            <FillSpace />
            <ToolbarActions>
                <Button responsive startIcon={<ArrowRight />} variant="outlined">
                    Secondary button
                </Button>
                <Button responsive startIcon={<Save />}>
                    Primary button
                </Button>
            </ToolbarActions>
        </Toolbar>
    );
}

export default {
    title: "components/toolbar/Toolbar",
};

export const _Toolbar = () => (
    <StackWrapper>
        <Story />
    </StackWrapper>
);

export const ToolbarWithHelp = () => {
    return (
        <Toolbar
            scopeIndicator={<Chip label="Global" />}
            topBarActions={
                <HelpDialogButton
                    dialogTitle={<FormattedMessage id="story.toolbar.helpDialog.title" defaultMessage="Help" />}
                    dialogDescription={
                        <>
                            <Box sx={{ width: 150, height: 150 }} component="img" src="https://picsum.photos/id/35/300/300" />
                            <Typography>This is some helpful text inside the help dialog.</Typography>
                        </>
                    }
                />
            }
        >
            <ToolbarItem>Some title</ToolbarItem>
        </Toolbar>
    );
};
