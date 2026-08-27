import { ArrowRight, Favorite } from "@dextinity/admin-icons";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../Button";
import styles from "./customization.dev.module.scss";

const meta = {
    component: Button,
    title: "Future UI/Button/Dev/Customization",
    tags: ["!autodocs"],
    decorators: [themeDecorator],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ViaSlotPropsClassName: Story = {
    args: {
        children: "Slot-level override",
        startIcon: <Favorite />,
        endIcon: <ArrowRight />,
        className: styles.customRoot,
        slotProps: {
            startIcon: { className: styles.customStartIcon },
        },
    },
};

export const ViaWrapperGlobalSelectors: Story = {
    render: () => (
        <div className={styles.wrapper}>
            <Button startIcon={<Favorite />}>Themed via wrapper</Button>
            <Button variant="secondary" endIcon={<ArrowRight />}>
                Secondary in the same wrapper
            </Button>
        </div>
    ),
};
