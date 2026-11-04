import type { PropsWithChildren, ReactNode } from "react";

interface Props extends PropsWithChildren {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    block: (props: any) => ReactNode;
    data: {
        visible: boolean;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        block?: any;
    };
}

export const OptionalBlock = ({ block: blockFunction, data: { visible, block }, children }: Props) => {
    if (!visible || !block) {
        return null;
    }

    return <>{blockFunction({ ...block, children })}</>;
};
