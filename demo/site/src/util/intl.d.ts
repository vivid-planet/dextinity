import type { FormatXMLElementFn, IntlShape, MessageDescriptor, PrimitiveType } from "@formatjs/intl";
import type { ReactNode } from "react";

export interface FormattedMessageProps extends Pick<MessageDescriptor, "id" | "defaultMessage" | "description"> {
    values?: Record<string, PrimitiveType | ReactNode | FormatXMLElementFn<ReactNode>>;
}

export declare function FormattedMessage(props: FormattedMessageProps): ReactNode;

export declare function useIntl(): IntlShape<ReactNode>;
