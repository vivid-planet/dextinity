// Inspired by https://gist.github.com/erikras/9607902abb1df1e7991c0bd83abdc4b4#file-whenfieldchanges-js
import { OnChangeField } from "@dextinity/admin";
import { Field } from "react-final-form";

interface Props<TSourceFieldValue, TTargetFieldValue> {
    sourceField: string;
    targetField: string;
    onChange: (value: TSourceFieldValue) => TTargetFieldValue;
}

function SyncFields<TSourceFieldValue, TTargetFieldValue>({
    sourceField,
    targetField,
    onChange: changeHandler,
}: Props<TSourceFieldValue, TTargetFieldValue>) {
    return (
        <Field name={targetField} subscription={{}}>
            {(
                // No subscription. We only use Field to get to the change function
                { input: { onChange } },
            ) => (
                <OnChangeField name={sourceField}>
                    {(value) => {
                        onChange(changeHandler(value));
                    }}
                </OnChangeField>
            )}
        </Field>
    );
}

export { SyncFields };
