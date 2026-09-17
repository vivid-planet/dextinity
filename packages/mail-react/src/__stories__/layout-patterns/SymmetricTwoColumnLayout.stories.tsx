import { MjmlColumn, MjmlSpacer } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MjmlSection } from "../../components/section/MjmlSection.js";
import { MjmlText } from "../../components/text/MjmlText.js";
import { registerStyles } from "../../styles/registerStyles.js";
import { createTheme } from "../../theme/createTheme.js";
import { css } from "../../utils/css.js";

const config: Meta = {
    title: "Layout Patterns/Symmetric Two-Column Layout",
};

export default config;

const theme = createTheme({
    text: {
        defaultVariant: "body",
        variants: {
            heading: { fontSize: "22px", lineHeight: "28px", fontWeight: "bold" },
            subheading: { fontSize: "16px", lineHeight: "22px", fontWeight: "bold" },
            body: { fontSize: "14px", lineHeight: "20px" },
        },
    },
});

registerStyles(
    (theme) => css`
        ${theme.breakpoints.mobile.belowMediaQuery} {
            .twoColumnsSection__leftColumn,
            .twoColumnsSection__rightColumn {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
            }

            .twoColumnsSection__leftColumn > table > tbody > tr > td {
                padding-right: 0 !important;
            }

            .twoColumnsSection__rightColumn > table > tbody > tr > td {
                padding-left: 0 !important;
            }

            .twoColumnsSection__leftColumn {
                margin-bottom: 20px;
            }
        }
    `,
);

export const Default: StoryObj = {
    parameters: { theme },
    render: () => {
        const TwoColumnsSection = () => {
            const columnGap = 20;
            const halfGap = columnGap / 2;

            return (
                <MjmlSection indent disableResponsiveBehavior className="twoColumnsSection">
                    <MjmlColumn className="twoColumnsSection__leftColumn" paddingRight={halfGap}>
                        <MjmlText variant="subheading" bottomSpacing>
                            Left column
                        </MjmlText>
                        <MjmlText>
                            Minima ea distinctio quisquam. Illo reiciendis non officiis consectetur. Ratione perferendis distinctio sapiente est.
                            Dolor consequatur qui excepturi natus.
                        </MjmlText>
                    </MjmlColumn>
                    <MjmlColumn className="twoColumnsSection__rightColumn" paddingLeft={halfGap}>
                        <MjmlText variant="subheading" bottomSpacing>
                            Right column
                        </MjmlText>
                        <MjmlText>
                            Numquam aut voluptas numquam aspernatur. Consequatur quidem omnis dolorem natus quis soluta. Est recusandae delectus sed
                            sed deserunt velit quia.
                        </MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            );
        };

        return (
            <>
                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlSpacer height={30} />
                        <MjmlText variant="heading" bottomSpacing>
                            Two column layout
                        </MjmlText>
                        <MjmlText>
                            Two columns with equal widths split evenly by MJML. Each column gets half-gap padding on its inner side to create the 20px
                            gap. No explicit width calculation is needed.
                        </MjmlText>
                        <MjmlSpacer height={30} />
                    </MjmlColumn>
                </MjmlSection>

                <TwoColumnsSection />

                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlSpacer height={30} />
                    </MjmlColumn>
                </MjmlSection>
            </>
        );
    },
};
