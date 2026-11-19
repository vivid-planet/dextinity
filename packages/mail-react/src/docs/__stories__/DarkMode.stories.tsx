import type { Meta, StoryObj } from "@storybook/react-vite";

import { HtmlImage, MjmlColumn, MjmlDivider, MjmlRaw, MjmlSection, MjmlText } from "../../index.js";

const config: Meta = {
    title: "Docs/Client Issues/Dark Mode Examples",
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
                                        <td width={40} style={{ fontSize: 0 }}>
                                            <HtmlImage src="/dark-mode/logo-filled-40.png" width={40} height={40} alt="Dextinity" />
                                        </td>
                                        <td width={24} />
                                        <td width={40} style={{ fontSize: 0, backgroundColor: "#0e0c2b", borderRadius: "13px" }}>
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
                                        <td width={64} style={{ fontSize: 0 }}>
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

/** A line drawn as a background color with `MjmlDivider`. In dark mode, it is difficult to see on the dark background. */
export const LineProblem: Story = {
    tags: ["!dev"],
    render: () => (
        <MjmlSection backgroundColor="#ffffff" indent paddingTop={32} paddingBottom={32}>
            <MjmlColumn>
                <MjmlText color="#001e50" fontSize="16px" lineHeight="24px" paddingBottom="16px">
                    Your order is on its way.
                </MjmlText>
                <MjmlDivider height={1} backgroundColor="#001e50" />
            </MjmlColumn>
        </MjmlSection>
    ),
};

/** The line is a border on an empty cell with a light background, in a table with `border-collapse: separate`. */
export const LineFix: Story = {
    tags: ["!dev"],
    render: () => (
        <MjmlSection backgroundColor="#ffffff" indent paddingTop={32} paddingBottom={32}>
            <MjmlColumn>
                <MjmlText color="#001e50" fontSize="16px" lineHeight="24px" paddingBottom="16px">
                    Your order is on its way.
                </MjmlText>
                <MjmlRaw>
                    <tr>
                        <td>
                            <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "separate" }}>
                                <tbody>
                                    <tr>
                                        <td
                                            style={{
                                                height: 0,
                                                fontSize: 0,
                                                lineHeight: 0,
                                                msoLineHeightRule: "exactly",
                                                borderTop: "1px solid #001e50",
                                                color: "#001e50",
                                                backgroundColor: "#cccccc",
                                            }}
                                        />
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

/** A dark blue background set only as `background-color`, with an image on it. In dark mode, several clients change the color. */
export const BackgroundColorProblem: Story = {
    tags: ["!dev"],
    render: () => (
        <MjmlSection paddingTop={0} paddingBottom={0}>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td style={{ padding: "24px", fontSize: 0, backgroundColor: "#001e50" }}>
                            <HtmlImage src="https://picsum.photos/seed/dark-mode-background/1104/552" width={552} height={276} alt="Landscape" />
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

/** The background color is also a `background-image` of a solid PNG in that color, which the clients leave unchanged. */
export const BackgroundColorFix: Story = {
    tags: ["!dev"],
    render: () => (
        <MjmlSection paddingTop={0} paddingBottom={0}>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td
                            style={{
                                padding: "24px",
                                fontSize: 0,
                                backgroundColor: "#001e50",
                                backgroundImage: "url(/dark-mode/001e50-100x100.png)",
                            }}
                        >
                            <HtmlImage src="https://picsum.photos/seed/dark-mode-background/1104/552" width={552} height={276} alt="Landscape" />
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};
