import { renderToMjml } from "@faire/mjml-react/utils/renderToMjml.js";
import mjml2html from "mjml";
import type { ReactElement } from "react";

import { addBodyTargetingId } from "../utils/addBodyTargetingId.js";

type MjmlOptions = Parameters<typeof mjml2html>[1];
type MjmlWarning = Awaited<ReturnType<typeof mjml2html>>["errors"][number];

export async function renderMailHtml(element: ReactElement, options?: MjmlOptions): Promise<{ html: string; mjmlWarnings: MjmlWarning[] }> {
    const mjmlString = renderToMjml(element);
    const { html, errors: mjmlWarnings } = await mjml2html(mjmlString, {
        validationLevel: "soft",
        ...options,
        ignoreIncludes: options?.ignoreIncludes ?? true,
    });
    return { html: addBodyTargetingId(html), mjmlWarnings };
}
