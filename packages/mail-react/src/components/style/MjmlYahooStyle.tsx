import { MjmlYahooStyle as BaseMjmlYahooStyle } from "@faire/mjml-react/extensions/index.js";
import type { ComponentProps, ReactNode } from "react";

import { childrenToText } from "../../utils/childrenToText.js";

/** Renders styles that only Yahoo Mail applies. Several children are joined into one stylesheet. */
export function MjmlYahooStyle({ children, ...restProps }: ComponentProps<typeof BaseMjmlYahooStyle>): ReactNode {
    return <BaseMjmlYahooStyle {...restProps}>{childrenToText(children)}</BaseMjmlYahooStyle>;
}
