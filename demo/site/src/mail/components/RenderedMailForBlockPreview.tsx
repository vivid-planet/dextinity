import { type FC, type ReactElement, useEffect, useState } from "react";

interface Props {
    mail: ReactElement;
    /** Applied to the rendered HTML, for mails whose placeholders need substituting before display. */
    transformHtml?: (html: string) => string;
}

export const RenderedMailForBlockPreview: FC<Props> = ({ mail, transformHtml }) => {
    const [mailHtml, setMailHtml] = useState<string>("");

    useEffect(() => {
        (async () => {
            const { renderMailHtml } = await import("@dextinity/mail-react/client");
            const { html, mjmlWarnings } = renderMailHtml(mail);

            if (process.env.NODE_ENV === "development" && mjmlWarnings.length) {
                console.warn(`${mjmlWarnings.length} MJML warnings`, mjmlWarnings);
            }

            setMailHtml(transformHtml ? transformHtml(html) : html);
        })();
    }, [mail, transformHtml]);

    return <span dangerouslySetInnerHTML={{ __html: mailHtml }} />;
};
