import { Chip } from "@mui/material";
import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

export const ArchivedTag = () => {
    return <StyledChip color="primary" label={<FormattedMessage id="dextinity.pages.dam.tag.archived" defaultMessage="Archived" />} />;
};

const StyledChip = styled(Chip)`
    margin-left: 10px;
`;
