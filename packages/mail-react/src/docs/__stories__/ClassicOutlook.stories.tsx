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
