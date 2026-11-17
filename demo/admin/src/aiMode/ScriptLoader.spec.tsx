import { renderAdmin } from "@src/testing/renderAdmin";
import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { ScriptLoader } from "./ScriptLoader";

const scriptSrc = "https://ai-hub.test/ai-hub-chat.mjs";

const findScripts = () => document.querySelectorAll<HTMLScriptElement>(`script[src="${scriptSrc}"]`);

// `ScriptLoader` counts failed attempts per `src` for the lifetime of the module, so each spec of a failure has a `src`
// of its own.
const failingScriptSrc = (name: string) => `https://ai-hub.test/${name}.mjs`;

const findScriptById = (src: string) => document.getElementById(src);

const getScriptById = (src: string) => {
    const script = findScriptById(src);
    if (!(script instanceof HTMLScriptElement)) {
        throw new Error(`No script for ${src}`);
    }
    return script;
};

describe("ScriptLoader", () => {
    afterEach(() => {
        for (const script of document.querySelectorAll('script[src^="https://ai-hub.test/"]')) {
            script.remove();
        }
    });

    it("renders the children right away when the script has already loaded, without adding it again", () => {
        const script = document.createElement("script");
        script.id = scriptSrc;
        script.src = scriptSrc;
        script.dataset.loaded = "true";
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

    it("waits for a script that another mount added and that is still loading, as in StrictMode", () => {
        const first = renderAdmin(
            <ScriptLoader src={scriptSrc}>
                <p>Chat</p>
            </ScriptLoader>,
        );
        first.unmount();

        renderAdmin(
            <ScriptLoader src={scriptSrc}>
                <p>Chat</p>
            </ScriptLoader>,
        );

        expect(findScripts()).toHaveLength(1);
        expect(screen.queryByText("Chat")).not.toBeInTheDocument();

        fireEvent.load(findScripts()[0]);

        expect(screen.getByText("Chat")).toBeInTheDocument();
    });

    it("renders the error fallback instead of the children when the script fails to load, and removes the script", () => {
        const src = failingScriptSrc("fails-once");
        renderAdmin(
            <ScriptLoader src={src} errorFallback={<p>Failed</p>}>
                <p>Chat</p>
            </ScriptLoader>,
        );

        fireEvent.error(getScriptById(src));

        expect(screen.getByText("Failed")).toBeInTheDocument();
        expect(screen.queryByText("Chat")).not.toBeInTheDocument();
        expect(findScriptById(src)).toBeNull();
    });

    it("requests the script from another URL on the next mount after it failed to load, as the browser keeps the failed module", () => {
        const src = failingScriptSrc("fails-then-loads");
        const first = renderAdmin(
            <ScriptLoader src={src}>
                <p>Chat</p>
            </ScriptLoader>,
        );
        fireEvent.error(getScriptById(src));
        first.unmount();

        renderAdmin(
            <ScriptLoader src={src}>
                <p>Chat</p>
            </ScriptLoader>,
        );

        const retriedScript = getScriptById(src);
        expect(retriedScript).toHaveAttribute("src", `${src}?retry=1`);

        fireEvent.load(retriedScript);

        expect(screen.getByText("Chat")).toBeInTheDocument();
    });
});
