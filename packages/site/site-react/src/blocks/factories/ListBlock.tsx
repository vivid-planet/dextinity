import { Fragment, type ReactNode } from "react";

import { ErrorHandlerBoundary } from "../../errorHandler/ErrorHandlerBoundary";
import { PreviewSkeleton } from "../../previewskeleton/PreviewSkeleton";

interface Props {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    block: (props: any, index: number) => ReactNode;
    data: {
        blocks: Array<{ key: string; visible: boolean; props: unknown }>;
    };
}

export const ListBlock = ({ block: blockFunction, data: { blocks } }: Props) => {
    if (blocks.length === 0) {
        return <PreviewSkeleton hasContent={false} />;
    }

    return (
        <>
            {blocks.map((block, index) => (
                <Fragment key={block.key}>
                    <ErrorHandlerBoundary>{blockFunction(block.props, index)}</ErrorHandlerBoundary>
                </Fragment>
            ))}
        </>
    );
};
