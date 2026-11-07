import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import { clsx } from "clsx";
import { type ComponentPropsWithRef, forwardRef, type HTMLAttributes } from "react";

import { resolveSlotProps, type SlotPropsValue } from "../../utils/slotProps";
import { Tooltip } from "../tooltip/Tooltip";
import styles from "./Avatar.module.scss";

type AvatarSize = "default" | "small" | "large";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type AvatarOwnerState = {
    size: AvatarSize;
};

export interface AvatarSlotProps {
    /** Props for the `image` slot. */
    image?: SlotPropsValue<AvatarOwnerState, typeof BaseAvatar.Image>;
    /** Props for the `fallback` slot, which shows the initials. */
    fallback?: SlotPropsValue<AvatarOwnerState, typeof BaseAvatar.Fallback>;
}

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "className" | "children"> {
    /** The person's full name: the accessible name, the tooltip, and the source of the initials. */
    name: string;
    /** URL of a picture. Without one, or while it loads or if it fails, the initials are shown. */
    src?: string;
    /**
     * `default` (28px) in lists and the top bar, `small` (22px) in dense rows and chips, `large` (40px) in person cards.
     *
     * @defaultValue `"default"`
     */
    size?: AvatarSize;
    /**
     * Shows the name as a tooltip. Turn it off where the name is already shown next to the avatar.
     *
     * @defaultValue `true`
     */
    tooltip?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
    /** Props for each slot, merged with the slot's own props rather than replacing them. */
    slotProps?: AvatarSlotProps;
}

/** The initials of the first and the last word of a name, e.g. "MM" for "Maria Muster". */
export function getInitials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    const first = words.at(0);
    const last = words.length > 1 ? words.at(-1) : undefined;
    return [first, last]
        .map((word) => (word == null ? "" : (Array.from(word)[0] ?? "")))
        .join("")
        .toLocaleUpperCase();
}

/**
 * A person as a picture or initials.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
    { name, src, size = "default", tooltip = true, className, slotProps, ...restProps },
    ref,
) {
    const ownerState: AvatarOwnerState = { size };

    const imageProps = resolveSlotProps<AvatarOwnerState, typeof BaseAvatar.Image, typeof BaseAvatar.Image>({
        ownProps: { src, alt: "", className: styles.image },
        slotProps: slotProps?.image,
        ownerState,
    });
    const fallbackProps = resolveSlotProps<AvatarOwnerState, typeof BaseAvatar.Fallback, typeof BaseAvatar.Fallback>({
        ownProps: { className: styles.fallback, "aria-hidden": true } as ComponentPropsWithRef<typeof BaseAvatar.Fallback>,
        slotProps: slotProps?.fallback,
        ownerState,
    });

    const avatar = (
        <BaseAvatar.Root role="img" aria-label={name} {...restProps} ref={ref} data-size={ownerState.size} className={clsx(styles.root, className)}>
            {src != null && <BaseAvatar.Image {...imageProps} />}
            <BaseAvatar.Fallback {...fallbackProps}>{getInitials(name)}</BaseAvatar.Fallback>
        </BaseAvatar.Root>
    );

    return tooltip ? <Tooltip content={name}>{avatar}</Tooltip> : avatar;
});
