import type { JSX } from "react";
import type { FieldRenderProps } from "react-final-form";

import { PageTreeSelect } from "./PageTreeSelect";
import type { GQLSelectedPageFragment } from "./PageTreeSelectDialog";

type Props = FieldRenderProps<GQLSelectedPageFragment | undefined | null, HTMLDivElement>;

export default function FinalFormPageTreeSelect({ input }: Props): JSX.Element {
    return <PageTreeSelect value={input.value} onChange={input.onChange} />;
}
