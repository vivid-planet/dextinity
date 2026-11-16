import { type IMjmlStyleProps, MjmlStyle as BaseMjmlStyle } from "@faire/mjml-react";
import type { ReactNode } from "react";

import { childrenToText } from "../../utils/childrenToText.js";

/** Renders `<mj-style>`. Several children are joined into one stylesheet. */
export function MjmlStyle({ children, ...restProps }: IMjmlStyleProps): ReactNode {
    return <BaseMjmlStyle {...restProps}>{childrenToText(children)}</BaseMjmlStyle>;
}
