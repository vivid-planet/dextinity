import { CancelButton, Dialog, OkayButton, SelectField } from "@dextinity/admin";
import { Account } from "@dextinity/admin-icons";
import { DialogActions, DialogContent, ListItemIcon, MenuItem } from "@mui/material";
import type { GQLUserGroup } from "@src/graphql.generated";
import { type JSX, useState } from "react";
import { Form } from "react-final-form";
import { FormattedMessage } from "react-intl";

import { userGroupOptions } from "./userGroupOptions";

interface UserGroupItem {
    userGroup: GQLUserGroup;
}

interface Props<Item extends UserGroupItem> {
    item: Item;
    onChange: (item: Item) => void;
    onMenuClose: () => void;
}

function UserGroupContextMenuItem<Item extends UserGroupItem>({ item, onChange, onMenuClose }: Props<Item>): JSX.Element {
    const [dialogOpen, setDialogOpen] = useState(false);

    interface FormValues {
        userGroup: GQLUserGroup;
    }

    const handleSubmit = (values: FormValues) => {
        onChange({ ...item, userGroup: values.userGroup });
        setDialogOpen(false);
        onMenuClose();
    };

    return (
        <>
            <MenuItem
                onClick={() => {
                    setDialogOpen(true);
                }}
            >
                <ListItemIcon>
                    <Account />
                </ListItemIcon>
                <FormattedMessage id="pageContentBlock.userGroup.menuItem" defaultMessage="Visibility rules" />
            </MenuItem>
            <Dialog
                open={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    onMenuClose();
                }}
                title={<FormattedMessage id="pageContentBlock.userGroup.dialogTitle" defaultMessage="Visibility rules" />}
            >
                <Form<FormValues> onSubmit={handleSubmit} initialValues={{ userGroup: item.userGroup }}>
                    {({ handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                            <DialogContent>
                                <SelectField name="userGroup" fullWidth required>
                                    {userGroupOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </SelectField>
                            </DialogContent>
                            <DialogActions>
                                <CancelButton
                                    onClick={() => {
                                        setDialogOpen(false);
                                        onMenuClose();
                                    }}
                                />
                                <OkayButton type="submit" />
                            </DialogActions>
                        </form>
                    )}
                </Form>
            </Dialog>
        </>
    );
}

export { UserGroupContextMenuItem };
