import { MjmlColumn, MjmlSpacer, MjmlWrapper } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MjmlImage } from "../../components/image/MjmlImage.js";
import { MjmlSection } from "../../components/section/MjmlSection.js";
import { MjmlText } from "../../components/text/MjmlText.js";
import { registerStyles } from "../../styles/registerStyles.js";
import { createTheme } from "../../theme/createTheme.js";
import { getDefaultFromResponsiveValue } from "../../theme/responsiveValue.js";
import { css } from "../../utils/css.js";

const config: Meta = {
    title: "Layout Patterns/Asymmetric Two-Column Layout",
};

export default config;

const theme = createTheme({
    text: {
        defaultVariant: "body",
        variants: {
            heading: { fontSize: "22px", lineHeight: "28px", fontWeight: "bold" },
            body: { fontSize: "16px", lineHeight: "24px" },
        },
    },
});

const SMALL_COLUMN_WIDTH = 120;
const COLUMN_GAP = 20;

const sectionIndent = getDefaultFromResponsiveValue(theme.sizes.contentIndentation);
const sectionInnerWidth = theme.sizes.bodyWidth - 2 * sectionIndent;
const fluidColumnWidth = sectionInnerWidth - SMALL_COLUMN_WIDTH;

registerStyles(
    (theme) => css`
        ${theme.breakpoints.default.belowMediaQuery} {
            .asymmetricLayoutLeft__smallColumn {
                width: ${SMALL_COLUMN_WIDTH}px !important;
                max-width: ${SMALL_COLUMN_WIDTH}px !important;
            }

            .asymmetricLayoutLeft__fluidColumn {
                width: calc(100% - ${SMALL_COLUMN_WIDTH}px) !important;
                max-width: calc(100% - ${SMALL_COLUMN_WIDTH}px) !important;
            }
        }

        ${theme.breakpoints.mobile.belowMediaQuery} {
            .asymmetricLayoutLeft__smallColumn,
            .asymmetricLayoutLeft__fluidColumn {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
            }

            .asymmetricLayoutLeft__smallColumn {
                margin-bottom: 10px;
            }

            .asymmetricLayoutLeft__fluidColumn > table > tbody > tr > td {
                padding-left: 0 !important;
            }
        }
    `,
);

export const SmallColumnLeft: StoryObj = {
    parameters: { theme },
    render: () => (
        <>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlSpacer height={30} />
                    <MjmlText variant="heading" bottomSpacing>
                        Small column on the left
                    </MjmlText>
                    <MjmlText>
                        A fixed-width column on the left with a fluid column taking the remaining space. On mobile, columns stack vertically with the
                        small column on top.
                    </MjmlText>
                    <MjmlSpacer height={30} />
                </MjmlColumn>
            </MjmlSection>

            <MjmlSection indent disableResponsiveBehavior>
                <MjmlColumn className="asymmetricLayoutLeft__smallColumn" width={`${SMALL_COLUMN_WIDTH}px`} verticalAlign="middle">
                    <MjmlImage
                        src={`https://picsum.photos/seed/1/${SMALL_COLUMN_WIDTH}/150`}
                        alt="Placeholder"
                        align="center"
                        width={SMALL_COLUMN_WIDTH}
                    />
                </MjmlColumn>
                <MjmlColumn
                    className="asymmetricLayoutLeft__fluidColumn"
                    width={`${fluidColumnWidth}px`}
                    paddingLeft={`${COLUMN_GAP}px`}
                    verticalAlign="middle"
                >
                    <MjmlText variant="heading" bottomSpacing>
                        Fluid column
                    </MjmlText>
                    <MjmlText>
                        This column takes the remaining width after the fixed-width column. The gap between columns is created via padding on the
                        fluid column&apos;s inner edge.
                    </MjmlText>
                </MjmlColumn>
            </MjmlSection>

            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlSpacer height={30} />
                </MjmlColumn>
            </MjmlSection>
        </>
    ),
};

registerStyles(
    (theme) => css`
        ${theme.breakpoints.default.belowMediaQuery} {
            .asymmetricLayoutRight__smallColumn {
                width: ${SMALL_COLUMN_WIDTH}px !important;
                max-width: ${SMALL_COLUMN_WIDTH}px !important;
            }

            .asymmetricLayoutRight__fluidColumn {
                width: calc(100% - ${SMALL_COLUMN_WIDTH}px) !important;
                max-width: calc(100% - ${SMALL_COLUMN_WIDTH}px) !important;
            }
        }

        ${theme.breakpoints.mobile.belowMediaQuery} {
            .asymmetricLayoutRight__smallColumn,
            .asymmetricLayoutRight__fluidColumn {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
            }

            .asymmetricLayoutRight__smallColumn {
                margin-top: 10px;
            }

            .asymmetricLayoutRight__fluidColumn > table > tbody > tr > td {
                padding-right: 0 !important;
            }
        }
    `,
);

export const SmallColumnRight: StoryObj = {
    parameters: { theme },
    render: () => (
        <>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlSpacer height={30} />
                    <MjmlText variant="heading" bottomSpacing>
                        Small column on the right
                    </MjmlText>
                    <MjmlText>
                        A fluid column on the left with a fixed-width column on the right. On mobile, columns stack vertically with the fluid column
                        on top.
                    </MjmlText>
                    <MjmlSpacer height={30} />
                </MjmlColumn>
            </MjmlSection>

            <MjmlSection indent disableResponsiveBehavior>
                <MjmlColumn
                    className="asymmetricLayoutRight__fluidColumn"
                    width={`${fluidColumnWidth}px`}
                    paddingRight={`${COLUMN_GAP}px`}
                    verticalAlign="middle"
                >
                    <MjmlText variant="heading" bottomSpacing>
                        Fluid column
                    </MjmlText>
                    <MjmlText>
                        This column takes the remaining width after the fixed-width column. The gap between columns is created via padding on the
                        fluid column&apos;s inner edge.
                    </MjmlText>
                </MjmlColumn>
                <MjmlColumn className="asymmetricLayoutRight__smallColumn" width={`${SMALL_COLUMN_WIDTH}px`} verticalAlign="middle">
                    <MjmlImage
                        src={`https://picsum.photos/seed/2/${SMALL_COLUMN_WIDTH}/150`}
                        alt="Placeholder"
                        align="center"
                        width={SMALL_COLUMN_WIDTH}
                    />
                </MjmlColumn>
            </MjmlSection>

            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlSpacer height={30} />
                </MjmlColumn>
            </MjmlSection>
        </>
    ),
};

registerStyles(
    (theme) => css`
        ${theme.breakpoints.default.belowMediaQuery} {
            .asymmetricLayoutRtl__smallColumn {
                width: ${SMALL_COLUMN_WIDTH}px !important;
                max-width: ${SMALL_COLUMN_WIDTH}px !important;
            }

            .asymmetricLayoutRtl__fluidColumn {
                width: calc(100% - ${SMALL_COLUMN_WIDTH}px) !important;
                max-width: calc(100% - ${SMALL_COLUMN_WIDTH}px) !important;
            }
        }

        ${theme.breakpoints.mobile.belowMediaQuery} {
            .asymmetricLayoutRtl__smallColumn,
            .asymmetricLayoutRtl__fluidColumn {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
            }

            .asymmetricLayoutRtl__smallColumn {
                margin-bottom: 10px;
            }

            .asymmetricLayoutRtl__fluidColumn > table > tbody > tr > td {
                padding-right: 0 !important;
            }
        }
    `,
);

export const ReversedMobileStackOrder: StoryObj = {
    parameters: { theme },
    render: () => (
        <>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlSpacer height={30} />
                    <MjmlText variant="heading" bottomSpacing>
                        Small column on the right, stacks on top on mobile
                    </MjmlText>
                    <MjmlText>
                        Uses <code>direction=&quot;rtl&quot;</code> to visually place the small column on the right on desktop, while keeping it first
                        in source order so it stacks on top on mobile. The prop goes on the group that
                        <code>disableResponsiveBehavior</code> adds, because that group writes its own <code>direction</code> and would otherwise
                        cancel the value of the section. A wrapper handles the indentation separately to avoid a 1px line artifact in Outlook.
                    </MjmlText>
                    <MjmlSpacer height={30} />
                </MjmlColumn>
            </MjmlSection>

            <MjmlWrapper padding={`0 ${sectionIndent}px`} backgroundColor={theme.colors.background.content}>
                <MjmlSection disableResponsiveBehavior slotProps={{ group: { direction: "rtl" } }}>
                    <MjmlColumn className="asymmetricLayoutRtl__smallColumn" width={`${SMALL_COLUMN_WIDTH}px`} verticalAlign="middle">
                        <MjmlImage
                            src={`https://picsum.photos/seed/3/${SMALL_COLUMN_WIDTH}/150`}
                            alt="Placeholder"
                            align="center"
                            width={SMALL_COLUMN_WIDTH}
                        />
                    </MjmlColumn>
                    <MjmlColumn
                        className="asymmetricLayoutRtl__fluidColumn"
                        width={`${fluidColumnWidth}px`}
                        paddingRight={`${COLUMN_GAP}px`}
                        verticalAlign="middle"
                    >
                        <MjmlText variant="heading" bottomSpacing>
                            Fluid column
                        </MjmlText>
                        <MjmlText>
                            Source order: small column first, fluid column second. On desktop, <code>direction=&quot;rtl&quot;</code> flips the visual
                            order so the fluid column appears on the left.
                        </MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlWrapper>

            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlSpacer height={30} />
                </MjmlColumn>
            </MjmlSection>
        </>
    ),
};
