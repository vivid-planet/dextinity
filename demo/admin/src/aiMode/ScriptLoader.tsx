import { type FC, type PropsWithChildren, type ReactNode, useEffect, useState } from "react";

type Props = { src: string; errorFallback?: ReactNode };

type Status = "loading" | "loaded" | "error";

const failedAttempts = new Map<string, number>();

// The browser remembers a module that failed to load for the rest of the page's life, so a retry needs another URL.
const getScriptUrl = (src: string) => {
    const attempt = failedAttempts.get(src);
    if (attempt === undefined) {
        return src;
    }

    const url = new URL(src, window.location.href);
    url.searchParams.set("retry", String(attempt));
    return url.href;
};

const findLoadedScript = (src: string) => {
    const script = document.getElementById(src);
    return script instanceof HTMLScriptElement && script.dataset.loaded === "true" ? script : null;
};

/**
 * Renders the children once the script has loaded. A script already in the document may still be loading, e.g. when
 * `StrictMode` runs the effect a second time right after the first one added it, so its presence alone isn't enough:
 * a custom element rendered before its script defined it gets its properties only later, after its ref callback ran.
 *
 * A script that failed to load is removed again, so that the next `ScriptLoader` for it tries again instead of waiting
 * for a `load` event that never comes.
 */
export const ScriptLoader: FC<PropsWithChildren<Props>> = ({ src, errorFallback = null, children }) => {
    const [status, setStatus] = useState<Status>(() => (findLoadedScript(src) !== null ? "loaded" : "loading"));

    useEffect(() => {
        if (findLoadedScript(src)) {
            setStatus("loaded");
            return;
        }

        setStatus("loading");

        let script = document.getElementById(src);
        if (!(script instanceof HTMLScriptElement)) {
            const newScript = document.createElement("script");
            newScript.id = src;
            newScript.src = getScriptUrl(src);
            newScript.type = "module";
            newScript.addEventListener(
                "load",
                () => {
                    newScript.dataset.loaded = "true";
                },
                { once: true },
            );
            newScript.addEventListener(
                "error",
                () => {
                    failedAttempts.set(src, (failedAttempts.get(src) ?? 0) + 1);
                    newScript.remove();
                },
                { once: true },
            );
            document.body.appendChild(newScript);
            script = newScript;
        }

        const handleLoad = () => setStatus("loaded");
        const handleError = () => setStatus("error");
        script.addEventListener("load", handleLoad, { once: true });
        script.addEventListener("error", handleError, { once: true });
        return () => {
            script.removeEventListener("load", handleLoad);
            script.removeEventListener("error", handleError);
        };
    }, [src]);

    if (status === "error") {
        return <>{errorFallback}</>;
    }

    return status === "loaded" ? <>{children}</> : null;
};
