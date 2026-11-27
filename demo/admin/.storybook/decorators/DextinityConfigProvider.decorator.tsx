import { DextinityConfigProvider } from "@dextinity/cms-admin";
import type { Decorator } from "@storybook/react-vite";

export const DextinityConfigProviderDecorator: Decorator = (Story) => (
    <DextinityConfigProvider
        graphQLApiUrl="/graphql"
        apiUrl=""
        adminUrl=""
        dam={{
            scopeParts: ["domain"],
            uploadsMaxFileSize: 500,
            allowedImageAspectRatios: ["16x9", "4x3", "3x2", "3x1", "2x1", "1x1", "1x2", "1x3", "2x3", "3x4", "9x16"],
            maxSrcResolution: 70,
        }}
    >
        <Story />
    </DextinityConfigProvider>
);
