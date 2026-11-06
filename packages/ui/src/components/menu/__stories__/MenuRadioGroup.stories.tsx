import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import menuTokens from "../_tokens.scss?raw";
import { Menu } from "../Menu";
import { MenuRadioGroup, type MenuRadioGroupProps } from "../MenuRadioGroup";
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

function ControlledRadioGroup(props: MenuRadioGroupProps) {
    const [value, setValue] = useState(props.value);
    return (
        <MenuRadioGroup
            {...props}
            value={value}
            onChange={(nextValue) => {
                setValue(nextValue);
                props.onChange(nextValue);
            }}
        />
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
    render: (args) => <ControlledRadioGroup {...args} />,
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
