import { create, type ThemeVars } from "storybook/theming";

import DextinityLogo from "./assets/dextinity-logo-header.svg";

export default create({
    base: "light",
    brandTitle: "Dextinity",
    brandUrl: "https://github.com/vivid-planet/dextinity",
    brandImage: DextinityLogo,
}) as ThemeVars;
