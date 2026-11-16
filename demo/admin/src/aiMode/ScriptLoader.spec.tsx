import { renderAdmin } from "@src/testing/renderAdmin";
import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ScriptLoader } from "./ScriptLoader";

const scriptSrc = "https://ai-hub.test/ai-hub-chat.mjs";

const findScripts = () => document.querySelectorAll<HTMLScriptElement>(`script[src="${scriptSrc}"]`);

describe("ScriptLoader", () => {
    afterEach(() => {
        for (const script of findScripts()) {
            script.remove();
        }
    });

    it("renders the children right away when the script is already in the document, without adding it again", () => {
        const script = document.createElement("script");
        script.id = scriptSrc;
        script.src = scriptSrc;
        document.body.appendChild(script);

        renderAdmin(
            <ScriptLoader src={scriptSrc}>
                <p>Chat</p>
            </ScriptLoader>,
        );

        expect(screen.getByText("Chat")).toBeInTheDocument();
        expect(findScripts()).toHaveLength(1);
    });

    it("adds the script as a module and renders the children only once it has loaded", () => {
        renderAdmin(
            <ScriptLoader src={scriptSrc}>
                <p>Chat</p>
            </ScriptLoader>,
        );

        const scripts = findScripts();
        expect(scripts).toHaveLength(1);
        expect(scripts[0]).toHaveAttribute("type", "module");
        expect(screen.queryByText("Chat")).not.toBeInTheDocument();

        fireEvent.load(scripts[0]);

        expect(screen.getByText("Chat")).toBeInTheDocument();
    });
});
