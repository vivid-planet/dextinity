import { MjmlColumn, MjmlText } from "@faire/mjml-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MjmlMailRoot } from "../components/mailRoot/MjmlMailRoot.js";
import { MjmlSection } from "../components/section/MjmlSection.js";
import { renderMailHtml } from "../server/renderMailHtml.js";
import { ConfigProvider, useConfig } from "./ConfigProvider.js";

declare module "./ConfigProvider.js" {
    interface Config {
        testKey?: { value: string };
    }
}

function Probe() {
    const config = useConfig();
    return <span data-config-value={config.testKey?.value ?? "no-config"} />;
}

describe("useConfig", () => {
    it("returns an empty Config when no ConfigProvider is mounted", () => {
        const html = renderToStaticMarkup(<Probe />);
        expect(html).toContain('data-config-value="no-config"');
    });
});

describe("MjmlMailRoot config integration", () => {
    it("makes the config value available to descendants via useConfig", () => {
        const { html, mjmlWarnings } = renderMailHtml(
            <MjmlMailRoot config={{ testKey: { value: "from-root" } }}>
                <MjmlSection>
                    <MjmlColumn>
                        <MjmlText>
                            <Probe />
                        </MjmlText>
                    </MjmlColumn>
                </MjmlSection>
            </MjmlMailRoot>,
        );

        expect(mjmlWarnings).toEqual([]);
        expect(html).toContain('data-config-value="from-root"');
    });

    it("does not shadow an outer ConfigProvider when no config prop is passed", () => {
        const { html, mjmlWarnings } = renderMailHtml(
            <ConfigProvider config={{ testKey: { value: "from-outer" } }}>
                <MjmlMailRoot>
                    <MjmlSection>
                        <MjmlColumn>
                            <MjmlText>
                                <Probe />
                            </MjmlText>
                        </MjmlColumn>
                    </MjmlSection>
                </MjmlMailRoot>
            </ConfigProvider>,
        );

        expect(mjmlWarnings).toEqual([]);
        expect(html).toContain('data-config-value="from-outer"');
    });
});
