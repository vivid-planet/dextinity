import type { Meta, StoryObj } from "@storybook/react-vite";

import { defaultIcons } from "../../../components/icon/defaultIcons";
import { Icon } from "../../../components/icon/Icon";
import { Theme } from "../../../components/theme/Theme";
import { themeDecorator } from "../../../storybook/themeDecorator";

const meta = {
    title: "Theme/Customize icon set",
    tags: ["!dev", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
} satisfies Meta;

export default meta;

export const ReplaceSomeIcons: StoryObj = {
    render: () => (
        <Theme
            icons={{
                ...defaultIcons,
                "arrow-right": new URL("./customization/project-arrow-right.svg#icon", import.meta.url).href,
            }}
        >
            <Icon icon="arrow-right" /> <Icon icon="favorite" />
        </Theme>
    ),
};
