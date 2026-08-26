import { gql } from "@apollo/client";
import { SelectField } from "@dextinity/admin";
import { createEditPageNode } from "@dextinity/cms-admin";
import { Box, Divider, MenuItem } from "@mui/material";
import { FormattedMessage } from "react-intl";

export type { GQLPageTreeNodeAdditionalFieldsFragment } from "./EditPageNode.generated"; //re-export

const userGroupOptions = [
    {
        label: "Show for all",
        value: "all",
    },
    {
        label: "Show only for Group: User",
        value: "user",
    },
    {
        label: "Show only for Group: Admin",
        value: "admin",
    },
];

export const additionalPageTreeNodeFieldsFragment = {
    fragment: gql`
        fragment PageTreeNodeAdditionalFields on PageTreeNode {
            userGroup
        }
    `,
    name: "PageTreeNodeAdditionalFields",
};

export const EditPageNode = createEditPageNode({
    disableHideInMenu: false,
    valuesToInput: ({ values }: { values: { userGroup: string } }) => {
        return {
            userGroup: values.userGroup,
        };
    },
    nodeFragment: additionalPageTreeNodeFieldsFragment,
    additionalFormFields: (
        <>
            <Box marginY={6}>
                <Divider />
            </Box>
            <SelectField
                label={<FormattedMessage id="pageTreeNode.fields.userGroup" defaultMessage="User-Group" />}
                name="userGroup"
                variant="horizontal"
                fullWidth
            >
                {userGroupOptions.map((option) => (
                    <MenuItem value={option.value} key={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </SelectField>
        </>
    ),
});
