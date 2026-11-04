import { Typography } from "@mui/material";

import { Button } from "../../common/buttons/Button";
import { StackBreadcrumbs } from "../breadcrumbs/StackBreadcrumbs";
import { StackPage } from "../Page";
import { Stack } from "../Stack";
import { StackPageTitle } from "../StackPageTitle";
import { useStackSwitch } from "../Switch";

export default {
    title: "components/stack/StackReactNodeTitle",
};

export const StackWithReactReactNodeTitle = {
    render: () => {
        const [StackSwitch, api] = useStackSwitch();

        return (
            <Stack topLevelTitle={<Typography color="primary">Page 1</Typography>}>
                <StackBreadcrumbs />
                <StackSwitch initialPage="page1">
                    <StackPage name="page1">
                        <Typography variant="h1">Page 1</Typography>
                        <Button onClick={() => api.activatePage("page2", "foo")}>To page 2</Button>
                    </StackPage>
                    <StackPage name="page2">
                        <StackPageTitle title={<Typography color="secondary">Page 2</Typography>}>
                            <Typography variant="h2">Page 2</Typography>
                        </StackPageTitle>
                    </StackPage>
                </StackSwitch>
            </Stack>
        );
    },

    name: "Stack with ReactNode title",
};
