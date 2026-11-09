import type { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MjmlComment, MjmlConditionalComment, MjmlStyle, MjmlYahooStyle } from "../index.js";

const rules = [".first{color:red}", ".second{color:blue}"];

describe("components that render their children as text", () => {
    it.each<[string, ReactNode]>([
        ["MjmlStyle", <MjmlStyle key="style">{rules}</MjmlStyle>],
        ["MjmlComment", <MjmlComment key="comment">{rules}</MjmlComment>],
        ["MjmlConditionalComment", <MjmlConditionalComment key="conditionalComment">{rules}</MjmlConditionalComment>],
        ["MjmlYahooStyle", <MjmlYahooStyle key="yahooStyle">{rules}</MjmlYahooStyle>],
    ])("%s joins array children without a comma", (_name, element) => {
        expect(renderToStaticMarkup(element)).toContain(".first{color:red}.second{color:blue}");
    });
});
