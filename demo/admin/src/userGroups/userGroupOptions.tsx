import type { GQLUserGroup } from "@src/graphql.generated";
import { defineMessages, type MessageDescriptor } from "react-intl";

const userGroupMessages = defineMessages({
    all: { id: "userGroupOptions.All", defaultMessage: "Show for all" },
    editor: { id: "userGroupOptions.Editor", defaultMessage: "Show only for group: Editor" },
    admin: { id: "userGroupOptions.Admin", defaultMessage: "Show only for group: Admin" },
});

const userGroupOptions: Array<{ value: GQLUserGroup; label: MessageDescriptor }> = [
    { value: "all", label: userGroupMessages.all },
    { value: "editor", label: userGroupMessages.editor },
    { value: "admin", label: userGroupMessages.admin },
];

export { userGroupOptions };
