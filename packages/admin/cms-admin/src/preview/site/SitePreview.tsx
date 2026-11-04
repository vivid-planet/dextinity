import { gql, useQuery } from "@apollo/client";
import { Tooltip } from "@dextinity/admin";
import { DextinityIcon, Domain, DomainLocked } from "@dextinity/admin-icons";
import { Grid, Typography } from "@mui/material";
import { type ReactNode, useCallback, useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { type RouteComponentProps, useHistory, useLocation } from "react-router";

import type { ExternalLinkBlockData } from "../../blocks.generated";
import { type ContentScope, useContentScope } from "../../contentScope/Provider";
import { useSiteConfig } from "../../siteConfigs/useSiteConfig";
import { Device } from "../common/Device";
import { DeviceToggle } from "../common/DeviceToggle";
import { IFrameViewer } from "../common/IFrameViewer";
import { VisibilityToggle } from "../common/VisibilityToggle";
import { type SitePrevewIFrameLocationMessage, SitePreviewIFrameMessageType } from "./iframebridge/SitePreviewIFrameMessage";
import { useSitePreviewIFrameBridge } from "./iframebridge/useSitePreviewIFrameBridge";
import { OpenLinkDialog } from "./OpenLinkDialog";
import type { GQLSitePreviewJwtQuery } from "./SitePreview.generated";
import { ActionsContainer, LogoWrapper, Root, SiteInformation, SiteLink, SiteLinkWrapper } from "./SitePreview.sc";

//TODO v4 remove RouteComponentProps
interface Props extends RouteComponentProps {
    resolvePath?: (path: string, scope: ContentScope) => string;
    logo?: ReactNode;
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
function SitePreview({ resolvePath, logo = <DextinityIcon sx={{ fontSize: 32 }} /> }: Props) {
    const { scope } = useContentScope();
    const siteConfig = useSiteConfig({ scope });

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

    const [device, setDevice] = useSearchState("device", (v) => {
        if (![Device.Responsive, Device.Mobile, Device.Tablet, Device.Desktop].includes(Number(v))) {
            return Device.Responsive;
        }
        return Number(v) as Device;
    });
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

    const handleDeviceChange = (newDevice: Device) => {
        setDevice(String(newDevice));
    };

    const handleShowOnlyVisibleChange = () => {
        const newShowOnlyVisible = !showOnlyVisible;
        setShowOnlyVisible(String(newShowOnlyVisible));
        setIframePath(sitePath); //reload iframe with new settings
        refetch();
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
    if (!data) {
        return <div />;
    }

    const initialPageUrl = `${siteConfig.sitePreviewApiUrl}?${new URLSearchParams({ jwt: data.sitePreviewJwt }).toString()}`;

    return (
        <Root>
            <IFrameViewer device={device} initialPageUrl={initialPageUrl} />
            <ActionsContainer>
                <Grid container justifyContent="space-between" alignItems="center" wrap="nowrap">
                    <Grid>
                        <SiteInformation>
                            <LogoWrapper>
                                {logo}
                                <Typography textTransform="uppercase" color="white">
                                    <FormattedMessage defaultMessage="Preview" id="dextinity.sitePreview.preview" />
                                </Typography>
                            </LogoWrapper>
                            <SiteLinkWrapper>
                                {siteConfig.preloginEnabled ? (
                                    <Tooltip
                                        title={intl.formatMessage({
                                            id: "dextinity.sitePreview.sitePreloginEnabledMessage",
                                            defaultMessage: "Site is not yet publicly available",
                                        })}
                                    >
                                        <DomainLocked />
                                    </Tooltip>
                                ) : (
                                    <Domain />
                                )}
                                <SiteLink variant="body1" href={siteLink} target="_blank">
                                    {siteLink}
                                </SiteLink>
                            </SiteLinkWrapper>
                        </SiteInformation>
                    </Grid>
                    <Grid>
                        <DeviceToggle device={device} onChange={handleDeviceChange} />
                    </Grid>
                    <Grid>
                        <VisibilityToggle showOnlyVisible={showOnlyVisible} onChange={handleShowOnlyVisibleChange} />
                    </Grid>
                </Grid>
            </ActionsContainer>
            <OpenLinkDialog
                open={linkToOpen != null}
                onClose={() => {
                    setLinkToOpen(undefined);
                }}
                link={linkToOpen}
            />
        </Root>
    );
}

export { SitePreview };
