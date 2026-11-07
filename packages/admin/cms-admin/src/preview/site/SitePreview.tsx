import { gql, useQuery } from "@apollo/client";
import { DextinityIcon } from "@dextinity/admin-icons";
import { Icon, IconButton, Theme, type ThemeBrand, type ThemeColorScheme, type ThemeDensity, Tooltip, Typography } from "@dextinity/ui";
import { type ReactNode, useCallback, useState } from "react";
import { useIntl } from "react-intl";
import { type RouteComponentProps, useHistory, useLocation } from "react-router";

import type { ExternalLinkBlockData } from "../../blocks.generated";
import { type ContentScope, useContentScope } from "../../contentScope/Provider";
import { useSiteConfig } from "../../siteConfigs/useSiteConfig";
import { parsePreviewDevice, previewDevices } from "../common/previewDevice";
import { usePreviewLabels } from "../common/usePreviewLabels";
import { VisibilityToggle } from "../common/VisibilityToggle";
import { type SitePrevewIFrameLocationMessage, SitePreviewIFrameMessageType } from "./iframebridge/SitePreviewIFrameMessage";
import { useSitePreviewIFrameBridge } from "./iframebridge/useSitePreviewIFrameBridge";
import { OpenLinkDialog } from "./OpenLinkDialog";
import type { GQLSitePreviewJwtQuery } from "./SitePreview.generated";
import { Header, PreviewArea, Root, SiteInformation } from "./SitePreview.sc";

//TODO v4 remove RouteComponentProps
interface Props extends RouteComponentProps {
    resolvePath?: (path: string, scope: ContentScope) => string;
    logo?: ReactNode;
    /**
     * The color scheme of the preview window, which is opened outside of the `AppFrame`, e.g. the one the user chose in the admin.
     *
     * @defaultValue `"light"`
     */
    colorScheme?: ThemeColorScheme;
    brand?: ThemeBrand;
    density?: ThemeDensity;
}

function useSearchState<ParseFunction extends (value: string | undefined) => ReturnType<ParseFunction>>(
    name: string,
    parseValue: ParseFunction,
): [ReturnType<ParseFunction>, (value: string) => void] {
    const history = useHistory();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const strValue = queryParams.get(name);
    const value = parseValue(strValue !== null ? strValue : undefined);
    const setValue = useCallback(
        (newValue: string) => {
            const newQueryParams = new URLSearchParams(location.search);
            newQueryParams.set(name, newValue);
            history.replace({ search: newQueryParams.toString() });
        },
        [location.search, history, name],
    );
    return [value, setValue];
}
function SitePreview({ resolvePath, logo = <DextinityIcon sx={{ fontSize: 24 }} />, colorScheme, brand, density }: Props) {
    const { scope } = useContentScope();
    const siteConfig = useSiteConfig({ scope });
    const labels = usePreviewLabels();

    //initialPath: path the preview is initialized with; WITHOUT resolvePath called, might be not the path actually used in site
    //doesn't change during navigation within site
    const [initialPath] = useSearchState("path", (v) => v ?? "");

    //sitePath: actual path of site, initialized with initialPath + resolvePath
    //use case for resolvePath: i18n urls, for example `/${scope.language}${path}`;
    //changes during navigation within site (iframe bridge reports new path)
    const [sitePath, setSitePath] = useSearchState("sitePath", (v) => {
        if (!v) {
            v = resolvePath ? resolvePath(initialPath, scope) : initialPath;
        }
        const url = new URL(v, siteConfig.url); // prevents phishing attacks (exception see next line)
        if (!url.pathname.startsWith("/") || url.pathname.startsWith("//")) {
            return "/";
        }
        return url.pathname;
    });

    //iframePath: path set for iframe
    //needed to prevent the iframe from reloading on every change
    //doesn't change during navigation within site
    //changed when settings (showOnlyVisible) change
    const [iframePath, setIframePath] = useState(sitePath);
    const [reloadCount, setReloadCount] = useState(0);

    const [device, setDevice] = useSearchState("device", parsePreviewDevice);
    const [showOnlyVisible, setShowOnlyVisible] = useSearchState("showOnlyVisible", (v) => !v || v === "true");

    const [linkToOpen, setLinkToOpen] = useState<ExternalLinkBlockData | undefined>(undefined);

    const intl = useIntl();

    // the site in the iframe notifies us about it's current location
    // we sync the location back to our admin-url, so we have it and can reload the page without loosing
    const handlePreviewLocationChange = useCallback(
        (message: SitePrevewIFrameLocationMessage) => {
            if (sitePath !== message.data.pathname) {
                setSitePath(message.data.pathname);
            }
        },
        [sitePath, setSitePath],
    );

    const reload = () => {
        setIframePath(sitePath);
        setReloadCount((count) => count + 1);
        refetch();
    };

    const handleShowOnlyVisibleChange = (newShowOnlyVisible: boolean) => {
        setShowOnlyVisible(String(newShowOnlyVisible));
        reload();
    };

    const siteLink = `${siteConfig.url}${sitePath}`;

    useSitePreviewIFrameBridge((message) => {
        switch (message.dextinityType) {
            case SitePreviewIFrameMessageType.OpenLink:
                setLinkToOpen(message.data.link);
                break;
            case SitePreviewIFrameMessageType.SitePreviewLocation:
                handlePreviewLocationChange(message);
                break;
        }
    });

    const { data, error, refetch } = useQuery<GQLSitePreviewJwtQuery>(
        gql`
            query SitePreviewJwt($scope: JSONObject!, $path: String!, $includeInvisible: Boolean!) {
                sitePreviewJwt(scope: $scope, path: $path, includeInvisible: $includeInvisible)
            }
        `,
        {
            fetchPolicy: "network-only",
            variables: {
                scope,
                path: iframePath,
                includeInvisible: showOnlyVisible ? false : true,
            },
            pollInterval: 1000 * 60 * 60 * 24, // due to expiration time of jwt
        },
    );
    if (error) {
        throw new Error(error.message);
    }

    const iframeUrl = data ? `${siteConfig.sitePreviewApiUrl}?${new URLSearchParams({ jwt: data.sitePreviewJwt }).toString()}` : undefined;
    const preloginMessage = intl.formatMessage({
        id: "dextinity.sitePreview.sitePreloginEnabledMessage",
        defaultMessage: "Site is not yet publicly available",
    });

    return (
        <Theme colorScheme={colorScheme} brand={brand} density={density}>
            <Root>
                <Header>
                    <SiteInformation>
                        {logo}
                        <Typography variant="section" element="h1">
                            {intl.formatMessage({ id: "dextinity.sitePreview.preview", defaultMessage: "Preview" })}
                        </Typography>
                        {siteConfig.preloginEnabled && (
                            <Tooltip content={preloginMessage}>
                                <Icon name="domain-locked" aria-label={preloginMessage} tabIndex={0} />
                            </Tooltip>
                        )}
                    </SiteInformation>
                </Header>
                <PreviewArea
                    key={reloadCount}
                    url={siteLink}
                    src={iframeUrl}
                    loading={iframeUrl == null ? true : undefined}
                    device={device}
                    onDeviceChange={setDevice}
                    devices={previewDevices}
                    labels={labels}
                    actions={
                        <>
                            <VisibilityToggle showOnlyVisible={showOnlyVisible} onChange={handleShowOnlyVisibleChange} />
                            <IconButton
                                variant="text"
                                color="secondary"
                                size="small"
                                aria-label={intl.formatMessage({ id: "dextinity.sitePreview.reload", defaultMessage: "Reload" })}
                                onClick={reload}
                            >
                                <Icon name="reload" />
                            </IconButton>
                            <IconButton
                                variant="text"
                                color="secondary"
                                size="small"
                                aria-label={intl.formatMessage({ id: "dextinity.sitePreview.openOnSite", defaultMessage: "Open on site" })}
                                onClick={() => window.open(siteLink, "_blank", "noopener,noreferrer")}
                            >
                                <Icon name="open-new-tab" />
                            </IconButton>
                        </>
                    }
                />
                <OpenLinkDialog open={linkToOpen != null} onClose={() => setLinkToOpen(undefined)} link={linkToOpen} />
            </Root>
        </Theme>
    );
}

export { SitePreview };
