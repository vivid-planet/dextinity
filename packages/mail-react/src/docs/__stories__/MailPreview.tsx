import { type CSSProperties, type ReactElement, useEffect, useState } from "react";

import { renderMailHtml } from "../../client/renderMailHtml.js";

interface MailPreviewProps {
    mail: ReactElement;
    title: string;
    viewportWidth?: number;
    scale?: number;
    style?: CSSProperties;
}

export function MailPreview({ mail, title, viewportWidth, scale = 1, style }: MailPreviewProps) {
    const [height, setHeight] = useState(0);
    const [html, setHtml] = useState<string>();

    useEffect(() => {
        let isOutdated = false;

        async function render() {
            const { html } = await renderMailHtml(mail);
            if (!isOutdated) {
                setHtml(html);
            }
        }

        render();
        return () => {
            isOutdated = true;
        };
    }, [mail]);

    const iframe = (
        <iframe
            title={title}
            srcDoc={html}
            width={viewportWidth ?? "100%"}
            height={height}
            style={{ display: "block", border: 0, transform: `scale(${scale})`, transformOrigin: "top left" }}
            onLoad={(event) => setHeight(Math.ceil(event.currentTarget.contentDocument?.documentElement.getBoundingClientRect().height ?? 0))}
        />
    );

    return (
        <div
            style={{
                width: viewportWidth === undefined ? "100%" : viewportWidth * scale,
                height: height * scale,
                overflow: "hidden",
                ...style,
            }}
        >
            {iframe}
        </div>
    );
}
