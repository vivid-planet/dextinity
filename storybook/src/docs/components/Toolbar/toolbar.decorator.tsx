import { Stack, StackPage, StackPageTitle, StackSwitch } from "@dextinity/admin";
import type { Decorator } from "@storybook/react-vite";

export function toolbarDecorator(): Decorator {
    return (Story) => {
        return (
            <Stack topLevelTitle="Automatic Title from Stack">
                <StackSwitch initialPage="automaticTitle">
                    <StackPage name="automaticTitle">
                        <Story />
                    </StackPage>
                    <StackPage name="automaticTitleDetail" title="Automatic Title from Stack - Detail">
                        <Story />
                    </StackPage>
                    <StackPage name="page-1">
                        <StackPageTitle title="page1">
                            <Story />
                        </StackPageTitle>
                    </StackPage>
                    <StackPage name="page-2">
                        <StackPageTitle title="page2">
                            <Story />
                        </StackPageTitle>
                    </StackPage>
                </StackSwitch>
            </Stack>
        );
    };
}
