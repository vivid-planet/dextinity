import { MjmlText } from "@faire/mjml-react";
import type { PropsWithChildren } from "react";

import type { SupportedBlocks } from "./types.js";

interface Props extends PropsWithChildren {
    data: {
        block?: {
            type: string;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            props: any;
        };
    };
    supportedBlocks: SupportedBlocks;
    className?: string;
}

export const OneOfBlock = ({ data: { block, ...additionalProps }, supportedBlocks, children, className }: Props) => {
    if (!block) {
        return null;
    }

    const blockFunction = supportedBlocks[block.type];

    if (!blockFunction) {
        if (process.env.NODE_ENV === "development") {
            return (
                <MjmlText>
                    {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message,react/jsx-no-literals */}
                    {/* eslint-disable-next-line react/jsx-no-literals */}
                    Unknown type ({block.type}): {JSON.stringify(block.props)}
                </MjmlText>
            );
        }

        return null;
    }

    return <>{blockFunction({ ...block.props, ...additionalProps, children, className })}</>;
};
