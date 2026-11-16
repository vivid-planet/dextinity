import { Children, type ReactNode } from "react";

/**
 * Joins the children into one string, the way React renders them as text.
 *
 * `@faire/mjml-react` converts children with `String(children)`, which puts a comma between array items.
 */
export function childrenToText(children: ReactNode): string {
    return Children.toArray(children).join("");
}
