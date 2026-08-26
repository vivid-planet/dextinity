import { RteSoftHyphen } from "@dextinity/admin-icons";
import { styled } from "@mui/material/styles";
import type { ContentState } from "draft-js";
import type { PropsWithChildren } from "react";

interface Props {
    contentState: ContentState;
    entityKey: string;
}

//TODO: Allow text selection for SoftHyphen
export const EditorComponent = ({ children }: PropsWithChildren<Props>) => {
    return (
        <span>
            <VisibleHyphen />
            {children}
        </span>
    );
};

const VisibleHyphen = styled(RteSoftHyphen)`
    font-size: inherit;
    color: currentcolor;
    opacity: 0.5;

    // Arbitrary value to make the icon look centered
    padding-top: 0.2em;
`;
