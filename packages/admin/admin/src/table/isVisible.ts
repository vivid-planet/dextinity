import type { Visible, VisibleType } from "./Table";

export const isVisible = (visibleType: VisibleType, visible?: Visible): boolean => {
    if (visible != null) {
        if (typeof visible === "boolean") {
            return visible;
        } else {
            return visible[visibleType] == null || visible[visibleType] === true;
        }
    }

    return true;
};
