import { type AnchorHTMLAttributes, cloneElement, type DetailedHTMLProps, type ReactElement } from "react";

import type { PhoneLinkBlockData } from "../blocks.generated";
import type { PropsWithData } from "./PropsWithData";

interface PhoneLinkBlockProps extends PropsWithData<PhoneLinkBlockData>, Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
    children: ReactElement;
    legacyBehavior?: boolean;
}

export const PhoneLinkBlock = ({ data: { phone }, children, legacyBehavior, ...anchorProps }: PhoneLinkBlockProps) => {
    if (!phone) {
        if (legacyBehavior) {
            return children;
        }

        return <span className={anchorProps.className}>{children}</span>;
    }

    const href = `tel:${phone}`;

    if (legacyBehavior) {
        return cloneElement(children as ReactElement<DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>>, {
            ...anchorProps,
            href,
        });
    }

    return (
        <a {...anchorProps} href={href}>
            {children}
        </a>
    );
};
