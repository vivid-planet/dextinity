import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Icon } from "../../icon/Icon";
import { Button } from "../Button";
import styles from "./customization.dev.module.scss";

const meta = {
    component: Button,
    title: "Building blocks/Buttons/Button",
    tags: ["development", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CustomizationViaSlotPropsClassName: Story = {
    args: {
        children: "Slot-level override",
        startIcon: <Icon name="star-fill" />,
        endIcon: <Icon name="arrow" />,
        className: styles.customRoot,
        slotProps: {
            startIcon: { className: styles.customStartIcon },
        },
    },
};

export const CustomizationViaWrapperGlobalSelectors: Story = {
    render: () => (
        <div className={styles.wrapper}>
            <Button startIcon={<Icon name="star-fill" />}>Themed via wrapper</Button>
            <Button color="secondary" endIcon={<Icon name="arrow" />}>
                Secondary in the same wrapper
            </Button>
        </div>
    ),
};
