import { MjmlColumn, MjmlSpacer } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MjmlSection } from "../../components/section/MjmlSection.js";
import { MjmlText } from "../../components/text/MjmlText.js";
import { registerStyles } from "../../styles/registerStyles.js";
import { createTheme } from "../../theme/createTheme.js";
import { getDefaultFromResponsiveValue } from "../../theme/responsiveValue.js";
import { css } from "../../utils/css.js";

const config: Meta = {
    title: "Layout Patterns/Symmetric Four-Column Layout",
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
        ${theme.breakpoints.default.belowMediaQuery} {
            .symmetricFourColumnsSection > table > tbody > tr > td > div {
                display: flex !important;
                flex-direction: column !important;
            }

            .symmetricFourColumnsSection__column {
                flex: none !important;
                width: 100% !important;
                max-width: 100% !important;
                display: block !important;
                margin-bottom: 20px !important;
            }

            .symmetricFourColumnsSection__column--last {
                margin-bottom: 0 !important;
            }

            .symmetricFourColumnsSection__column > table > tbody > tr > td {
                padding-left: 0 !important;
                padding-right: 0 !important;
            }
        }
    `,
);

export const Default: StoryObj = {
    parameters: { theme },
    render: () => {
        const SymmetricFourColumnSection = () => {
            const columnGap = 20;
            const halfColumnGap = columnGap / 2;
            const availableContentWidth = theme.sizes.bodyWidth - 2 * getDefaultFromResponsiveValue(theme.sizes.contentIndentation);
            const contentWidthPerColumn = (availableContentWidth - 3 * columnGap) / 4;

            const outerColumnWidth = `${((contentWidthPerColumn + halfColumnGap) / availableContentWidth) * 100}%`;
            const innerColumnWidth = `${((contentWidthPerColumn + columnGap) / availableContentWidth) * 100}%`;

            return (
                <MjmlSection indent disableResponsiveBehavior className="symmetricFourColumnsSection">
                    <MjmlColumn width={outerColumnWidth} paddingRight={halfColumnGap} className="symmetricFourColumnsSection__column">
                        <MjmlText variant="subheading" bottomSpacing>
                            First
                        </MjmlText>
                        <MjmlText>Minima ea distinctio quisquam. Illo reiciendis non officiis consectetur.</MjmlText>
                    </MjmlColumn>
                    <MjmlColumn
                        width={innerColumnWidth}
                        paddingLeft={halfColumnGap}
                        paddingRight={halfColumnGap}
                        className="symmetricFourColumnsSection__column"
                    >
                        <MjmlText variant="subheading" bottomSpacing>
                            Second
                        </MjmlText>
                        <MjmlText>Numquam aut voluptas numquam aspernatur. Consequatur quidem omnis dolorem natus.</MjmlText>
                    </MjmlColumn>
                    <MjmlColumn
                        width={innerColumnWidth}
                        paddingLeft={halfColumnGap}
                        paddingRight={halfColumnGap}
                        className="symmetricFourColumnsSection__column"
                    >
                        <MjmlText variant="subheading" bottomSpacing>
                            Third
                        </MjmlText>
                        <MjmlText>Occaecati vel possimus similique reiciendis iure rerum sit architecto.</MjmlText>
                    </MjmlColumn>
                    <MjmlColumn
                        width={outerColumnWidth}
                        paddingLeft={halfColumnGap}
                        className="symmetricFourColumnsSection__column symmetricFourColumnsSection__column--last"
                    >
                        <MjmlText variant="subheading" bottomSpacing>
                            Fourth
                        </MjmlText>
                        <MjmlText>Voluptas laudantium cupiditate aut repudiandae iste fugiat nam quas debitis.</MjmlText>
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
                            Four column layout
                        </MjmlText>
                        <MjmlText>
                            Four columns follow the same compensation pattern as three columns. The two inner columns each get a wider width to absorb
                            their double-sided padding. On mobile, a flex reset neutralizes the desktop widths so columns can stack equally.
                        </MjmlText>
                        <MjmlSpacer height={30} />
                    </MjmlColumn>
                </MjmlSection>

                <SymmetricFourColumnSection />

                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlSpacer height={30} />
                    </MjmlColumn>
                </MjmlSection>
            </>
        );
    },
};
