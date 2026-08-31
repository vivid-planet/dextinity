import { MjmlColumn, MjmlSpacer } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MjmlSection } from "../../components/section/MjmlSection.js";
import { MjmlText } from "../../components/text/MjmlText.js";
import { registerStyles } from "../../styles/registerStyles.js";
import { createTheme } from "../../theme/createTheme.js";
import { getDefaultFromResponsiveValue } from "../../theme/responsiveValue.js";
import { css } from "../../utils/css.js";

const config: Meta = {
    title: "Layout Patterns/Symmetric Three-Column Layout",
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
            .symmetricThreeColumnsSection > table > tbody > tr > td > div {
                display: flex !important;
                gap: 20px !important;
            }

            .symmetricThreeColumnsSection__column {
                flex: 1 1 0% !important;
                width: auto !important;
                max-width: none !important;
                display: block !important;
            }

            .symmetricThreeColumnsSection__column > table > tbody > tr > td {
                padding-left: 0 !important;
                padding-right: 0 !important;
            }
        }

        ${theme.breakpoints.mobile.belowMediaQuery} {
            .symmetricThreeColumnsSection > table > tbody > tr > td > div {
                flex-direction: column !important;
            }

            .symmetricThreeColumnsSection__column {
                flex: none !important;
                width: 100% !important;
                max-width: 100% !important;
            }
        }
    `,
);

export const Default: StoryObj = {
    parameters: { theme },
    render: () => {
        const SymmetricThreeColumnSection = () => {
            const columnGap = 20;
            const halfColumnGap = columnGap / 2;
            const availableContentWidth = theme.sizes.bodyWidth - 2 * getDefaultFromResponsiveValue(theme.sizes.contentIndentation);
            const contentWidthPerColumn = (availableContentWidth - 2 * columnGap) / 3;

            const outerColumnWidth = `${((contentWidthPerColumn + halfColumnGap) / availableContentWidth) * 100}%`;
            const innerColumnWidth = `${((contentWidthPerColumn + columnGap) / availableContentWidth) * 100}%`;

            return (
                <MjmlSection indent disableResponsiveBehavior className="symmetricThreeColumnsSection">
                    <MjmlColumn width={outerColumnWidth} paddingRight={halfColumnGap} className="symmetricThreeColumnsSection__column">
                        <MjmlText variant="subheading" bottomSpacing>
                            First column
                        </MjmlText>
                        <MjmlText>
                            Minima ea distinctio quisquam. Illo reiciendis non officiis consectetur. Ratione perferendis distinctio sapiente est.
                        </MjmlText>
                    </MjmlColumn>
                    <MjmlColumn
                        width={innerColumnWidth}
                        paddingLeft={halfColumnGap}
                        paddingRight={halfColumnGap}
                        className="symmetricThreeColumnsSection__column"
                    >
                        <MjmlText variant="subheading" bottomSpacing>
                            Second column
                        </MjmlText>
                        <MjmlText>
                            Numquam aut voluptas numquam aspernatur. Consequatur quidem omnis dolorem natus quis soluta. Est recusandae delectus.
                        </MjmlText>
                    </MjmlColumn>
                    <MjmlColumn width={outerColumnWidth} paddingLeft={halfColumnGap} className="symmetricThreeColumnsSection__column">
                        <MjmlText variant="subheading" bottomSpacing>
                            Third column
                        </MjmlText>
                        <MjmlText>
                            Occaecati vel possimus similique reiciendis iure rerum sit architecto. Voluptas laudantium cupiditate aut repudiandae
                            iste.
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
                            Three column layout
                        </MjmlText>
                        <MjmlText>
                            Three columns require explicit width compensation. Inner columns have padding on both sides while outer columns only have
                            it on one side, so inner columns are given a wider width to keep all content areas equal. On mobile, a flex reset
                            neutralizes the desktop widths so columns can size equally and then stack.
                        </MjmlText>
                        <MjmlSpacer height={30} />
                    </MjmlColumn>
                </MjmlSection>

                <SymmetricThreeColumnSection />

                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlSpacer height={30} />
                    </MjmlColumn>
                </MjmlSection>
            </>
        );
    },
};

registerStyles(
    (theme) => css`
        ${theme.breakpoints.default.belowMediaQuery} {
            .neverStackingThreeColumnsSection > table > tbody > tr > td > div {
                display: flex !important;
                gap: 20px !important;
            }

            .neverStackingThreeColumnsSection__column {
                flex: 1 1 0% !important;
                width: auto !important;
                max-width: none !important;
                display: block !important;
            }

            .neverStackingThreeColumnsSection__column > table > tbody > tr > td {
                padding-left: 0 !important;
                padding-right: 0 !important;
            }
        }
    `,
);

export const NeverStacks: StoryObj = {
    parameters: { theme },
    render: () => {
        const NeverStackingThreeColumnSection = () => {
            const columnGap = 20;
            const halfColumnGap = columnGap / 2;
            const availableContentWidth = theme.sizes.bodyWidth - 2 * getDefaultFromResponsiveValue(theme.sizes.contentIndentation);
            const contentWidthPerColumn = (availableContentWidth - 2 * columnGap) / 3;

            const outerColumnWidth = `${((contentWidthPerColumn + halfColumnGap) / availableContentWidth) * 100}%`;
            const innerColumnWidth = `${((contentWidthPerColumn + columnGap) / availableContentWidth) * 100}%`;

            return (
                <MjmlSection indent disableResponsiveBehavior className="neverStackingThreeColumnsSection">
                    <MjmlColumn width={outerColumnWidth} paddingRight={halfColumnGap} className="neverStackingThreeColumnsSection__column">
                        <MjmlText variant="subheading" bottomSpacing>
                            Foo
                        </MjmlText>
                        <MjmlText>Lorem</MjmlText>
                    </MjmlColumn>
                    <MjmlColumn
                        width={innerColumnWidth}
                        paddingLeft={halfColumnGap}
                        paddingRight={halfColumnGap}
                        className="neverStackingThreeColumnsSection__column"
                    >
                        <MjmlText variant="subheading" bottomSpacing>
                            Bar
                        </MjmlText>
                        <MjmlText>Ipsum</MjmlText>
                    </MjmlColumn>
                    <MjmlColumn width={outerColumnWidth} paddingLeft={halfColumnGap} className="neverStackingThreeColumnsSection__column">
                        <MjmlText variant="subheading" bottomSpacing>
                            Baz
                        </MjmlText>
                        <MjmlText>Dolor</MjmlText>
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
                            Three columns that never stack
                        </MjmlText>
                        <MjmlText bottomSpacing>
                            Same width compensation and flex-reset mechanic as the default three-column layout, without the mobile stacking override
                            so columns stay side-by-side at every viewport.
                        </MjmlText>
                        <MjmlText bottomSpacing>
                            Both layouts set <code>disableResponsiveBehavior</code> to get the inline widths. It also suppresses MJML&apos;s own
                            mobile auto-stack, which is the wanted result here, so no <code>mobile</code> block replaces it.
                        </MjmlText>
                        <MjmlText>
                            Suitable for short, fixed-value rows — metrics, numeric summaries, icon strips — that remain readable even when narrow.
                        </MjmlText>
                        <MjmlSpacer height={30} />
                    </MjmlColumn>
                </MjmlSection>

                <NeverStackingThreeColumnSection />

                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlSpacer height={30} />
                    </MjmlColumn>
                </MjmlSection>
            </>
        );
    },
};
