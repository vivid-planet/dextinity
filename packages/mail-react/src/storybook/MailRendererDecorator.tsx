import { useChannel, useGlobals } from "storybook/preview-api";

import { renderMailHtml } from "../client/renderMailHtml.js";
import { MjmlMailRoot } from "../components/mailRoot/MjmlMailRoot.js";
import type { Theme } from "../theme/themeTypes.js";
import { replaceImagesWithPublicUrl } from "./replaceImagesWithPublicUrl.js";

const RENDER_RESULT_EVENT = "dextinity-mail-render-result";

export function MailRendererDecorator(Story: () => React.JSX.Element, context: { parameters: { mailRoot?: boolean; theme?: Theme } }) {
    const [globals] = useGlobals();
    const emit = useChannel({});

    const { html: rawHtml, mjmlWarnings } = renderMailHtml(
        context.parameters.mailRoot === false ? (
            <Story />
        ) : (
            <MjmlMailRoot theme={context.parameters.theme}>
                <Story />
            </MjmlMailRoot>
        ),
    );

    for (const warning of mjmlWarnings) {
        console.warn("MJML warning:", warning);
    }

    const html = globals.usePublicImageUrls ? replaceImagesWithPublicUrl(rawHtml) : rawHtml;

    emit(RENDER_RESULT_EVENT, { html, mjmlWarnings });

    return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
