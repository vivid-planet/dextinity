import { Dialog, DialogFormActions, Icon, MenuItem } from "@dextinity/ui";
import { SelectField } from "@dextinity/ui-react-final-form";
import type { GQLUserGroup } from "@src/graphql.generated";
import { type JSX, useId } from "react";
import { Form } from "react-final-form";
import { useIntl } from "react-intl";

import { userGroupOptions } from "./userGroupOptions";

interface UserGroupItem {
    key: string;
    visible: boolean;
    type?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props: any;
    userGroup: GQLUserGroup;
}

interface Props {
    item: UserGroupItem;
    onChange: (item: UserGroupItem) => void;
    openDialog: (renderDialog: (close: () => void) => JSX.Element) => void;
}

function UserGroupContextMenuItem({ item, onChange, openDialog }: Props): JSX.Element {
    const intl = useIntl();

    return (
        <MenuItem
            label={intl.formatMessage({ id: "pageContentBlock.userGroup.menuItem", defaultMessage: "Visibility rules" })}
            icon={<Icon name="checklist" />}
            onClick={() => openDialog((close) => <UserGroupDialog item={item} onChange={onChange} onClose={close} />)}
        />
    );
}

interface FormValues {
    userGroup: GQLUserGroup;
}

interface UserGroupDialogProps {
    item: UserGroupItem;
    onChange: (item: UserGroupItem) => void;
    onClose: () => void;
}

function UserGroupDialog({ item, onChange, onClose }: UserGroupDialogProps) {
    const intl = useIntl();
    const formId = useId();

    const options = userGroupOptions.map((option) => {
        const label = intl.formatMessage(option.label);
        return { value: option.value, label, textValue: label };
    });

    return (
        <Dialog
            open
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
            title={intl.formatMessage({ id: "pageContentBlock.userGroup.dialogTitle", defaultMessage: "Visibility rules" })}
            footer={
                <DialogFormActions
                    formId={formId}
                    submitLabel={intl.formatMessage({ id: "pageContentBlock.userGroup.apply", defaultMessage: "Apply" })}
                    onCancel={onClose}
                    labels={{ cancel: intl.formatMessage({ id: "pageContentBlock.userGroup.cancel", defaultMessage: "Cancel" }) }}
                />
            }
        >
            <Form<FormValues>
                onSubmit={(values) => {
                    onChange({ ...item, userGroup: values.userGroup });
                    onClose();
                }}
                initialValues={{ userGroup: item.userGroup }}
            >
                {({ handleSubmit }) => (
                    <form id={formId} onSubmit={handleSubmit}>
                        <SelectField<false, GQLUserGroup>
                            name="userGroup"
                            label={intl.formatMessage({ id: "pageContentBlock.userGroup.label", defaultMessage: "Show block for" })}
                            options={options}
                            required
                        />
                    </form>
                )}
            </Form>
        </Dialog>
    );
}

export { UserGroupContextMenuItem };
