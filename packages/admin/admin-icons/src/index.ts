import type { GeneratedIconName } from "./generated/GeneratedIconName";

export { default as BallTriangle } from "./BallTriangle";
export { default as CheckboxChecked } from "./CheckboxChecked";
export { default as CheckboxIndeterminate } from "./CheckboxIndeterminate";
export { default as CheckboxUnchecked } from "./CheckboxUnchecked";
export { DextinityIcon, type DextinityIconProps, type DextinityIconVariant } from "./DextinityIcon";
export { DextinityLogo, type DextinityLogoProps, type DextinityLogoVariant } from "./DextinityLogo";
export * from "./generated";
export { default as Html } from "./Html";
export { default as MovePage } from "./MovePage";
export { default as RadioChecked } from "./RadioChecked";
export { default as RadioUnchecked } from "./RadioUnchecked";
export { default as ThreeDotSaving } from "./ThreeDotSaving";
export { default as Vimeo } from "./Vimeo";
export { default as YouTube } from "./YouTube";
export type IconName =
    | GeneratedIconName
    | "BallTriangle"
    | "CheckboxChecked"
    | "CheckboxUnchecked"
    | "CheckboxIndeterminate"
    | "DextinityIcon"
    | "Html"
    | "MovePage"
    | "RadioChecked"
    | "RadioUnchecked"
    | "ThreeDotSaving"
    | "Vimeo"
    | "YouTube";
