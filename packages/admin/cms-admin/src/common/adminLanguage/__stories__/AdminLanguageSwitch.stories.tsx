import { Box, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { useAdminLanguage } from "../AdminLanguage";
import { AdminLanguageSwitch } from "../AdminLanguageSwitch";

type Story = StoryObj<typeof AdminLanguageSwitch>;

const config: Meta<typeof AdminLanguageSwitch> = {
    component: AdminLanguageSwitch,
    title: "common/adminLanguage/AdminLanguageSwitch",
    parameters: {
        adminLanguage: { supportedLanguages: ["en", "de", "fr"] },
    },
    beforeEach: () => {
        window.localStorage.removeItem("adminLanguage");
        return () => window.localStorage.removeItem("adminLanguage");
    },
};

export default config;

function CurrentAdminLanguage() {
    const { language } = useAdminLanguage();
    return <Typography>Current admin language: {language}</Typography>;
}

/**
 * `UserHeaderItem` renders this switch when more than one language is passed to `adminLanguage.supportedLanguages`
 * of `DextinityConfigProvider`. Each language is named in itself. The choice is stored in the browser.
 */
export const Default: Story = {
    render: () => (
        <>
            <Box width={300} padding={4}>
                <AdminLanguageSwitch />
            </Box>
            <CurrentAdminLanguage />
        </>
    ),
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement);

        await userEvent.click(await canvas.findByRole("button", { name: "Deutsch" }));

        await expect(canvas.getByText("Current admin language: de")).toBeInTheDocument();
        await expect(canvas.getByRole("button", { name: "Deutsch" })).toHaveAttribute("aria-pressed", "true");
    },
};
