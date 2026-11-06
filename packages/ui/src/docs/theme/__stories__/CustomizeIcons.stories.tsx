import type { Meta, StoryObj } from "@storybook/react-vite";

import { Icon } from "../../../components/icon/Icon";
import { Typography } from "../../../components/typography/Typography";
import { themeDecorator } from "../../../storybook/themeDecorator";
import styles from "./replaceIconsInPart.module.scss";

const meta = {
    title: "Foundations/Icons/Customize icon set",
    tags: ["!dev", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
} satisfies Meta;

export default meta;

export const ReplaceIconsInPart: StoryObj = {
    render: () => (
        <>
            <Typography>
                Default: <Icon name="arrow-right" /> <Icon name="favorite" />
            </Typography>
            <Typography className={styles.projectIcons}>
                Replaced: <Icon name="arrow-right" /> <Icon name="favorite" />
            </Typography>
        </>
    ),
};
