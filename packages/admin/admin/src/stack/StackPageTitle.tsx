import { circularDeepEqual } from "fast-equals";
import { Component, type ContextType, isValidElement, type PropsWithChildren, type ReactNode } from "react";

import { StackSwitchApiContext } from "./Switch";

type IProps = PropsWithChildren<{
    title?: ReactNode;
}>;

export class StackPageTitle extends Component<IProps> {
    public static contextType = StackSwitchApiContext;
    declare context: ContextType<typeof StackSwitchApiContext>;

    public render() {
        return this.props.children;
    }

    public componentDidMount() {
        this.context.updatePageBreadcrumbTitle(this.props.title);
    }

    public componentDidUpdate(prevProps: IProps) {
        const prevTitle = prevProps.title;
        const currTitle = this.props.title;

        // Titles are arbitrary React nodes, whose props can contain circular references
        if (isValidElement(prevTitle) && isValidElement(currTitle) && circularDeepEqual(prevTitle.props, currTitle.props)) {
            return;
        }

        if (prevTitle !== currTitle) {
            this.context.updatePageBreadcrumbTitle(currTitle);
        }
    }
}
