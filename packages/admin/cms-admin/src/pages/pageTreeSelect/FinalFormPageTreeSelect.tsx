import type { JSX } from "react";
import type { FieldRenderProps } from "react-final-form";

import { PageTreeSelect } from "./PageTreeSelect";
import type { PageTreeSelectValue } from "./PageTreeSelectDialog";

type Props = FieldRenderProps<PageTreeSelectValue | undefined | null, HTMLDivElement>;

/**
 * The `PageTreeSelect` for the `Field` of `@dextinity/admin`. In forms built with `@dextinity/ui-react-final-form`, use `PageTreeSelectField`.
 */
export default function FinalFormPageTreeSelect({ input }: Props): JSX.Element {
    return <PageTreeSelect value={input.value || null} onChange={input.onChange} />;
}
