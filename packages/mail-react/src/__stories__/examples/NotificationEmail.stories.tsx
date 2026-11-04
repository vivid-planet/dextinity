import { MjmlColumn, MjmlSpacer } from "@faire/mjml-react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { MjmlMailRoot } from "../../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../../components/section/MjmlSection.js";
import { MjmlText } from "../../components/text/MjmlText.js";
import { createTheme } from "../../theme/createTheme.js";

const config: Meta = {
    title: "Examples/NotificationEmail",
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
                    body: { fontSize: "16px", lineHeight: "24px" },
                },
            },
        });

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
            </MjmlMailRoot>
        );
    },
};
