import type { ContentState } from "draft-js";
import type { PropsWithChildren } from "react";

interface IProps {
    contentState: ContentState;
    entityKey: string;
}

export function EditorComponent(props: PropsWithChildren<IProps>) {
    return (
        <a
            href="#"
            onClick={() => {
                // noop
            }}
        >
            {props.children}
        </a>
    );
}
