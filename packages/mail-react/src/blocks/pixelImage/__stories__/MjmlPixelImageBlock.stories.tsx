import { MjmlColumn } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MjmlMailRoot } from "../../../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../../components/section/MjmlSection.js";
import { MjmlPixelImageBlock } from "../MjmlPixelImageBlock.js";
import { exampleBlockData } from "./exampleBlockData.js";

type Story = StoryObj<typeof MjmlPixelImageBlock>;

const config: Meta<typeof MjmlPixelImageBlock> = {
    title: "Blocks/MjmlPixelImageBlock",
    component: MjmlPixelImageBlock,
    tags: ["autodocs"],
    parameters: {
        mailRoot: false,
        docs: {
            description: {
                component:
                    "Renders a pixel-image from the DAM as `MjmlImage`. Must be placed within an `MjmlColumn`.\n\n_Note: this story may fail to load the actual image when the API fixtures don't include the referenced DAM file._",
            },
        },
    },
    argTypes: {
        data: { control: false },
        aspectRatio: {
            control: "select",
            options: ["inherit", "16x9", "4x3", "3x2", "3x1", "2x1", "1x1", "1x2", "1x3", "2x3", "3x4", "9x16"],
        },
    },
    args: {
        data: exampleBlockData,
        width: 600,
    },
};

export default config;

export const Default: Story = {
    render: (args) => (
        <MjmlMailRoot
            config={{
                pixelImageBlock: {
                    validSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3200, 3840],
                    baseUrl: "",
                },
            }}
        >
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlPixelImageBlock {...args} />
                </MjmlColumn>
            </MjmlSection>
        </MjmlMailRoot>
    ),
};

export const AspectRatioOverride: Story = {
    parameters: {
        docs: {
            description: {
                story: "Renders the same DAM image at its native aspect ratio and overridden to `16x9`, demonstrating how the `aspectRatio` prop reframes the rendered image without changing the source DAM record.",
            },
        },
    },
    render: (args) => (
        <MjmlMailRoot
            config={{
                pixelImageBlock: {
                    validSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3200, 3840],
                    baseUrl: "",
                },
            }}
        >
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlPixelImageBlock {...args} />
                    <MjmlPixelImageBlock {...args} aspectRatio="16x9" />
                </MjmlColumn>
            </MjmlSection>
        </MjmlMailRoot>
    ),
};
