import { createPixelImage } from "@src/storybook/blockFixtures";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CookieSafeYouTubeVideoBlock } from "../CookieSafeYouTubeVideoBlock";

const meta: Meta<typeof CookieSafeYouTubeVideoBlock> = {
    title: "Blocks/Common/CookieSafeYouTubeVideoBlock",
    component: CookieSafeYouTubeVideoBlock,
    args: {
        data: { youtubeIdentifier: "M7lc1UVf-VE", showControls: true, previewImage: createPixelImage({ seed: "youtube" }) },
    },
};

export default meta;
type Story = StoryObj<typeof CookieSafeYouTubeVideoBlock>;

export const Default: Story = {};

export const WithoutConsent: Story = {
    parameters: { consentedCookies: [] },
};
