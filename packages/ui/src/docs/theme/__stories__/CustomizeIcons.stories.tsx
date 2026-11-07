import type { Meta, StoryObj } from "@storybook/react-vite";

import { Icon } from "../../../components/icon/Icon";
import { Typography } from "../../../components/typography/Typography";
import { themeDecorator } from "../../../storybook/themeDecorator";

const meta = {
    title: "Theme/Customize icons",
    tags: ["!dev", "!autodocs", "!manifest"],
    decorators: [themeDecorator],
} satisfies Meta;

export default meta;

export const ReplaceIconsInPart: StoryObj = {
    render: () => (
        <>
            <style>{`
                .projectIcons {
                    --dextinity-icon-arrow-right: url("/customization/project-arrow-right.svg#icon");
                }
            `}</style>
            <Typography>
                Default: <Icon name="arrow-right" /> <Icon name="favorite" />
            </Typography>
            <Typography className="projectIcons">
                Replaced: <Icon name="arrow-right" /> <Icon name="favorite" />
            </Typography>
        </>
    ),
};
