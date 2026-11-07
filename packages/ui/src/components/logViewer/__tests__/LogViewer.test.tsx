import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LogViewer } from "../LogViewer";

afterEach(cleanup);

describe("LogViewer", () => {
    it("lists the lines with hidden numbers and the tone of each line", () => {
        render(
            <LogViewer
                title="Publish job"
                content={"Starting\nERROR Failed\n"}
                wrap
                follow
                getLineTone={(line) => (line.startsWith("ERROR") ? "error" : undefined)}
            />,
        );

        const log = screen.getByRole("log", { name: "Publish job" });
        const root = log.parentElement;
        expect(root?.className).toContain("dextinityLogViewer");
        expect([root?.hasAttribute("data-linenumbers"), root?.hasAttribute("data-wrap"), root?.hasAttribute("data-follow")]).toStrictEqual([
            true,
            true,
            true,
        ]);
        const lines = screen.getAllByRole("listitem");
        expect(lines.map((line) => line.textContent)).toStrictEqual(["1Starting", "2ERROR Failed"]);
        expect(lines.map((line) => line.dataset.tone)).toStrictEqual([undefined, "error"]);
        expect(lines[0].querySelector(".dextinityLogViewer__number")?.getAttribute("aria-hidden")).toBe("true");
    });

    it("says when there is no output", () => {
        render(<LogViewer content="" lineNumbers={false} labels={{ empty: "Nothing yet" }} />);

        expect(screen.getByRole("log", { name: "Log" }).textContent).toBe("Nothing yet");
        expect(screen.getByRole("button", { name: "Copy log" })).toBeDisabled();
    });
});
