import { RteNonBreakingSpace } from "@dextinity/admin-icons";
import { styled } from "@mui/material/styles";
import type { ContentState } from "draft-js";
import type { PropsWithChildren } from "react";

interface Props {
    contentState: ContentState;
    entityKey: string;
}

const EditorComponent = ({ children }: PropsWithChildren<Props>) => {
    return (
        <Root>
            <Icon />
            {children}
        </Root>
    );
};

const Root = styled("span")`
    position: relative;
    // Arbitrary value to make the non-breaking space the same width as the icon
    letter-spacing: 0.9em;
`;

const Icon = styled(RteNonBreakingSpace)`
    position: absolute;
    // Arbitrary values to make the icon look centered
    top: 0.12em;
    left: 0.08em;
    font-size: inherit;
    color: currentcolor;
    opacity: 0.5;
`;

export default EditorComponent;
