import { type FC, type PropsWithChildren, useEffect, useState } from "react";

type Props = { src: string };

const findLoadedScript = (src: string) => {
    const script = document.getElementById(src);
    return script instanceof HTMLScriptElement && script.dataset.loaded === "true" ? script : null;
};

/**
 * Renders the children once the script has loaded. A script already in the document may still be loading, e.g. when
 * `StrictMode` runs the effect a second time right after the first one added it, so its presence alone isn't enough:
 * a custom element rendered before its script defined it gets its properties only later, after its ref callback ran.
 */
export const ScriptLoader: FC<PropsWithChildren<Props>> = ({ src, children }) => {
    const [loaded, setLoaded] = useState(() => findLoadedScript(src) !== null);

    useEffect(() => {
        if (findLoadedScript(src)) {
            setLoaded(true);
            return;
        }

        let script = document.getElementById(src);
        if (!(script instanceof HTMLScriptElement)) {
            const newScript = document.createElement("script");
            newScript.id = src;
            newScript.src = src;
            newScript.type = "module";
            newScript.addEventListener(
                "load",
                () => {
                    newScript.dataset.loaded = "true";
                },
                { once: true },
            );
            document.body.appendChild(newScript);
            script = newScript;
        }

        const handleLoad = () => setLoaded(true);
        script.addEventListener("load", handleLoad, { once: true });
        return () => {
            script.removeEventListener("load", handleLoad);
        };
    }, [src]);

    return loaded ? <>{children}</> : null;
};
