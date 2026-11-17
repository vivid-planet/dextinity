import { type CSSProperties, useEffect, useRef, useState } from "react";

import { MjmlButton } from "../../components/button/MjmlButton.js";
import { MjmlDivider } from "../../components/divider/MjmlDivider.js";
import { MjmlImage } from "../../components/image/MjmlImage.js";
import { MjmlMailRoot } from "../../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../components/section/MjmlSection.js";
import { MjmlText } from "../../components/text/MjmlText.js";
import { MjmlColumn } from "../../index.js";
import { registerStyles } from "../../styles/registerStyles.js";
import { css } from "../../utils/css.js";
import { MailPreview } from "./MailPreview.js";
import { showcaseColors, showcaseTheme } from "./showcaseTheme.js";

const cardColumnGap = 20;

registerStyles(
    (theme) => css`
        ${theme.breakpoints.mobile.belowMediaQuery} {
            .cardsSection__column {
                display: block !important;
                width: 100% !important;
                max-width: 100% !important;
            }

            .cardsSection__column > table > tbody > tr > td {
                padding-left: 0 !important;
                padding-right: 0 !important;
            }

            .cardsSection__column--first {
                margin-bottom: 28px !important;
            }
        }
    `,
);

const cards = [
    {
        title: "Responsive layouts",
        text: "Columns stack on mobile and stay side by side in Outlook.",
        imageSeed: "mail-react-showcase-layouts",
    },
    {
        title: "One theme",
        text: "Text, buttons, and dividers take their look from one theme.",
        imageSeed: "mail-react-showcase-theme",
    },
];

const logoSize = 32;

function SampleMail() {
    return (
        <MjmlMailRoot theme={showcaseTheme}>
            <MjmlSection indent backgroundColor={showcaseColors.header} paddingTop={20} paddingBottom={20}>
                <MjmlColumn>
                    <MjmlText variant="brand" color={showcaseColors.onHeader}>
                        <img
                            src="dextinity-logo-on-15133d.png"
                            width={logoSize}
                            height={logoSize}
                            alt=""
                            style={{ display: "inline-block", marginRight: 10, border: 0, verticalAlign: "middle" }}
                        />
                        <span style={{ verticalAlign: "middle" }}>Dextinity</span>
                    </MjmlText>
                </MjmlColumn>
            </MjmlSection>

            <MjmlSection>
                <MjmlColumn>
                    <MjmlImage src="https://picsum.photos/seed/mail-react-showcase-hero/1200/560" width={600} height={280} alt="" />
                </MjmlColumn>
            </MjmlSection>

            <MjmlSection indent paddingTop={36} paddingBottom={36}>
                <MjmlColumn>
                    <MjmlText variant="eyebrow" bottomSpacing>
                        @dextinity/mail-react
                    </MjmlText>
                    <MjmlText variant="heading" bottomSpacing>
                        Build emails the way you build your site
                    </MjmlText>
                    <MjmlText bottomSpacing>
                        Write React components, set your brand once in a theme, and get HTML that works in Outlook, Gmail, and Apple Mail.
                    </MjmlText>
                    <MjmlButton variant="primary" align="left" href="https://example.com">
                        Get started
                    </MjmlButton>
                </MjmlColumn>
            </MjmlSection>

            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlDivider />
                </MjmlColumn>
            </MjmlSection>

            <MjmlSection indent paddingTop={36} paddingBottom={36} disableResponsiveBehavior className="cardsSection">
                {cards.map(({ title, text, imageSeed }, index) => {
                    const isFirst = index === 0;
                    return (
                        <MjmlColumn
                            key={title}
                            className={isFirst ? "cardsSection__column cardsSection__column--first" : "cardsSection__column"}
                            paddingRight={isFirst ? cardColumnGap / 2 : 0}
                            paddingLeft={isFirst ? 0 : cardColumnGap / 2}
                        >
                            <MjmlImage
                                src={`https://picsum.photos/seed/${imageSeed}/700/460`}
                                width={250}
                                height={164}
                                fluidOnMobile
                                borderRadius="12px"
                                alt=""
                                paddingBottom={16}
                            />
                            <MjmlText variant="subheading" bottomSpacing>
                                {title}
                            </MjmlText>
                            <MjmlText variant="caption" bottomSpacing>
                                {text}
                            </MjmlText>
                            <MjmlButton variant="secondary" align="left" href="https://example.com">
                                Learn more
                            </MjmlButton>
                        </MjmlColumn>
                    );
                })}
            </MjmlSection>

            <MjmlSection indent backgroundColor={showcaseColors.accentSurface} paddingTop={32} paddingBottom={32}>
                <MjmlColumn>
                    <MjmlText variant="subheading" align="center" bottomSpacing>
                        Preview every mail in Storybook
                    </MjmlText>
                    <MjmlText variant="caption" align="center" bottomSpacing>
                        Check each mail at mobile and desktop width, see the MJML warnings, and copy the HTML for a test send.
                    </MjmlText>
                    <MjmlButton variant="accent" align="center" href="https://example.com" paddingTop={8}>
                        Open the docs
                    </MjmlButton>
                </MjmlColumn>
            </MjmlSection>

            <MjmlSection indent backgroundColor={showcaseColors.body} paddingTop={28} paddingBottom={28}>
                <MjmlColumn>
                    <MjmlText variant="footer" align="center">
                        <strong>Vivid Planet Software GmbH</strong>
                        <br />
                        Hopfgartenstraße 10 · 5302 Henndorf am Wallersee · Austria
                        <br />
                        You get this mail because you subscribed to our newsletter.
                    </MjmlText>
                </MjmlColumn>
            </MjmlSection>
        </MjmlMailRoot>
    );
}

const maxPreviewScale = 0.72;
const desktopViewportWidth = 600;
const mobileViewportWidth = 375;
const previewGapAtFullSize = 44;
const previewRowWidthAtFullSize = desktopViewportWidth + previewGapAtFullSize + mobileViewportWidth;

function useScaleToFitPreviewRow() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(maxPreviewScale);

    useEffect(() => {
        const container = containerRef.current;
        if (container === null) {
            return;
        }
        const resizeObserver = new ResizeObserver(([entry]) => {
            setScale(Math.min(maxPreviewScale, entry.contentRect.width / previewRowWidthAtFullSize));
        });
        resizeObserver.observe(container);
        return () => resizeObserver.disconnect();
    }, []);

    return { containerRef, scale };
}

const narrowScreenMediaQuery = "(max-width: 599px)";

function useIsNarrowScreen() {
    const [isNarrowScreen, setIsNarrowScreen] = useState(() => window.matchMedia(narrowScreenMediaQuery).matches);

    useEffect(() => {
        const mediaQueryList = window.matchMedia(narrowScreenMediaQuery);
        const updateIsNarrowScreen = () => setIsNarrowScreen(mediaQueryList.matches);
        mediaQueryList.addEventListener("change", updateIsNarrowScreen);
        return () => mediaQueryList.removeEventListener("change", updateIsNarrowScreen);
    }, []);

    return isNarrowScreen;
}

const frameStyle: CSSProperties = {
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 12px 40px rgba(28, 26, 58, 0.18)",
};

const labelStyle: CSSProperties = {
    margin: "0 0 12px",
    fontFamily: "Nunito Sans, -apple-system, sans-serif",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#6b6b80",
};

export function SampleMailShowcase() {
    const { containerRef, scale } = useScaleToFitPreviewRow();
    const isNarrowScreen = useIsNarrowScreen();

    return (
        <div
            ref={containerRef}
            style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                gap: previewGapAtFullSize * scale,
                padding: "clamp(12px, 4%, 32px)",
                marginBlock: 32,
                marginInline: isNarrowScreen ? "calc(50% - 50vw)" : undefined,
                borderRadius: isNarrowScreen ? 0 : 24,
                background: "linear-gradient(135deg, #ECEBFE 0%, #FFE9DD 100%)",
            }}
        >
            <div>
                <p style={labelStyle}>Desktop</p>
                <MailPreview
                    mail={<SampleMail />}
                    viewportWidth={desktopViewportWidth}
                    scale={scale}
                    title="Sample mail on desktop"
                    style={frameStyle}
                />
            </div>
            <div>
                <p style={labelStyle}>Mobile</p>
                <MailPreview
                    mail={<SampleMail />}
                    viewportWidth={mobileViewportWidth}
                    scale={scale}
                    title="Sample mail on mobile"
                    style={frameStyle}
                />
            </div>
        </div>
    );
}
