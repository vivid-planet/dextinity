import { MjmlText } from "@faire/mjml-react";
import { Fragment } from "react";

import type { SupportedBlocks } from "./types.js";

interface Props {
    supportedBlocks: SupportedBlocks;
    data: {
        blocks: Array<{ key: string; type: string; visible: boolean; props: unknown }>;
    };
}

export const BlocksBlock = ({ supportedBlocks, data: { blocks } }: Props) => {
    return (
        <>
            {blocks.map((block) => {
                const blockFunction = supportedBlocks[block.type];

                if (!blockFunction) {
                    if (process.env.NODE_ENV === "development") {
                        return (
                            <MjmlText key={block.key}>
                                {/* eslint-disable-next-line @calm/react-intl/missing-formatted-message,react/jsx-no-literals */}
                                {/* eslint-disable-next-line react/jsx-no-literals */}
                                Unknown type ({block.type}): {JSON.stringify(block.props)}
                            </MjmlText>
                        );
                    }

                    return null;
                }

                return <Fragment key={block.key}>{blockFunction(block.props)}</Fragment>;
            })}
        </>
    );
};
