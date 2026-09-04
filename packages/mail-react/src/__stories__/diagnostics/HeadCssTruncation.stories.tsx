import { MjmlColumn } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";

import { MjmlMailRoot } from "../../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../components/section/MjmlSection.js";
import { MjmlText } from "../../components/text/MjmlText.js";
import { registerStyles } from "../../styles/registerStyles.js";
import { createTheme } from "../../theme/createTheme.js";
import { css } from "../../utils/css.js";

const config: Meta = {
    title: "Diagnostics/Head CSS Truncation",
    parameters: { mailRoot: false },
};

export default config;

type Story = StoryObj;

const probeBlocks = [
    { className: "headCssTruncationProbe--block0", label: "CSS block 0", meaning: "Short: the client reads the style tag." },
    { className: "headCssTruncationProbe--block1", label: "CSS block 1", meaning: "Short: it reads past the first CSS block." },
    { className: "headCssTruncationProbe--block2", label: "CSS block 2", meaning: "Short: it reads past the second CSS block." },
];

/**
 * Each bar needs its own CSS block. The minifier joins two neighboring blocks when they have the
 * same media query, so the queries here alternate.
 */
registerStyles(
    (theme) => css`
        ${theme.breakpoints.mobile.belowMediaQuery} {
            .headCssTruncationProbe--block0 {
                width: 25% !important;
            }
        }

        ${theme.breakpoints.default.belowMediaQuery} {
            .headCssTruncationProbe--block1 {
                width: 25% !important;
            }
        }

        ${theme.breakpoints.mobile.belowMediaQuery} {
            .headCssTruncationProbe--block2 {
                width: 25% !important;
            }
        }
    `,
);

const theme = createTheme({
    text: {
        defaultVariant: "body",
        variants: {
            heading: { fontSize: { default: "26px", mobile: "22px" }, lineHeight: { default: "32px", mobile: "28px" }, fontWeight: "bold" },
            body: { fontSize: { default: "16px", mobile: "15px" }, lineHeight: { default: "22px", mobile: "20px" }, bottomSpacing: "16px" },
            label: {
                fontSize: { default: "13px", mobile: "12px" },
                lineHeight: { default: "18px", mobile: "17px" },
                fontWeight: "bold",
                bottomSpacing: "10px",
            },
            caption: { fontSize: { default: "12px", mobile: "11px" }, lineHeight: { default: "17px", mobile: "16px" } },
        },
    },
});

function Bar({ label, meaning, className }: { label: string; meaning: string; className?: string }): ReactElement {
    return (
        <>
            <MjmlText variant="label">
                {label}
                <div className={className} style={{ width: "100%", height: "14px", backgroundColor: "#333333" }} />
            </MjmlText>
            <MjmlText variant="caption" bottomSpacing>
                {meaning}
            </MjmlText>
        </>
    );
}

export const CombinedStyleTag: Story = {
    render: () => (
        <MjmlMailRoot theme={theme}>
            <MjmlSection indent>
                <MjmlColumn>
                    <MjmlText variant="heading" bottomSpacing>
                        How much of the head CSS arrived?
                    </MjmlText>
                    <MjmlText bottomSpacing>
                        One CSS block of the head narrows one bar to 25%. A short bar means that CSS block arrived, a full-width bar means the client
                        lost it.
                    </MjmlText>
                    <MjmlText bottomSpacing>
                        The CSS blocks sit in one style tag in this order, so the last short bar is where the client stopped.
                    </MjmlText>
                    <Bar label="Reference, no rule" meaning="No rule narrows this bar, so it stays full width everywhere." />
                    {probeBlocks.map(({ className, label, meaning }) => (
                        <Bar key={className} label={label} meaning={meaning} className={className} />
                    ))}
                    <MjmlText variant="caption">
                        The CSS blocks apply below {theme.breakpoints.mobile.value}px, the mobile breakpoint of this mail, so read the bars on a phone
                        or in a narrower window.
                    </MjmlText>
                </MjmlColumn>
            </MjmlSection>
        </MjmlMailRoot>
    ),
};
