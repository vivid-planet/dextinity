import { Menu as BaseMenu } from "@base-ui/react/menu";
import { clsx } from "clsx";
import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

import styles from "./MenuRadioGroup.module.scss";

/**
 * The resolved configuration that influences the component's appearance or behavior.
 */
export type MenuRadioGroupOwnerState = {
    disabled: boolean;
};

export interface MenuRadioGroupProps extends Omit<HTMLAttributes<HTMLDivElement>, "className" | "children" | "onChange"> {
    /** The `value` of the checked `MenuRadioItem`. */
    value: string;
    /** Called with the `value` of the item the user picks. */
    onChange: (value: string) => void;
    /** The options, as `MenuRadioItem`s. */
    children: ReactNode;
    /**
     * Keeps every option from being picked.
     *
     * @defaultValue `false`
     */
    disabled?: boolean;
    /** Added alongside the component's own classes. */
    className?: string;
}

/**
 * A choice of one option in a `Menu`, e.g. the color scheme. The checked option shows a check mark.
 */
export const MenuRadioGroup = forwardRef<HTMLDivElement, MenuRadioGroupProps>(function MenuRadioGroup(
    { value, onChange, children, disabled = false, className, ...restProps },
    ref,
) {
    const ownerState: MenuRadioGroupOwnerState = { disabled };

    return (
        <BaseMenu.RadioGroup
            {...restProps}
            ref={ref}
            value={value}
            onValueChange={(nextValue: string) => onChange(nextValue)}
            disabled={ownerState.disabled}
            className={clsx(styles.root, className)}
        >
            {children}
        </BaseMenu.RadioGroup>
    );
});
