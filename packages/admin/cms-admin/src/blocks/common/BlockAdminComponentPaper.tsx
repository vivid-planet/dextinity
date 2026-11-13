import { styled } from "@mui/material/styles";
import { createContext, type PropsWithChildren, useContext } from "react";

const BlockAdminComponentPaperContext = createContext<boolean>(false);

export function useBlockAdminComponentPaper(): boolean {
    return useContext(BlockAdminComponentPaperContext);
}

interface Props {
    disablePadding?: boolean;
}

export const BlockAdminComponentPaper = ({ children, disablePadding }: PropsWithChildren<Props>) => {
    const hasBackground = useContext(BlockAdminComponentPaperContext);
    const content = <Content data-padding={disablePadding ? "none" : "default"}>{children}</Content>;

    if (hasBackground) {
        return content;
    }

    return (
        <BlockAdminComponentPaperContext.Provider value={true}>
            <Surface>{content}</Surface>
        </BlockAdminComponentPaperContext.Provider>
    );
};

const Surface = styled("div")`
    border-radius: var(--dextinity-block-radius);
    background: var(--dextinity-block-background);
    box-shadow: var(--dextinity-block-shadow);
    color: var(--dextinity-color-text);
`;

const Content = styled("div")`
    &[data-padding="default"] {
        padding: var(--dextinity-space-4);
    }
`;
