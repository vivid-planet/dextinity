import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent } from "storybook/test";

import { documentImage, interiorImage, landscapeImage, portraitImage } from "../../../storybook/sampleImages";
import { themeDecorator } from "../../../storybook/themeDecorator";
import { AssetThumbnail } from "../AssetThumbnail";
import assetThumbnailTokens from "../AssetThumbnail.tokens.scss?raw";
import styles from "./AssetThumbnail.stories.module.scss";

const meta = {
    component: AssetThumbnail,
    title: "Building blocks/Media & upload/AssetThumbnail",
    decorators: [themeDecorator],
    parameters: { tokens: assetThumbnailTokens },
    args: {
        type: "image",
        src: landscapeImage,
        name: "sunset-hills.jpg",
        meta: "JPG · 2.4 MB",
    },
    argTypes: {
        type: { control: "select", options: ["image", "video", "document", "folder"] },
        ratio: { control: "radio", options: ["4:3", "1:1", "original"] },
        badges: { control: "check", options: ["missingAlt"] },
        selected: { control: "boolean" },
        className: { control: false },
        slotProps: { control: false },
    },
    render: (args) => (
        <div className={styles.single}>
            <AssetThumbnail {...args} />
        </div>
    ),
} satisfies Meta<typeof AssetThumbnail>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * **Rules**
 *
 * - Crop around the focal point, never blindly around the center.
 * - Badges only for exceptions, e.g. a missing alt text.
 */
export const Default: Story = {};

/**
 * The crop follows `focalPoint`: here the sun near the right edge stays in a square crop.
 */
export const FocalPoint: Story = {
    args: { ratio: "1:1", focalPoint: { x: 0.56, y: 0.34 } },
};

export const Square: Story = {
    args: { ratio: "1:1" },
};

export const Original: Story = {
    args: { ratio: "original", src: portraitImage, name: "product.png", meta: "PNG · 840 KB" },
};

/**
 * **Rules**
 *
 * - Alt texts are kept per language; a missing one shows as a badge.
 */
export const Badges: Story = {
    args: { src: interiorImage, name: "lobby.jpg", badges: ["missingAlt"] },
    play: async ({ canvas }) => {
        await expect(canvas.getByRole("img", { name: "Alt text missing" })).toBeVisible();
    },
};

export const Document: Story = {
    args: { type: "document", src: documentImage, fileType: "PDF", name: "annual-report.pdf", meta: "PDF · 1.2 MB" },
};

export const Video: Story = {
    args: { type: "video", src: landscapeImage, duration: "0:42", name: "campaign.mp4", meta: "MP4 · 18 MB" },
};

export const Folder: Story = {
    args: { type: "folder", src: undefined, name: "Campaigns", meta: "12 items" },
};

export const Selected: Story = {
    args: { selected: true },
};

/**
 * Without a picture, the type's icon stands in.
 */
export const WithoutPreview: Story = {
    args: { type: "document", src: undefined, fileType: "DOCX", name: "contract.docx", meta: "DOCX · 48 KB" },
};

/**
 * The thumbnail is presentational; make it interactive by rendering it focusable (or as an option inside a listbox). It then lifts
 * on hover and shows the focus ring.
 */
export const Interactive: Story = {
    args: { tabIndex: 0, "aria-label": "sunset-hills.jpg" },
    play: async ({ canvas }) => {
        await userEvent.tab();
        await expect(canvas.getByLabelText("sunset-hills.jpg")).toHaveFocus();
    },
};

/**
 * All types side by side, as on the draft page.
 */
export const Overview: Story = {
    render: () => (
        <div className={styles.row}>
            <AssetThumbnail type="image" src={interiorImage} badges={["missingAlt"]} name="lobby.jpg" meta="JPG · 3.1 MB" />
            <AssetThumbnail type="image" src={portraitImage} name="product.png" meta="PNG · 840 KB" />
            <AssetThumbnail type="document" src={documentImage} fileType="PDF" name="annual-report.pdf" meta="PDF · 1.2 MB" />
            <AssetThumbnail type="folder" name="Campaigns" meta="12 items" />
        </div>
    ),
};
