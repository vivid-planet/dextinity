import { MjmlColumn, MjmlSpacer } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MjmlImage } from "../../components/image/MjmlImage.js";
import { MjmlSection } from "../../components/section/MjmlSection.js";
import { MjmlText } from "../../components/text/MjmlText.js";
import { MjmlWrapper } from "../../components/wrapper/MjmlWrapper.js";
import { registerStyles } from "../../styles/registerStyles.js";
import { createTheme } from "../../theme/createTheme.js";
import { getDefaultFromResponsiveValue } from "../../theme/responsiveValue.js";
import { css } from "../../utils/css.js";

const config: Meta = {
    title: "Diagnostics/Image Border Radius",
};

export default config;

const theme = createTheme({
    text: {
        defaultVariant: "body",
        variants: {
            title: { fontSize: "28px", lineHeight: "34px", fontWeight: "bold" },
            heading: { fontSize: "22px", lineHeight: "28px", fontWeight: "bold" },
            subheading: { fontSize: "16px", lineHeight: "22px", fontWeight: "bold" },
            body: { fontSize: "14px", lineHeight: "20px" },
        },
    },
});

const AVATAR_SIZE = 120;
const COLUMN_GAP = 20;

const sectionIndent = getDefaultFromResponsiveValue(theme.sizes.contentIndentation);
const sectionInnerWidth = theme.sizes.bodyWidth - 2 * sectionIndent;
const textColumnWidth = sectionInnerWidth - AVATAR_SIZE;
const halfColumnWidth = (sectionInnerWidth - COLUMN_GAP) / 2;
const halfColumnImageHeight = 172;

registerStyles(
    (theme) => css`
        ${theme.breakpoints.default.belowMediaQuery} {
            .imageBorderRadius__textColumn {
                width: calc(100% - ${AVATAR_SIZE}px) !important;
                max-width: calc(100% - ${AVATAR_SIZE}px) !important;
            }
        }

        ${theme.breakpoints.mobile.belowMediaQuery} {
            .imageBorderRadius__textColumn {
                width: 100% !important;
                max-width: 100% !important;
            }

            .imageBorderRadius__avatarColumn {
                margin-bottom: 10px;
            }

            .imageBorderRadius__textColumn > table > tbody > tr > td {
                padding-left: 0 !important;
            }

            .imageBorderRadius__splitLeft > table > tbody > tr > td {
                padding-right: 0 !important;
            }

            .imageBorderRadius__splitRight > table > tbody > tr > td {
                padding-left: 0 !important;
            }

            .imageBorderRadius__splitLeft {
                margin-bottom: 20px;
            }
        }
    `,
);

function getRetinaImageUrl(seed: string, width: number, height: number): string {
    return `https://picsum.photos/seed/${seed}/${width * 2}/${height * 2}`;
}

export const Default: StoryObj = {
    parameters: { theme },
    render: () => (
        <>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlSpacer height={30} />
                    <MjmlText variant="title">Image Border Radius</MjmlText>
                    <MjmlSpacer height={30} />
                </MjmlColumn>
            </MjmlSection>

            <MjmlSection>
                <MjmlColumn>
                    <MjmlImage
                        src={getRetinaImageUrl("border-radius-header", theme.sizes.bodyWidth, 300)}
                        alt="A landscape"
                        href="https://www.dextinity.com"
                        width={theme.sizes.bodyWidth}
                        height={300}
                        borderRadius={20}
                    />
                </MjmlColumn>
            </MjmlSection>

            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlSpacer height={30} />
                    <MjmlText variant="heading" bottomSpacing>
                        Three rounded images in one mail
                    </MjmlText>
                    <MjmlText>
                        Every image in this mail sets a different radius. Open it in the clients you support and check the corners in each one.
                    </MjmlText>
                    <MjmlSpacer height={30} />
                </MjmlColumn>
            </MjmlSection>

            <MjmlWrapper padding={`24px ${sectionIndent}px`} backgroundColor="#e0e0e0">
                <MjmlSection>
                    <MjmlColumn className="imageBorderRadius__avatarColumn" width={`${AVATAR_SIZE}px`} verticalAlign="middle">
                        <MjmlImage
                            src={getRetinaImageUrl("border-radius-avatar", AVATAR_SIZE, AVATAR_SIZE)}
                            alt="A portrait"
                            align="center"
                            width={AVATAR_SIZE}
                            height={AVATAR_SIZE}
                            borderRadius="50%"
                        />
                    </MjmlColumn>
                    <MjmlColumn
                        className="imageBorderRadius__textColumn"
                        width={`${textColumnWidth}px`}
                        paddingLeft={`${COLUMN_GAP}px`}
                        verticalAlign="middle"
                    >
                        <MjmlText variant="subheading" bottomSpacing>
                            A square image with a radius of 50 percent
                        </MjmlText>
                        <MjmlText>
                            The image is as wide as it is high, so the radius turns it into a circle. The background color of the wrapper shows
                            whether the corners are really removed.
                        </MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlWrapper>

            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlSpacer height={30} />
                </MjmlColumn>
            </MjmlSection>

            <MjmlSection indent>
                <MjmlColumn className="imageBorderRadius__splitLeft" paddingRight={COLUMN_GAP / 2} verticalAlign="middle">
                    <MjmlText variant="subheading" bottomSpacing>
                        Two columns of equal width
                    </MjmlText>
                    <MjmlText>
                        The image on the right has a radius of 12 pixels. Both columns keep their width until the mail reaches the mobile breakpoint,
                        where they stack.
                    </MjmlText>
                </MjmlColumn>
                <MjmlColumn className="imageBorderRadius__splitRight" paddingLeft={COLUMN_GAP / 2} verticalAlign="middle">
                    <MjmlImage
                        src={getRetinaImageUrl("border-radius-split", halfColumnWidth, halfColumnImageHeight)}
                        alt="A building"
                        width={halfColumnWidth}
                        height={halfColumnImageHeight}
                        borderRadius={12}
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
