import { Chip, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import type { MouseEvent } from "react";
import { FormattedMessage } from "react-intl";

import { MarkedMatches } from "../../common/MarkedMatches";
import { usePageTreeConfig } from "../pageTreeConfig";
import { PageTypeIcon } from "./PageTypeIcon";
import type { PageTreePage } from "./usePageTree";

interface PageLabelProps {
    page: PageTreePage;
    disabled?: boolean;
    onClick?: (e: MouseEvent) => void;
}

const PageLabel = ({ page, disabled, onClick }: PageLabelProps) => {
    const { documentTypes } = usePageTreeConfig();
    const documentType = documentTypes[page.documentType];
    const pathMatches = page.matches.filter((match) => match.where === "path");

    return (
        <Root onClick={onClick}>
            <PageTypeIcon page={page} disabled={disabled} />
            <LinkContent>
                <LinkText color={page.visibility === "Unpublished" || disabled ? "textSecondary" : "textPrimary"}>
                    <MarkedMatches text={page.name} matches={page.matches.filter((match) => match.where === "name")} />
                </LinkText>
                {pathMatches.length > 0 && (
                    <LinkText color={page.visibility === "Unpublished" || disabled ? "textSecondary" : "textPrimary"}>
                        <MarkedMatches text={page.path} matches={pathMatches} />
                    </LinkText>
                )}
                {page.visibility === "Archived" && (
                    <ArchivedChip
                        component="span"
                        label={<FormattedMessage id="dextinity.pages.pages.archived" defaultMessage="Archived" />}
                        color="primary"
                        clickable={false}
                        size="small"
                    />
                )}
            </LinkContent>
            {documentType.InfoTag !== undefined && (
                <InfoPanel>
                    <documentType.InfoTag page={page} />
                </InfoPanel>
            )}
        </Root>
    );
};

export default PageLabel;

const InfoPanel = styled("div")`
    margin-left: 20px;
`;

const Root = styled("div")`
    display: flex;
    align-items: center;
`;

const LinkContent = styled("div")`
    margin-left: ${({ theme }) => theme.spacing(2)};
    display: flex;
    min-width: 0;
    flex-direction: column;
`;

const LinkText = styled(Typography)`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const ArchivedChip = styled(Chip)`
    margin-left: ${({ theme }) => theme.spacing(2)};
    cursor: inherit;
` as typeof Chip;
