import { DextinityIcon } from "@dextinity/admin-icons";
import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { DextinityConfigProvider, useDextinityConfig } from "../../../../config/DextinityConfigContext";
import { AboutModal } from "../AboutModal";

type Story = StoryObj<typeof AboutModal>;

const config: Meta<typeof AboutModal> = {
    component: AboutModal,
    title: "common/header/about/AboutModal",
    args: {
        open: true,
    },
    parameters: {
        docs: {
            // The modal overlays the whole page, so the docs page — which stacks all stories — can't be read.
            disable: true,
        },
    },
};

export default config;

/** Build information is optional, so the build number and date are omitted here. */
export const Default: Story = {};

/** Re-provides the Storybook config with `buildInformation` set, as an application in production would. */
const withBuildInformation: Decorator = (Story) => {
    const dextinityConfig = useDextinityConfig();

    return (
        <DextinityConfigProvider {...dextinityConfig} buildInformation={{ number: "1234", commitHash: "a2213c8", date: "2026-07-30T12:00:00.000Z" }}>
            <Story />
        </DextinityConfigProvider>
    );
};

export const WithBuildInformation: Story = {
    decorators: [withBuildInformation],
};

/** Applications can replace the logo entirely via the `logo` prop. */
export const CustomLogo: Story = {
    args: {
        logo: <DextinityIcon sx={{ fontSize: 100 }} />,
    },
};
