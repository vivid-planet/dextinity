import { MjmlColumn, MjmlSpacer, MjmlTable } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { HtmlInlineLink } from "../../components/inlineLink/HtmlInlineLink.js";
import { MjmlMailRoot } from "../../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../components/section/MjmlSection.js";
import { HtmlText } from "../../components/text/HtmlText.js";
import { MjmlText } from "../../components/text/MjmlText.js";
import { createTheme } from "../../theme/createTheme.js";
import { ThemeProvider } from "../../theme/ThemeProvider.js";
import type { Theme } from "../../theme/themeTypes.js";

const config: Meta = {
    title: "Examples/CustomNestedFooterTheme",
    parameters: { mailRoot: false },
};

export default config;

type Story = StoryObj;

export const Default: Story = {
    render: () => {
        const theme = createTheme({
            text: {
                defaultVariant: "body",
                variants: {
                    heading: { fontSize: "22px", lineHeight: "28px", fontWeight: "bold" },
                    body: { fontSize: "14px", lineHeight: "20px" },
                    legal: { fontSize: "12px", lineHeight: "18px" },
                },
            },
        });

        const footerTheme: Theme = {
            ...theme,
            text: { ...theme.text, color: "#c8d8e9" },
            colors: { ...theme.colors, background: { ...theme.colors.background, content: "#2d4a6e" } },
        };

        return (
            <MjmlMailRoot theme={theme}>
                <MjmlSection backgroundColor="#1a1a1a" indent>
                    <MjmlColumn>
                        <MjmlSpacer height={15} />
                        <MjmlText color="#ffffff" fontWeight="bold" align="center">
                            Company Name
                        </MjmlText>
                        <MjmlSpacer height={15} />
                    </MjmlColumn>
                </MjmlSection>
                <MjmlSection indent>
                    <MjmlColumn>
                        <MjmlSpacer height={30} />
                        <MjmlText variant="heading" bottomSpacing>
                            This is a notification email
                        </MjmlText>
                        <MjmlText bottomSpacing>
                            Minima ea distinctio quisquam. Illo reiciendis non officiis consectetur. Ratione perferendis distinctio sapiente est.
                            Dolor consequatur qui excepturi natus.
                        </MjmlText>
                        <MjmlText>
                            Numquam aut voluptas numquam aspernatur. Consequatur quidem omnis dolorem natus quis soluta. Est recusandae delectus sed
                            sed deserunt velit quia. Occaecati vel possimus similique reiciendis possimus iure rerum sit architecto.
                        </MjmlText>
                        <MjmlSpacer height={30} />
                    </MjmlColumn>
                </MjmlSection>
                <ThemeProvider theme={footerTheme}>
                    <MjmlSection indent>
                        <MjmlColumn>
                            <MjmlSpacer height={20} />
                            <MjmlText align="center" bottomSpacing>
                                © 2026 Company Name – All rights reserved
                            </MjmlText>
                            <MjmlText variant="legal" align="center" bottomSpacing>
                                Legal text, corporis eos et quia. Assumenda eum maiores esse. Voluptas laudantium cupiditate aut repudiandae iste
                                fugiat nam. Quas in debitis. Sed laudantium illum aut occaecati excepturi veniam harum reprehenderit.
                            </MjmlText>
                        </MjmlColumn>
                    </MjmlSection>
                    <MjmlSection indent>
                        <MjmlColumn>
                            <MjmlTable width="auto" align="center">
                                <tbody>
                                    <tr>
                                        <HtmlText align="center">
                                            <HtmlInlineLink href="https://example.com/privacy">Privacy Policy</HtmlInlineLink>
                                        </HtmlText>
                                        <td width="20px" />
                                        <HtmlText align="center">
                                            <HtmlInlineLink href="https://example.com/imprint">Imprint</HtmlInlineLink>
                                        </HtmlText>
                                        <td width="20px" />
                                        <HtmlText align="center">
                                            <HtmlInlineLink href="https://example.com">Website</HtmlInlineLink>
                                        </HtmlText>
                                    </tr>
                                </tbody>
                            </MjmlTable>
                            <MjmlSpacer height={20} />
                        </MjmlColumn>
                    </MjmlSection>
                </ThemeProvider>
            </MjmlMailRoot>
        );
    },
};
