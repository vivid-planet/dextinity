import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { Menu } from "../Menu";
import menuTokens from "../Menu.tokens.scss?raw";
import { MenuRadioGroup } from "../MenuRadioGroup";
import { MenuRadioItem } from "../MenuRadioItem";
import styles from "./Menu.stories.module.scss";

function InOpenMenu({ children }: { children: ReactNode }) {
    return (
        <Menu
            open
            onOpenChange={() => {}}
            trigger={
                <Button variant="outlined" color="secondary">
                    Actions
                </Button>
            }
        >
            {children}
        </Menu>
    );
}

const meta = {
    component: MenuRadioGroup,
    title: "Building blocks/Menus & messages/MenuRadioGroup",
    decorators: [
        (Story) => (
            <InOpenMenu>
                <Story />
            </InOpenMenu>
        ),
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    parameters: { tokens: menuTokens },
    render: (args, context) => {
        const [value, setValue] = useControlledArg(args, "value", context);
        return (
            <MenuRadioGroup
                {...args}
                value={value}
                onChange={(nextValue) => {
                    setValue(nextValue);
                    args.onChange(nextValue);
                }}
            />
        );
    },
    args: {
        value: "light",
        onChange: fn(),
        children: (
            <>
                <MenuRadioItem value="light" label="Light" icon={<Icon name="sun" />} />
                <MenuRadioItem value="dark" label="Dark" icon={<Icon name="moon" />} />
                <MenuRadioItem value="high-contrast" label="High contrast" icon={<Icon name="contrast" />} />
            </>
        ),
    },
    argTypes: {
        value: {
            control: "radio",
            options: ["light", "dark", "high-contrast"],
        },
        children: { control: false },
        className: { control: false },
    },
} satisfies Meta<typeof MenuRadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Picks one option, e.g. the color scheme. The checked option shows a check mark and `aria-checked`.
 */
export const Default: Story = {
    play: async ({ args }) => {
        await userEvent.click(await screen.findByRole("menuitemradio", { name: "Dark" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("dark"));
        await expect(await screen.findByRole("menuitemradio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
    },
};

export const Disabled: Story = {
    args: { disabled: true },
};
