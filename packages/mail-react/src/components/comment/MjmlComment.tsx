import { MjmlComment as BaseMjmlComment } from "@faire/mjml-react/extensions/index.js";
import type { ComponentProps, ReactNode } from "react";

import { childrenToText } from "../../utils/childrenToText.js";

/** Renders an HTML comment. Several children are joined into one text. */
export function MjmlComment({ children, ...restProps }: ComponentProps<typeof BaseMjmlComment>): ReactNode {
    return <BaseMjmlComment {...restProps}>{childrenToText(children)}</BaseMjmlComment>;
}
