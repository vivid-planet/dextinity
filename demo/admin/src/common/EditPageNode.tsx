import { gql } from "@apollo/client";
import { createEditPageNode } from "@dextinity/cms-admin";
import { SelectField } from "@dextinity/ui-react-final-form";
import type { GQLUserGroup } from "@src/graphql.generated";
import { userGroupOptions } from "@src/userGroups/userGroupOptions";
import { useIntl } from "react-intl";

export type { GQLPageTreeNodeAdditionalFieldsFragment } from "./EditPageNode.generated"; //re-export

export const additionalPageTreeNodeFieldsFragment = {
    fragment: gql`
        fragment PageTreeNodeAdditionalFields on PageTreeNode {
            userGroup
        }
    `,
    name: "PageTreeNodeAdditionalFields",
};

function UserGroupField() {
    const intl = useIntl();
    const options = userGroupOptions.map((option) => {
        const label = intl.formatMessage(option.label);
        return { value: option.value, label, textValue: label };
    });

    return (
        <SelectField<false, GQLUserGroup>
            name="userGroup"
            label={intl.formatMessage({ id: "pageTreeNode.fields.userGroup", defaultMessage: "User group" })}
            options={options}
            defaultValue="all"
            required
        />
    );
}

export const EditPageNode = createEditPageNode({
    disableHideInMenu: false,
    valuesToInput: ({ values }: { values: { userGroup: GQLUserGroup } }) => {
        return {
            userGroup: values.userGroup,
        };
    },
    nodeFragment: additionalPageTreeNodeFieldsFragment,
    additionalFormFields: <UserGroupField />,
});
