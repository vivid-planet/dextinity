import { Save } from "@dextinity/admin-icons";
import { DialogActions, DialogContent, DialogContentText, type DialogProps } from "@mui/material";
import { Form } from "react-final-form";

import { Button } from "../../common/buttons/Button";
import { CancelButton } from "../../common/buttons/cancel/CancelButton";
import { OkayButton } from "../../common/buttons/okay/OkayButton";
import { Dialog } from "../../common/Dialog";
import { CheckboxField } from "../../form/fields/CheckboxField";
import { SelectField } from "../../form/fields/SelectField";
import { TextField } from "../../form/fields/TextField";

type DialogSize = Exclude<DialogProps["maxWidth"], false> | "fullWidth" | "fullScreen";

type DialogSizeOptions = {
    [label: string]: DialogSize;
};

const dialogSizeOptions: DialogSizeOptions = {
    "XS (350px)": "xs",
    "SM (680px)": "sm",
    "MD (1024px)": "md",
    "LG (1280px)": "lg",
    "XL (1920px)": "xl",
    FullWidth: "fullWidth",
    FullScreen: "fullScreen",
};

const selectOptions = [
    { value: "chocolate", label: "Chocolate" },
    { value: "strawberry", label: "Strawberry" },
    { value: "vanilla", label: "Vanilla" },
];

export default {
    title: "components/mui/Dialog",
    args: {
        selectedDialogSize: "sm",
        selectedDialogTitle: "Dialog Title Example",
        selectedDialogOnClose: null,
    },
    argTypes: {
        selectedDialogSize: {
            name: "Dialog Size",
            control: "select",
            options: dialogSizeOptions,
        },
        selectedDialogTitle: {
            name: "Dialog Title",
            control: "select",
            options: {
                "Dialog Title Example": "Dialog Title Example",
                "Really long dialog title":
                    "Really long dialog title that is really long and takes up a lot of space because of all the words that are used in this title of the dialog you are seeing here in the storybook example inside Dextinity that is used to test the dialog title",
                None: "",
            },
        },
        selectedDialogOnClose: {
            name: "Dialog onClose",
            control: "select",
            options: {
                "No callback": null,
                "Provided callback": "callback",
            },
        },
    },
};

type Args = {
    selectedDialogSize: DialogSize;
    selectedDialogTitle: string;
    selectedDialogOnClose: string;
};

export const _Dialog = {
    render: ({ selectedDialogSize, selectedDialogTitle, selectedDialogOnClose }: Args) => {
        return (
            <div>
                <Form
                    onSubmit={() => {}}
                    initialValues={{
                        dialogSize: "sm",
                    }}
                    render={({ handleSubmit }) => (
                        <form onSubmit={handleSubmit}>
                            <Dialog
                                title={selectedDialogTitle}
                                onClose={selectedDialogOnClose === "callback" ? () => console.log("Dialog closed") : undefined}
                                open={true}
                                fullWidth={selectedDialogSize === "fullWidth"}
                                fullScreen={selectedDialogSize === "fullScreen"}
                                maxWidth={selectedDialogSize !== "fullWidth" && selectedDialogSize !== "fullScreen" && selectedDialogSize}
                            >
                                <>{selectedDialogSize === "xs" ? <ConfirmationDialogContent /> : <DefaultDialogContent />}</>
                            </Dialog>
                        </form>
                    )}
                />
            </div>
        );
    },
};

function ConfirmationDialogContent() {
    return (
        <DialogActions>
            <CancelButton />
            <OkayButton />
        </DialogActions>
    );
}

function DefaultDialogContent() {
    return (
        <>
            <DialogContent>
                <DialogContentText>
                    Lorem ipsum nullam quis risus eget urna mollis ornare vel eu leo. Nullam id dolor id nibh ultricies vehicula ut id elit. Vivamus
                    sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Curabitur blandit tempus porttitor.
                </DialogContentText>
                <TextField name="text" label="Textfield" fullWidth />
                <SelectField name="select" label="Select" fullWidth options={selectOptions} />
                <CheckboxField name="checked" label="Checkbox" fullWidth />
            </DialogContent>
            <DialogActions>
                <CancelButton />
                <Button startIcon={<Save />}>Save</Button>
            </DialogActions>
        </>
    );
}
