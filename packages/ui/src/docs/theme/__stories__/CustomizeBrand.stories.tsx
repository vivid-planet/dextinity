import type { Meta, StoryObj } from "@storybook/react-vite";

import { Theme } from "../../../components/theme/Theme";
import { useAppliedColorScheme } from "../../../storybook/colorScheme";
import { ThemeExampleContent } from "../../../storybook/ThemeExampleContent";
import styles from "./customizeBrand.module.scss";

const meta = {
    title: "Foundations/Theme/Customize brand",
    tags: ["!dev", "!autodocs", "!manifest"],
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

function BrandInPartExample() {
    const colorScheme = useAppliedColorScheme();

    return (
        <Theme colorScheme={colorScheme}>
            <div className={styles.nested}>
                <ThemeExampleContent />
                <Theme colorScheme={colorScheme} brand="sunset">
                    <ThemeExampleContent />
                </Theme>
            </div>
        </Theme>
    );
}

export const BrandInPart: Story = {
    render: () => <BrandInPartExample />,
};
