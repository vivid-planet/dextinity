import { styled } from "@mui/material/styles";
import { FormattedMessage } from "react-intl";

import { Tag } from "./Tag";

export const ArchivedTag = () => {
    return (
        <StyledTag type="info">
            <FormattedMessage id="dextinity.pages.dam.tag.archived" defaultMessage="Archived" />
        </StyledTag>
    );
};

const StyledTag = styled(Tag)`
    margin-left: 10px;
`;
