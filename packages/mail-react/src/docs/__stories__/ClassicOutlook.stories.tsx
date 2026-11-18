import type { Meta, StoryObj } from "@storybook/react-vite";

import { HtmlImage, MjmlColumn, MjmlRaw, MjmlSection } from "../../index.js";

const config: Meta = {
    title: "Docs/Client Issues/Classic Outlook Examples",
};

export default config;

type Story = StoryObj;

/** An image in a `<td>` with `line-height: 1px`, inside an MJML section. Classic Outlook shows the image only about `1px` high. */
export const ImageLineHeightProblem: Story = {
    tags: ["!dev"],
    render: () => (
        <MjmlSection paddingTop={0} paddingBottom={0}>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td style={{ fontSize: 0, lineHeight: "1px" }}>
                            <HtmlImage
                                src="https://picsum.photos/seed/classic-outlook-line-height/1200/600"
                                width={600}
                                height={300}
                                alt="Landscape"
                            />
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

/** The `<td>` has no `line-height`, so classic Outlook shows the full image. */
export const ImageLineHeightFix: Story = {
    tags: ["!dev"],
    render: () => (
        <MjmlSection paddingTop={0} paddingBottom={0}>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td style={{ fontSize: 0 }}>
                            <HtmlImage
                                src="https://picsum.photos/seed/classic-outlook-line-height/1200/600"
                                width={600}
                                height={300}
                                alt="Landscape"
                            />
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

/** A link styled as a button, with rounded corners from CSS `border-radius` only. Classic Outlook shows square corners. */
export const RoundedButtonProblem: Story = {
    tags: ["!dev"],
    render: () => (
        <MjmlSection>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td align="center" style={{ padding: "0 24px" }}>
                            <a
                                href="https://example.com/"
                                style={{
                                    display: "inline-block",
                                    width: "200px",
                                    fontFamily: "Arial, sans-serif",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    lineHeight: "44px",
                                    msoLineHeightRule: "exactly",
                                    textAlign: "center",
                                    textDecoration: "none",
                                    color: "#ffffff",
                                    backgroundColor: "#001e50",
                                    borderRadius: "8px",
                                }}
                            >
                                Track your order
                            </a>
                        </td>
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};

/** Classic Outlook shows a VML `v:roundrect` with rounded corners. The HTML link is hidden from classic Outlook. */
export const RoundedButtonFix: Story = {
    tags: ["!dev"],
    render: () => (
        <MjmlSection>
            <MjmlColumn>
                <MjmlRaw>
                    <tr>
                        <td
                            align="center"
                            style={{ padding: "0 24px" }}
                            dangerouslySetInnerHTML={{
                                __html: `<!--[if mso]>
<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="https://example.com/" arcsize="19%" stroked="f" fillcolor="#001e50" style="width:199px;height:43px;v-text-anchor:middle;">
<center style="font-family:Arial,sans-serif;font-size:16px;font-weight:bold;color:#ffffff;">Track your order</center>
</v:roundrect>
<![endif]--><!--[if !mso]><!--><a href="https://example.com/" style="display:inline-block;width:200px;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;line-height:44px;mso-line-height-rule:exactly;text-align:center;text-decoration:none;color:#ffffff;background-color:#001e50;border-radius:8px;">Track your order</a><!--<![endif]-->`,
                            }}
                        />
                    </tr>
                </MjmlRaw>
            </MjmlColumn>
        </MjmlSection>
    ),
};
