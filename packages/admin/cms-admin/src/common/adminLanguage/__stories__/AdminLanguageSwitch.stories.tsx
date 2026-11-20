import { Box, Typography } from "@mui/material";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import { useAdminLanguageState } from "../AdminLanguageProvider";
import { AdminLanguageSwitch } from "../AdminLanguageSwitch";

type Story = StoryObj<typeof AdminLanguageSwitch>;

const config: Meta<typeof AdminLanguageSwitch> = {
    component: AdminLanguageSwitch,
    title: "common/adminLanguage/AdminLanguageSwitch",
    beforeEach: () => {
        window.localStorage.removeItem("adminLanguage");
        return () => window.localStorage.removeItem("adminLanguage");
    },
};

export default config;

function AdminLanguageSwitchStory({ supportedLanguages }: { supportedLanguages: readonly string[] }) {
    const adminLanguage = useAdminLanguageState({ supportedLanguages, fallbackLanguage: supportedLanguages[0] });

    return (
        <>
            <Box width={300} padding={4}>
                <AdminLanguageSwitch {...adminLanguage} />
            </Box>
            <Typography>Current admin language: {adminLanguage.language}</Typography>
        </>
    );
}

/**
 * `UserHeaderItem` renders this switch when the application wraps it in an `AdminLanguageProvider` with more than one
 * supported language. Each language is named in itself. The choice is stored in the browser.
 */
export const Default: Story = {
    render: () => <AdminLanguageSwitchStory supportedLanguages={["en", "de", "fr"]} />,
    play: async ({ canvasElement, userEvent }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Deutsch" }));

        await expect(canvas.getByText("Current admin language: de")).toBeInTheDocument();
        await expect(canvas.getByRole("button", { name: "Deutsch" })).toHaveAttribute("aria-pressed", "true");
    },
};
