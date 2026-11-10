import { MjmlConditionalComment as BaseMjmlConditionalComment } from "@faire/mjml-react/extensions/index.js";
import type { ComponentProps, ReactNode } from "react";

import { childrenToText } from "../../utils/childrenToText.js";

/** Renders a conditional comment. Several children are joined into one text. */
export function MjmlConditionalComment({ children, ...restProps }: ComponentProps<typeof BaseMjmlConditionalComment>): ReactNode {
    return <BaseMjmlConditionalComment {...restProps}>{childrenToText(children)}</BaseMjmlConditionalComment>;
}
