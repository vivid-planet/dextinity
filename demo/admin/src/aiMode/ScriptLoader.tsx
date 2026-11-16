import { type FC, type PropsWithChildren, useEffect, useState } from "react";

type Props = { src: string };

export const ScriptLoader: FC<PropsWithChildren<Props>> = ({ src, children }) => {
    const [loaded, setLoaded] = useState(() => !!document.getElementById(src));

    useEffect(() => {
        if (document.getElementById(src)) {
            setLoaded(true);
            return;
        }
        const script = document.createElement("script");
        script.id = src;
        script.src = src;
        script.type = "module";
        script.onload = () => setLoaded(true);
        document.body.appendChild(script);
    }, [src]);

    return loaded ? <>{children}</> : null;
};
