import { MjmlColumn } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { defaultTheme } from "../../../theme/defaultTheme.js";
import { getDefaultFromResponsiveValue } from "../../../theme/responsiveValue.js";
import { MjmlSection } from "../../section/MjmlSection.js";
import { MjmlImage } from "../MjmlImage.js";

type Story = StoryObj<typeof MjmlImage>;

const sectionIndent = getDefaultFromResponsiveValue(defaultTheme.sizes.contentIndentation);
const sectionInnerWidth = defaultTheme.sizes.bodyWidth - 2 * sectionIndent;

const config: Meta<typeof MjmlImage> = {
    title: "Components/MjmlImage",
    component: MjmlImage,
    tags: ["autodocs"],
    args: {
        width: sectionInnerWidth,
        height: 268,
        alt: "Placeholder image",
    },
    argTypes: {
        src: { control: false },
        borderRadius: { control: "number" },
    },
};

export default config;

export const Default: Story = {
    render: (args) => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlImage {...args} src={`https://picsum.photos/seed/mjml-image/${args.width}/${args.height}`} />
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const FullWidth: Story = {
    args: {
        width: defaultTheme.sizes.bodyWidth,
        height: 300,
    },
    render: (args) => (
        <MjmlSection>
            <MjmlColumn>
                <MjmlImage {...args} src={`https://picsum.photos/seed/mjml-image-full-width/${args.width}/${args.height}`} />
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const RoundedCorners: Story = {
    args: {
        borderRadius: 16,
    },
    parameters: {
        docs: {
            description: {
                story: "Rounds the image corners through the `borderRadius` prop.",
            },
        },
    },
    render: (args) => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlImage {...args} src={`https://picsum.photos/seed/mjml-image-rounded/${args.width}/${args.height}`} />
            </MjmlColumn>
        </MjmlSection>
    ),
};

export const Circle: Story = {
    args: {
        borderRadius: "50%",
        width: 240,
        height: 240,
    },
    parameters: {
        docs: {
            description: {
                story: "A `borderRadius` of `50%` makes a square image round.",
            },
        },
    },
    render: (args) => (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlImage {...args} src={`https://picsum.photos/seed/mjml-image-circle/${args.width}/${args.height}`} />
            </MjmlColumn>
        </MjmlSection>
    ),
};
