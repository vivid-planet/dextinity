import { Button, Icon, IconButton, Panel } from "@dextinity/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { useForm, useFormState } from "react-final-form";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { InputField } from "../inputField/InputField";
import { SelectField } from "../selectField/SelectField";
import { finalFormDecorator } from "../storybook/FinalFormStoryFrame";
import { SwitchField } from "../switchField/SwitchField";

interface Address {
    id: string;
    street: string;
    city: string;
    country: string | null;
}

interface CustomerFormValues {
    addresses: Address[];
    separateBillingAddress: boolean;
    billing?: { company: string; vatId: string };
}

const countries = [
    { value: "AT", label: "Austria" },
    { value: "DE", label: "Germany" },
    { value: "CH", label: "Switzerland" },
];

const rowStyle: CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "var(--dextinity-space-3)", alignItems: "start" };
const groupStyle: CSSProperties = { display: "grid", gap: "var(--dextinity-space-4)" };

function Addresses() {
    const form = useForm<CustomerFormValues>();
    const { values } = useFormState<CustomerFormValues>({ subscription: { values: true } });
    const addresses = values.addresses ?? [];

    return (
        <Panel title="Addresses">
            <div style={groupStyle}>
                {addresses.map((address, index) => (
                    <div key={address.id} role="group" aria-label={`Address ${index + 1}`} style={groupStyle}>
                        <InputField name={`addresses[${index}].street`} label="Street" required requiredMessage="Enter a street" />
                        <div style={rowStyle}>
                            <InputField name={`addresses[${index}].city`} label="City" required requiredMessage="Enter a city" />
                            <SelectField name={`addresses[${index}].country`} label="Country" options={countries} />
                            <IconButton
                                aria-label={`Remove address ${index + 1}`}
                                disabled={addresses.length === 1}
                                onClick={() =>
                                    form.change(
                                        "addresses",
                                        addresses.filter((other) => other.id !== address.id),
                                    )
                                }
                            >
                                <Icon name="trash" />
                            </IconButton>
                        </div>
                    </div>
                ))}
                <div>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Icon name="plus" />}
                        onClick={() => form.change("addresses", [...addresses, { id: crypto.randomUUID(), street: "", city: "", country: null }])}
                    >
                        Add address
                    </Button>
                </div>
            </div>
        </Panel>
    );
}

function BillingAddress() {
    const { values } = useFormState<CustomerFormValues>({ subscription: { values: true } });

    return (
        <Panel title="Billing">
            <div style={groupStyle}>
                <SwitchField name="separateBillingAddress" description="Invoices go to a company">
                    Bill a company
                </SwitchField>
                {values.separateBillingAddress && (
                    <div role="group" aria-label="Company" style={groupStyle}>
                        <InputField name="billing.company" label="Company" required requiredMessage="Enter the company" />
                        <InputField name="billing.vatId" label="VAT ID" placeholder="ATU12345678" />
                    </div>
                )}
            </div>
        </Panel>
    );
}

const meta = {
    title: "Forms/Final Form/Field arrays",
    decorators: [finalFormDecorator],
    parameters: {
        initialValues: {
            addresses: [{ id: "office", street: "Example Street 1", city: "Salzburg", country: "AT" }],
            separateBillingAddress: false,
        } satisfies CustomerFormValues,
    },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Rows of fields and groups shown on a condition need nothing special: the adapters take any path as `name`, e.g.
 * `addresses[1].street`, and validate while they are mounted.
 *
 * - **Rows**: render one set of adapters per item, keyed by a stable id, not the index. Add and remove items with `form.change`, or use
 *   `FieldArray` and the `push`/`remove` mutators of `react-final-form-arrays`, which also move the touched and error states with the rows.
 * - **Conditional groups**: an unmounted adapter stops validating, so a hidden required field doesn't block submitting. Its value stays
 *   in the form values; remove it in `onSubmit` (or with `form.change(name, undefined)`) when hidden values must not be saved.
 */
export const AddressesAndConditionalGroup: Story = {
    render: () => (
        <>
            <Addresses />
            <BillingAddress />
        </>
    ),
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await userEvent.click(canvas.getByRole("button", { name: "Add address" }));
        const second = within(canvas.getByRole("group", { name: "Address 2" }));
        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        await expect(second.getByText("Enter a street")).toBeVisible();
        await waitFor(() => expect(second.getByLabelText("Street")).toHaveFocus());

        await userEvent.type(second.getByLabelText("Street"), "Sample Road 5");
        await userEvent.type(second.getByLabelText("City"), "Vienna");

        await userEvent.click(canvas.getByRole("switch", { name: /Bill a company/ }));
        await expect(within(canvas.getByRole("group", { name: "Company" })).getByRole("textbox", { name: /Company/ })).toBeVisible();
        await userEvent.click(canvas.getByRole("switch", { name: /Bill a company/ }));

        await userEvent.click(canvas.getByRole("button", { name: "Remove address 1" }));
        await expect(canvas.queryByRole("group", { name: "Address 2" })).not.toBeInTheDocument();

        await userEvent.click(canvas.getByRole("button", { name: "Submit" }));
        const submitted = await canvas.findByRole("status");
        await expect(submitted).toHaveTextContent('"street":"Sample Road 5","city":"Vienna"');
        await expect(submitted).not.toHaveTextContent("Example Street 1");
    },
};
