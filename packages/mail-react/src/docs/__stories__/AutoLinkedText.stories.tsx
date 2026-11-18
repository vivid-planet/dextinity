import type { Meta, StoryObj } from "@storybook/react-vite";

import { MjmlColumn, MjmlConditionalComment, MjmlMailRoot, MjmlSection, MjmlStyle, MjmlText } from "../../index.js";

const config: Meta = {
    title: "Docs/Client Issues/Auto-Linked Text Examples",
};

export default config;

type Story = StoryObj;

/** A plain-text mail address, URL and phone number in a gray text, with no rule in the mail head. Clients make them links with their own style. */
export const AutoLinksProblem: Story = {
    tags: ["!dev"],
    parameters: { mailRoot: false },
    render: () => (
        <MjmlMailRoot>
            <MjmlSection>
                <MjmlColumn>
                    <MjmlText color="#767677" fontSize="16px" lineHeight="24px">
                        Write to info@example.com, visit www.example.com or call +43 1 234 5678.
                    </MjmlText>
                </MjmlColumn>
            </MjmlSection>
        </MjmlMailRoot>
    ),
};

/** The same text, with a head rule that gives the links the text style, and a style block for classic Outlook that sets their color. */
export const AutoLinksFix: Story = {
    tags: ["!dev"],
    parameters: { mailRoot: false },
    render: () => (
        <MjmlMailRoot
            head={
                <>
                    <MjmlStyle>
                        {
                            ".mjmlText a, .htmlText a { color: inherit !important; font-family: inherit !important; font-size: inherit !important; line-height: inherit !important; font-weight: inherit !important; text-decoration: underline !important; }"
                        }
                    </MjmlStyle>
                    <MjmlConditionalComment condition="if mso">
                        {
                            "<style>a:link, span.MsoHyperlink { mso-style-priority: 99; color: #767677; text-decoration: underline; } a:visited, span.MsoHyperlinkFollowed { mso-style-priority: 99; color: #767677; text-decoration: underline; }</style>"
                        }
                    </MjmlConditionalComment>
                </>
            }
        >
            <MjmlSection>
                <MjmlColumn>
                    <MjmlText color="#767677" fontSize="16px" lineHeight="24px">
                        Write to info@example.com, visit www.example.com or call +43 1 234 5678.
                    </MjmlText>
                </MjmlColumn>
            </MjmlSection>
        </MjmlMailRoot>
    ),
};
