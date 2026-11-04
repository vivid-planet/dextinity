import { useQuery } from "@apollo/client";
import { Loading, MainContent, Toolbar, ToolbarFillSpace, ToolbarItem, ToolbarTitleItem, useStackApi } from "@dextinity/admin";
import { ArrowLeft } from "@dextinity/admin-icons";
import {
    type BlockInterface,
    BlockPreview,
    ContentScopeIndicator,
    IFrameBridgeProvider,
    useBlockContext,
    useBlockPreview,
    useContentScope,
} from "@dextinity/cms-admin";
import { IconButton } from "@mui/material";
import { FormattedMessage } from "react-intl";
import { useRouteMatch } from "react-router";

import { useBrevoConfig } from "../../common/BrevoConfigProvider";
import { emailCampaignViewQuery } from "./EmailCampaignView.gql";
import type { GQLEmailCampaignViewQuery, GQLEmailCampaignViewQueryVariables } from "./EmailCampaignView.gql.generated";

interface EmailCampaignViewProps {
    id: string;
    EmailCampaignContentBlock: BlockInterface;
}

export function EmailCampaignView({ id, EmailCampaignContentBlock }: EmailCampaignViewProps) {
    const stackApi = useStackApi();
    const previewApi = useBlockPreview();
    const blockContext = useBlockContext();
    const match = useRouteMatch();
    const { scope } = useContentScope();
    const { previewUrl } = useBrevoConfig();

    const { data, error, loading } = useQuery<GQLEmailCampaignViewQuery, GQLEmailCampaignViewQueryVariables>(emailCampaignViewQuery, {
        variables: { id },
    });

    if (error) {
        throw error;
    }

    if (loading) {
        return <Loading behavior="fillPageHeight" />;
    }

    if (!data) {
        return null;
    }

    const previewContext = {
        ...blockContext,
        parentUrl: match.url,
        showVisibleOnly: previewApi.showOnlyVisible,
    };

    const previewState = {
        emailCampaignId: id,
        content: EmailCampaignContentBlock.createPreviewState(EmailCampaignContentBlock.input2State(data.brevoEmailCampaign.content), previewContext),
        scope,
    };

    return (
        <>
            <Toolbar scopeIndicator={<ContentScopeIndicator />}>
                <ToolbarItem>
                    <IconButton onClick={stackApi?.goBack}>
                        <ArrowLeft />
                    </IconButton>
                </ToolbarItem>
                <ToolbarTitleItem>
                    <FormattedMessage id="dextinity.emailCampaigns.EmailCampaign" defaultMessage="Email Campaign" />
                </ToolbarTitleItem>
                <ToolbarFillSpace />
            </Toolbar>
            <MainContent fullHeight>
                <IFrameBridgeProvider key={previewUrl}>
                    <BlockPreview url={previewUrl} previewState={previewState} previewApi={previewApi} />
                </IFrameBridgeProvider>
            </MainContent>
        </>
    );
}
