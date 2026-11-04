import { useRef } from "react";
import { MemoryRouter as ReactMemoryRouter, type MemoryRouterProps } from "react-router-dom";

import { type PromptHandlerApi, RouterPromptHandler } from "./PromptHandler";

// MemoryRouter that sets up a material-ui confirmation dialog
// plus a PromptHandler that works with our Prompt (supporting multiple Prompts)

export const RouterMemoryRouter = ({ children, ...props }: MemoryRouterProps) => {
    const apiRef = useRef<PromptHandlerApi>(undefined);

    const getConfirmation = (message: string, callback: (ok: boolean) => void) => {
        if (apiRef.current) {
            apiRef.current.showDialog(message, callback);
        }
    };

    return (
        <ReactMemoryRouter getUserConfirmation={getConfirmation} {...props}>
            <RouterPromptHandler apiRef={apiRef}>{children}</RouterPromptHandler>
        </ReactMemoryRouter>
    );
};
