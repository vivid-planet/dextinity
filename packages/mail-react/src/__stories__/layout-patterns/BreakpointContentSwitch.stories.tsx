import { MjmlColumn, MjmlSpacer } from "@faire/mjml-react";
import { MjmlHtml } from "@faire/mjml-react/extensions/index.js";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";

import { MjmlImage } from "../../components/image/MjmlImage.js";
import { MjmlSection } from "../../components/section/MjmlSection.js";
import { MjmlText } from "../../components/text/MjmlText.js";
import { registerStyles } from "../../styles/registerStyles.js";
import { createTheme } from "../../theme/createTheme.js";
import { getDefaultFromResponsiveValue } from "../../theme/responsiveValue.js";
import { css } from "../../utils/css.js";

const config: Meta = {
    title: "Layout Patterns/Breakpoint Content Switch",
    decorators: [
        (Story) => (
            <>
                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlSpacer height={30} />
                        <MjmlText variant="heading" bottomSpacing>
                            Breakpoint content switch
                        </MjmlText>
                        <MjmlText>
                            The header below has two layouts. Make the canvas more narrow than 600px to see the switch. Exactly one layout shows at
                            each width.
                        </MjmlText>
                        <MjmlSpacer height={30} />
                    </MjmlColumn>
                </MjmlSection>

                <Story />

                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlSpacer height={30} />
                    </MjmlColumn>
                </MjmlSection>
            </>
        ),
    ],
};

export default config;

const theme = createTheme({
    text: {
        defaultVariant: "body",
        variants: {
            heading: { fontSize: "22px", lineHeight: "28px", fontWeight: "bold" },
            body: { fontSize: "14px", lineHeight: "20px" },
        },
    },
});

const sectionIndent = getDefaultFromResponsiveValue(theme.sizes.contentIndentation);
const textColumnWidth = theme.sizes.bodyWidth - 2 * sectionIndent - 120;

const mobileLayoutHideStyles = "display:none;max-height:0;overflow:hidden;font-size:0;line-height:0;";

registerStyles(
    css`
        .mailHeader__mobileLayout,
        .mailHeader__mobileLayout * {
            mso-hide: all;
        }
    `,
    { inline: true },
);

registerStyles(
    (theme) => css`
        ${theme.breakpoints.default.belowMediaQuery} {
            .mailHeader__defaultLayout {
                display: none !important;
            }

            .mailHeader__mobileLayout {
                display: block !important;
                max-height: none !important;
                overflow: visible !important;
                font-size: inherit !important;
                line-height: inherit !important;
            }
        }
    `,
);

function MailHeaderDefaultLayout({ className }: { className?: string }): ReactNode {
    return (
        <MjmlSection indent className={className}>
            <MjmlColumn width="120px" verticalAlign="middle">
                <MjmlImage src="https://picsum.photos/seed/4/240/80" alt="Logo" align="left" width={120} />
            </MjmlColumn>
            <MjmlColumn width={`${textColumnWidth}px`} verticalAlign="middle">
                <MjmlText align="right">
                    <strong style={{ fontWeight: "bold" }}>DESKTOP</strong> — this text shows only at 600px and wider.
                </MjmlText>
            </MjmlColumn>
        </MjmlSection>
    );
}

function MailHeaderMobileLayout(): ReactNode {
    return (
        <MjmlSection indent>
            <MjmlColumn>
                <MjmlImage src="https://picsum.photos/seed/5/240/80" alt="Logo" align="center" width={120} />
                <MjmlSpacer height={16} />
                <MjmlText align="center">
                    <strong style={{ fontWeight: "bold" }}>MOBILE</strong> — this text shows only below 600px.
                </MjmlText>
            </MjmlColumn>
        </MjmlSection>
    );
}

export const Default: StoryObj = {
    parameters: { theme },
    render: () => (
        <>
            <MailHeaderDefaultLayout className="mailHeader__defaultLayout" />

            {/* The hiding styles must go on a `<div>`: a section compiles to a table, and `max-height` has no effect on a table. */}
            <MjmlHtml html={`<div class="mailHeader__mobileLayout" style="${mobileLayoutHideStyles}">`} />
            <MailHeaderMobileLayout />
            <MjmlHtml html="</div>" />
        </>
    ),
};
