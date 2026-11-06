import { Button, Icon, IconButton, Panel } from "@dextinity/ui";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import { useFieldArray, useWatch } from "react-hook-form";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { InputField } from "../inputField/InputField";
import { SelectField } from "../selectField/SelectField";
import { reactHookFormDecorator } from "../storybook/ReactHookFormStoryFrame";
import { SwitchField } from "../switchField/SwitchField";

interface Address {
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
    const { fields, append, remove } = useFieldArray<CustomerFormValues, "addresses">({ name: "addresses" });

    return (
        <Panel title="Addresses">
            <div style={groupStyle}>
                {fields.map((address, index) => (
                    <div key={address.id} role="group" aria-label={`Address ${index + 1}`} style={groupStyle}>
                        <InputField<CustomerFormValues, `addresses.${number}.street`>
                            name={`addresses.${index}.street`}
                            label="Street"
                            required
                            requiredMessage="Enter a street"
                        />
                        <div style={rowStyle}>
                            <InputField<CustomerFormValues, `addresses.${number}.city`>
                                name={`addresses.${index}.city`}
                                label="City"
                                required
                                requiredMessage="Enter a city"
                            />
                            <SelectField<false, string, CustomerFormValues, `addresses.${number}.country`>
                                name={`addresses.${index}.country`}
                                label="Country"
                                options={countries}
                            />
                            <IconButton
                                variant="text"
                                color="secondary"
                                aria-label={`Remove address ${index + 1}`}
                                disabled={fields.length === 1}
                                onClick={() => remove(index)}
                            >
                                <Icon name="delete" />
                            </IconButton>
                        </div>
                    </div>
                ))}
                <div>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Icon name="plus" />}
                        onClick={() => append({ street: "", city: "", country: null }, { shouldFocus: false })}
                    >
                        Add address
                    </Button>
                </div>
            </div>
        </Panel>
    );
}

function BillingAddress() {
    const separateBillingAddress = useWatch<CustomerFormValues, "separateBillingAddress">({ name: "separateBillingAddress" });

    return (
        <Panel title="Billing">
            <div style={groupStyle}>
                <SwitchField<CustomerFormValues, "separateBillingAddress"> name="separateBillingAddress" description="Invoices go to a company">
                    Bill a company
                </SwitchField>
                {separateBillingAddress && (
                    <div role="group" aria-label="Company" style={groupStyle}>
                        <InputField<CustomerFormValues, "billing.company">
                            name="billing.company"
                            label="Company"
                            required
                            requiredMessage="Enter the company"
                            shouldUnregister
                        />
                        <InputField<CustomerFormValues, "billing.vatId">
                            name="billing.vatId"
                            label="VAT ID"
                            placeholder="ATU12345678"
                            shouldUnregister
                        />
                    </div>
                )}
            </div>
        </Panel>
    );
}

const meta = {
    title: "Forms/React Hook Form/Field arrays",
    decorators: [reactHookFormDecorator],
    parameters: {
        initialValues: {
            addresses: [{ street: "Example Street 1", city: "Salzburg", country: "AT" }],
            separateBillingAddress: false,
        } satisfies CustomerFormValues,
    },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Rows of fields and groups shown on a condition need nothing special: the adapters take any path as `name`, e.g.
 * `addresses.1.street`, checked against the form values' type.
 *
 * - **Rows**: use React Hook Form's `useFieldArray` and key the rows by its `id`, not the index. `append`, `remove`, and `move` keep the
 *   touched and error states with the rows.
 * - **Conditional groups**: an unmounted adapter keeps its value and its rules don't run. Pass `shouldUnregister` to remove the value
 *   (and the rules) while the group is hidden.
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
        await expect(await second.findByText("Enter a street")).toBeVisible();
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
        await expect(submitted).not.toHaveTextContent("billing");
    },
};
