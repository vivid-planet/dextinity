import { renderToMjml } from "@faire/mjml-react/utils/renderToMjml.js";
import mjml2html from "mjml-browser";
import type { ReactElement } from "react";

import { addBodyTargetingId } from "../utils/addBodyTargetingId.js";

type MjmlOptions = Parameters<typeof mjml2html>[1];
type MjmlWarning = ReturnType<typeof mjml2html>["errors"][number];

export function renderMailHtml(element: ReactElement, options?: MjmlOptions): { html: string; mjmlWarnings: MjmlWarning[] } {
    const mjmlString = renderToMjml(element);
    const { html, errors: mjmlWarnings } = mjml2html(mjmlString, { validationLevel: "soft", ...options });
    return { html: addBodyTargetingId(html), mjmlWarnings };
}
