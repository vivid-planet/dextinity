import type { LinkBlockData } from "@src/blocks.generated";
import type { PropsWithChildren } from "react";

import { isValidLink } from "./isValidLink";
import { VisibleInBlockPreviewOnly } from "./VisibleInBlockPreviewOnly";

export function HiddenIfInvalidLink({ link, children }: PropsWithChildren<{ link: LinkBlockData }>) {
    if (isValidLink(link)) {
        return <>{children}</>;
    }

    return <VisibleInBlockPreviewOnly>{children}</VisibleInBlockPreviewOnly>;
}
