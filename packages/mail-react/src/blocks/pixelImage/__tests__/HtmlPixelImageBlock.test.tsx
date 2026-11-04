import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { type Config, ConfigProvider } from "../../../config/ConfigProvider.js";
import { createTheme } from "../../../theme/createTheme.js";
import { ThemeProvider } from "../../../theme/ThemeProvider.js";
import { exampleBlockData } from "../__stories__/exampleBlockData.js";
import { HtmlPixelImageBlock } from "../HtmlPixelImageBlock.js";

const config: Config = { pixelImageBlock: { validSizes: [640, 1280], baseUrl: "" } };

describe("HtmlPixelImageBlock", () => {
    it("forwards borderRadius to the image", () => {
        const html = renderToStaticMarkup(
            <ThemeProvider theme={createTheme()}>
                <ConfigProvider config={config}>
                    <HtmlPixelImageBlock data={exampleBlockData} width={300} borderRadius={8} />
                </ConfigProvider>
            </ThemeProvider>,
        );

        expect(html).toContain("border-radius:8px");
    });
});
