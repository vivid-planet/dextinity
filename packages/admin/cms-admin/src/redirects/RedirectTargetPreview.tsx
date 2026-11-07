import type { JSX } from "react";

import { useBlockContext } from "../blocks/context/useBlockContext";
import { type BlockInterface, isPreviewContentTextRule } from "../blocks/types";
import { Icon, Root, Subtitle, Text, Title } from "./RedirectTargetPreview.sc";

interface RedirectTargetPreviewProps {
    linkBlock: BlockInterface;
    target: unknown;
}

export function RedirectTargetPreview({ linkBlock, target }: RedirectTargetPreviewProps): JSX.Element {
    const context = useBlockContext();
    const state = linkBlock.input2State(target);
    const title = linkBlock.dynamicDisplayName?.(state) ?? linkBlock.displayName;
    const subtitle = linkBlock
        .previewContent(state, context)
        .filter(isPreviewContentTextRule)
        .map(({ content }) => content)
        .find((content) => content !== "");
    const icon = linkBlock.icon?.(state);

    return (
        <Root>
            {icon ? <Icon aria-hidden>{icon}</Icon> : null}
            <Text>
                <Title>{title}</Title>
                {subtitle ? <Subtitle>{subtitle}</Subtitle> : null}
            </Text>
        </Root>
    );
}
