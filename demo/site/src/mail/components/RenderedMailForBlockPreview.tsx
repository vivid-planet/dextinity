import { useRefToRegisterMailBlocksForPreview } from "@dextinity/mail-react";
import { useIFrameBridge } from "@dextinity/site-nextjs";
import { type FC, type ReactElement, useEffect, useState } from "react";

interface Props {
    mail: ReactElement;
    /** Applied to the rendered HTML, for mails whose placeholders need substituting before display. */
    transformHtml?: (html: string) => string;
}

export const RenderedMailForBlockPreview: FC<Props> = ({ mail, transformHtml }) => {
    const [mailHtml, setMailHtml] = useState<string>("");
    const mailContainerRef = useRefToRegisterMailBlocksForPreview<HTMLSpanElement>(useIFrameBridge());

    useEffect(() => {
        let isOutdated = false;

        (async () => {
            const { renderMailHtml } = await import("@dextinity/mail-react/client");
            const { html, mjmlWarnings } = await renderMailHtml(mail);
            if (isOutdated) {
                return;
            }

            if (process.env.NODE_ENV === "development" && mjmlWarnings.length) {
                console.warn(`${mjmlWarnings.length} MJML warnings`, mjmlWarnings);
            }

            setMailHtml(transformHtml ? transformHtml(html) : html);
        })();

        return () => {
            isOutdated = true;
        };
    }, [mail, transformHtml]);

    return <span ref={mailContainerRef} dangerouslySetInnerHTML={{ __html: mailHtml }} />;
};
