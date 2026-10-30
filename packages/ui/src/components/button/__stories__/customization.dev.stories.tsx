import type { Meta, StoryObj } from "@storybook/react-vite";

import { ArrowRightIcon } from "../../../icons/ArrowRightIcon";
import { FavoriteIcon } from "../../../icons/FavoriteIcon";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { Button } from "../Button";
import styles from "./customization.dev.module.scss";

const meta = {
    component: Button,
    title: "Components/Button/Dev/Customization",
    tags: ["!autodocs"],
    decorators: [themeDecorator],
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ViaSlotPropsClassName: Story = {
    args: {
        children: "Slot-level override",
        startIcon: <FavoriteIcon />,
        endIcon: <ArrowRightIcon />,
        className: styles.customRoot,
        slotProps: {
            startIcon: { className: styles.customStartIcon },
        },
    },
};

export const ViaWrapperGlobalSelectors: Story = {
    render: () => (
        <div className={styles.wrapper}>
            <Button startIcon={<FavoriteIcon />}>Themed via wrapper</Button>
            <Button color="secondary" endIcon={<ArrowRightIcon />}>
                Secondary in the same wrapper
            </Button>
        </div>
    ),
};
