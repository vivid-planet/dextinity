import { useStoredState } from "@dextinity/admin";
import { DextinityLogo } from "@dextinity/admin-icons";
import { SitePreview } from "@dextinity/cms-admin";
import type { ThemeColorScheme, ThemeDensity } from "@dextinity/ui";
import type { RouteComponentProps } from "react-router";

const logoMarkViewBox = "0 0 225 250";

export function SitePreviewPage(props: RouteComponentProps) {
    const [colorScheme] = useStoredState<ThemeColorScheme>("demo-admin-color-scheme", "light");
    const [density] = useStoredState<ThemeDensity>("demo-admin-density", "standard");

    return (
        <SitePreview
            {...props}
            resolvePath={(path, scope) => `/${scope.language}${path}`}
            colorScheme={colorScheme}
            density={density}
            logo={
                <DextinityLogo variant={colorScheme === "light" ? "dark" : "light"} viewBox={logoMarkViewBox} sx={{ fontSize: 24, width: "0.9em" }} />
            }
        />
    );
}
