import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor } from "storybook/test";

import { BrandHueDemo, OklchPlayground } from "../../../storybook/docs/foundations/OklchDemos";

const meta = {
    title: "Foundations/OKLCH color space",
    tags: ["!dev", "!autodocs", "!manifest"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
    render: () => <OklchPlayground />,
    play: async ({ canvas, step }) => {
        await step("starts inside sRGB", async () => {
            await expect(canvas.getByText("oklch(0.62 0.190 275)")).toBeVisible();
            await expect(canvas.getByText("Fits sRGB")).toBeVisible();
        });

        await step("moves chroma with the keyboard and warns outside sRGB", async () => {
            const chroma = canvas.getByRole("slider", { name: "C · Chroma" });
            chroma.focus();
            await userEvent.keyboard("{End}");
            await expect(chroma).toHaveAttribute("aria-valuenow", "0.37");
            await expect(canvas.getByText("Too colorful for sRGB – gets clipped")).toBeVisible();
        });

        await step("ends in white without chroma and at full lightness", async () => {
            canvas.getByRole("slider", { name: "C · Chroma" }).focus();
            await userEvent.keyboard("{Home}");
            canvas.getByRole("slider", { name: "L · Lightness" }).focus();
            await userEvent.keyboard("{End}");
            await expect(canvas.getByText("#FFFFFF")).toBeVisible();
            await expect(canvas.getByText("1.00 : 1 · too low")).toBeVisible();
        });

        await step("loads a token of the theme", async () => {
            await userEvent.click(canvas.getByRole("button", { name: "Accent" }));
            await expect(canvas.getByText("oklch(0.52 0.255 275)")).toBeVisible();
            await expect(canvas.getByRole("slider", { name: "H · Hue" })).toHaveAttribute("aria-valuenow", "275");
        });
    },
};

export const BrandHue: Story = {
    render: () => <BrandHueDemo />,
    play: async ({ canvas, step }) => {
        const hue = await canvas.findByRole("slider", { name: "Primary hue" });
        const reset = canvas.getByRole("button", { name: "Reset to the brand" });

        await step("starts at the brand's hue", async () => {
            await waitFor(() => expect(hue).toHaveAttribute("aria-valuenow", "275"));
            await expect(reset).toBeDisabled();
            await expect(canvas.getByText("Text on accent")).toBeVisible();
        });

        await step("moves the hue with the keyboard", async () => {
            hue.focus();
            await userEvent.keyboard("{ArrowRight}");
            await expect(hue).toHaveAttribute("aria-valuenow", "276");
            await expect(canvas.getByText(/--dextinity-brand-primary-hue: 276;/)).toBeVisible();
        });

        await step("resets to the brand", async () => {
            await userEvent.click(reset);
            await expect(hue).toHaveAttribute("aria-valuenow", "275");
        });
    },
};
