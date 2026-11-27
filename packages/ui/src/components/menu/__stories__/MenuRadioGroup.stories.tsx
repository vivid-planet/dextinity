import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, screen, userEvent, waitFor } from "storybook/test";

import { useControlledArg } from "../../../storybook/storyArgs";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../../button/Button";
import { Icon } from "../../icon/Icon";
import { Menu } from "../Menu";
import { MenuRadioGroup } from "../MenuRadioGroup";
import { MenuRadioItem } from "../MenuRadioItem";
import styles from "./Menu.stories.module.scss";

const meta = {
    component: MenuRadioGroup,
    title: "Building blocks/Menus & messages/MenuRadioGroup",
    decorators: [
        themeDecorator,
        (Story) => (
            <div className={styles.stage}>
                <Story />
            </div>
        ),
    ],
    render: (args, context) => {
        const [isMenuOpen, setIsMenuOpen] = useState(true);
        const [value, setValue] = useControlledArg(args, "value", context);
        return (
            <Menu
                open={isMenuOpen}
                onOpenChange={setIsMenuOpen}
                trigger={
                    <Button variant="outlined" color="secondary">
                        Actions
                    </Button>
                }
            >
                <MenuRadioGroup
                    {...args}
                    value={value}
                    onChange={(nextValue) => {
                        setValue(nextValue);
                        args.onChange(nextValue);
                    }}
                />
            </Menu>
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
    play: async ({ args, canvas }) => {
        await userEvent.click(await screen.findByRole("menuitemradio", { name: "Dark" }));
        await waitFor(() => expect(args.onChange).toHaveBeenLastCalledWith("dark"));
        await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
        await userEvent.click(canvas.getByRole("button", { name: "Actions" }));
        await expect(await screen.findByRole("menuitemradio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
    },
};

export const Disabled: Story = {
    args: { disabled: true },
};
