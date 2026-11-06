import { Button, Dialog } from "@dextinity/ui";
import { focusOnError, InputField } from "@dextinity/ui-react-final-form";
import { FORM_ERROR } from "final-form";
import { useEffect, useId } from "react";
import { Form, useForm } from "react-final-form";
import { useIntl } from "react-intl";

interface NewFolderFormValues {
    name: string;
}

interface DamFinderNewFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Creates the folder and resolves to an error message when that failed. */
    onCreate: (name: string) => Promise<string | undefined>;
}

function RestartFormWhenOpened({ open }: { open: boolean }) {
    const form = useForm();
    useEffect(() => {
        if (open) {
            form.restart();
        }
    }, [open, form]);
    return null;
}

export function DamFinderNewFolderDialog({ open, onOpenChange, onCreate }: DamFinderNewFolderDialogProps) {
    const intl = useIntl();
    const formId = useId();

    const create = async ({ name }: NewFolderFormValues) => {
        const errorMessage = await onCreate(name.trim());
        return errorMessage != null ? { [FORM_ERROR]: errorMessage } : undefined;
    };

    const validateBlankName = (value: string | undefined) =>
        value != null && value !== "" && value.trim() === ""
            ? intl.formatMessage({ id: "dextinity.damFinder.newFolder.nameBlank", defaultMessage: "Enter a name" })
            : undefined;

    return (
        <Form<NewFolderFormValues> onSubmit={create} decorators={[focusOnError]}>
            {({ handleSubmit, submitting }) => (
                <Dialog
                    open={open}
                    onOpenChange={onOpenChange}
                    title={intl.formatMessage({ id: "dextinity.damFinder.newFolder.title", defaultMessage: "New folder" })}
                    size="small"
                    footer={
                        <>
                            <Button variant="outlined" color="secondary" onClick={() => onOpenChange(false)}>
                                {intl.formatMessage({ id: "dextinity.damFinder.newFolder.cancel", defaultMessage: "Cancel" })}
                            </Button>
                            <Button type="submit" form={formId} loading={submitting}>
                                {intl.formatMessage({ id: "dextinity.damFinder.newFolder.create", defaultMessage: "Create" })}
                            </Button>
                        </>
                    }
                    labels={{ close: intl.formatMessage({ id: "dextinity.damFinder.newFolder.close", defaultMessage: "Close" }) }}
                >
                    <RestartFormWhenOpened open={open} />
                    <form id={formId} onSubmit={handleSubmit} noValidate>
                        <InputField
                            name="name"
                            label={intl.formatMessage({ id: "dextinity.damFinder.newFolder.name", defaultMessage: "Name" })}
                            required
                            requiredMessage={intl.formatMessage({ id: "dextinity.damFinder.newFolder.nameRequired", defaultMessage: "Enter a name" })}
                            validate={validateBlankName}
                        />
                    </form>
                </Dialog>
            )}
        </Form>
    );
}
