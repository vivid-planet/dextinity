import type { Meta, StoryObj } from "@storybook/react-vite";

import { HtmlImage, MjmlColumn, MjmlRaw, MjmlSection } from "../../index.js";

const config: Meta = {
    title: "Docs/Dark Mode Examples",
};

export default config;

type Story = StoryObj;

/** Gmail on Android inverts the left logo and the "D" of the right logo. Gmail on iOS makes the background of the right logo light. */
export const SmallLogoProblem: Story = {
    tags: ["!dev"],
    render: () => (
        <MjmlSection paddingTop={0} paddingBottom={0}>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td
                            style={{
                                padding: "24px",
                                backgroundColor: "#ffffff",
                                backgroundImage: "url(/dark-mode/ffffff-100x100.png)",
                            }}
                        >
                            <table role="presentation" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "separate" }}>
                                <tbody>
                                    <tr>
                                        <td width={40} style={{ fontSize: 0, lineHeight: "1px" }}>
                                            <HtmlImage src="/dark-mode/logo-filled-40.png" width={40} height={40} alt="Dextinity" />
                                        </td>
                                        <td width={24} />
                                        <td width={40} style={{ fontSize: 0, lineHeight: "1px", backgroundColor: "#0e0c2b", borderRadius: "13px" }}>
                                            <HtmlImage src="/dark-mode/logo-mark-40.png" width={40} height={40} alt="Dextinity" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

/** The background is in the image file, and transparent space on the right makes the file `64px` wide, so Gmail on Android does not invert it. */
export const SmallLogoFix: Story = {
    tags: ["!dev"],
    render: () => (
        <MjmlSection paddingTop={0} paddingBottom={0}>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td
                            style={{
                                padding: "24px",
                                backgroundColor: "#ffffff",
                                backgroundImage: "url(/dark-mode/ffffff-100x100.png)",
                            }}
                        >
                            <table role="presentation" cellPadding={0} cellSpacing={0}>
                                <tbody>
                                    <tr>
                                        <td width={64} style={{ fontSize: 0, lineHeight: "1px" }}>
                                            <HtmlImage src="/dark-mode/logo-filled-64x40.png" width={64} height={40} alt="Dextinity" />
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};
