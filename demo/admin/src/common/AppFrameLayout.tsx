import { useStoredState } from "@dextinity/admin";
import { DextinityLogo } from "@dextinity/admin-icons";
import { AppFrame, BuildEntry } from "@dextinity/cms-admin";
import type { ThemeColorScheme, ThemeDensity } from "@dextinity/ui";
import type { PropsWithChildren } from "react";
import { useIntl } from "react-intl";

import { useAppMasterMenuData } from "./MasterMenu";

const logoMarkViewBox = "0 0 225 250";

export function AppFrameLayout({ children }: PropsWithChildren) {
    const intl = useIntl();
    const menu = useAppMasterMenuData();
    const [colorScheme, setColorScheme] = useStoredState<ThemeColorScheme>("demo-admin-color-scheme", "light");
    const [density, setDensity] = useStoredState<ThemeDensity>("demo-admin-density", "standard");
    const logoVariant = colorScheme === "light" ? "dark" : "light";

    return (
        <AppFrame
            menu={menu}
            title={intl.formatMessage({ id: "appFrame.title", defaultMessage: "Demo" })}
            subtitle={intl.formatMessage({ id: "appFrame.subtitle", defaultMessage: "Dextinity · Development" })}
            logo={<DextinityLogo variant={logoVariant} sx={{ fontSize: 26 }} />}
            logoMark={<DextinityLogo variant={logoVariant} viewBox={logoMarkViewBox} sx={{ fontSize: 26, width: "0.9em" }} />}
            colorScheme={colorScheme}
            onColorSchemeChange={setColorScheme}
            density={density}
            onDensityChange={setDensity}
            topBarActions={<BuildEntry />}
            scopeDimensionLabels={{
                domain: intl.formatMessage({ id: "appFrame.scope.domain", defaultMessage: "Site" }),
                language: intl.formatMessage({ id: "appFrame.scope.language", defaultMessage: "Language" }),
            }}
        >
            {children}
        </AppFrame>
    );
}
