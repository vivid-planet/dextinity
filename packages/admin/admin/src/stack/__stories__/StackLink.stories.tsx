import { useLocation } from "react-router";

import { Button } from "../../common/buttons/Button";
import { StackPage } from "../Page";
import { Stack } from "../Stack";
import { StackLink } from "../StackLink";
import { StackSwitch } from "../Switch";

export default {
    title: "components/stack/StackLink",
};

export const _StackLink = {
    render: () => {
        const location = useLocation();

        return (
            <>
                <p>Pathname: {location.pathname}</p>
                <Stack topLevelTitle="Example Stack with StackLinks">
                    <StackSwitch>
                        <StackPage name="page1">
                            <h3>Page 1</h3>
                            <StackLink pageName="page2" payload="test">
                                link based on StackLink
                            </StackLink>
                        </StackPage>
                        <StackPage name="page2">
                            <h3>Page 2</h3>
                            <Button component={StackLink} pageName="page1" payload="test">
                                button based on StackLink
                            </Button>
                        </StackPage>
                    </StackSwitch>
                </Stack>
            </>
        );
    },

    name: "StackLink",
};
