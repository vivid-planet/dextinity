import {
    getDefaultFromResponsiveValue,
    MjmlColumn,
    MjmlPixelImageBlock,
    MjmlSection,
    type PropsWithData,
    useTheme,
    withPreview,
} from "@dextinity/mail-react";
import type { MailImageBlockData } from "@src/blocks.generated";

export const MailImageBlock = withPreview<PropsWithData<MailImageBlockData>>(
    ({ data, className }) => {
        const theme = useTheme();
        const contentIndentation = getDefaultFromResponsiveValue(theme.sizes.contentIndentation);
        const renderWidth = data.fullWidth ? theme.sizes.bodyWidth : theme.sizes.bodyWidth - 2 * contentIndentation;

        return (
            <MjmlSection indent={!data.fullWidth} className={className}>
                <MjmlColumn>
                    <MjmlPixelImageBlock
                        data={data.image}
                        width={renderWidth}
                        largestPossibleRenderWidth={theme.sizes.bodyWidth}
                        aspectRatio={data.aspectRatio}
                    />
                </MjmlColumn>
            </MjmlSection>
        );
    },
    { label: "Image" },
);
