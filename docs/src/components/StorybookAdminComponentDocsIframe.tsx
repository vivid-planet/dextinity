import BrowserOnly from "@docusaurus/BrowserOnly";
import { useEffect, useRef, useState } from "react";

type Props = {
    storyId: string;
};

const fallbackIframeHeight = 800;

export const StorybookAdminComponentDocsIframe = ({ storyId }: Props) => {
    return <BrowserOnly>{() => <IFrame storyId={storyId} />}</BrowserOnly>;
};

const IFrame = ({ storyId }: Props) => {
    const storybookDomain = getStorybookDomain();
    const storybookDocsUrl = `${storybookDomain}/iframe.html?viewMode=docs&id=${storyId}&isEmbeddedInDocs=true`;
    const { iframeContentHeight, iframeRef } = useIframeContentHeight();

    return <iframe src={storybookDocsUrl} width="100%" height={iframeContentHeight} ref={iframeRef} />;
};

const useIframeContentHeight = () => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [iframeContentHeight, setIframeContentHeight] = useState<number>(fallbackIframeHeight);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
                if (event.data && typeof event.data === "object" && event.data.type === "document-height" && typeof event.data.height === "number") {
                    setIframeContentHeight(event.data.height);
                }
            }
        };

        window.addEventListener("message", handleMessage);

        return () => {
            window.removeEventListener("message", handleMessage);
        };
    }, []);

    return { iframeContentHeight, iframeRef };
};

const getStorybookDomain = () => {
    if (process.env.NODE_ENV === "development") {
        return "http://localhost:26638";
    }

    if (window.location.origin) {
        const originParts = window.location.origin.split(".");

        if (originParts.length) {
            if (originParts[0].includes("next")) {
                return `https://next.cms-storybook.dextinity.com`;
            }

            if (originParts[0].includes("deploy-preview")) {
                return `${originParts[0]}.cms-storybook.dextinity.com`;
            }
        }
    }

    return "https://cms-storybook.dextinity.com";
};
