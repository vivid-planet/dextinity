// A named import of `cache` fails to load with React 18, which has no `cache`
// eslint-disable-next-line no-restricted-imports
import * as React from "react";
import type {
    FormattedDate,
    FormattedDateTimeRange,
    FormattedDisplayName,
    FormattedDuration,
    FormattedList,
    FormattedNumber,
    FormattedPlural,
    FormattedTime,
} from "react-intl";
import { createIntl, createIntlCache, type IntlConfig, type IntlShape, type MessageDescriptor } from "react-intl/server";

type ServerIntlMessages = IntlConfig["messages"];

type FormatMessageValues = NonNullable<Parameters<IntlShape["formatMessage"]>[1]>;

export interface ServerFormattedMessageProps extends Pick<MessageDescriptor, "id" | "defaultMessage" | "description"> {
    values?: FormatMessageValues;
}

type ServerIntlRef = { current: IntlShape | null };

const intlCache = createIntlCache();

let getServerIntlRefForRequest: (() => ServerIntlRef) | undefined;

function getServerIntlRef(): ServerIntlRef {
    getServerIntlRefForRequest ??= React.cache((): ServerIntlRef => ({ current: null }));
    return getServerIntlRefForRequest();
}

/**
 * Sets the intl used by `useServerIntl` and the `ServerFormatted*` components for the current request.
 *
 * Must be called in the layout and in every page rendering translated server components,
 * because Next.js renders layouts and pages concurrently and doesn't render the layout again on client-side navigation.
 */
export function setServerIntl(locale: string, messages: ServerIntlMessages): void {
    getServerIntlRef().current = createIntl({ locale, defaultLocale: locale, messages }, intlCache);
}

export function useServerIntl(): IntlShape {
    const intl = getServerIntlRef().current;

    if (!intl) {
        throw new Error("Server intl isn't set. Call setServerIntl() in the layout or page before rendering translated server components.");
    }

    return intl;
}

export function ServerFormattedMessage({ id, defaultMessage, description, values }: ServerFormattedMessageProps): React.ReactNode {
    const intl = useServerIntl();

    const descriptor: MessageDescriptor = { id, defaultMessage, description };

    return <>{intl.formatMessage(descriptor, values)}</>;
}

export type ServerFormattedDateProps = Omit<React.ComponentProps<typeof FormattedDate>, "children">;

export function ServerFormattedDate({ value, ...options }: ServerFormattedDateProps): React.ReactNode {
    return <>{useServerIntl().formatDate(value, options)}</>;
}

export type ServerFormattedTimeProps = Omit<React.ComponentProps<typeof FormattedTime>, "children">;

export function ServerFormattedTime({ value, ...options }: ServerFormattedTimeProps): React.ReactNode {
    return <>{useServerIntl().formatTime(value, options)}</>;
}

export type ServerFormattedDateTimeRangeProps = Omit<React.ComponentProps<typeof FormattedDateTimeRange>, "children">;

export function ServerFormattedDateTimeRange({ from, to, ...options }: ServerFormattedDateTimeRangeProps): React.ReactNode {
    return <>{useServerIntl().formatDateTimeRange(from, to, options)}</>;
}

export type ServerFormattedNumberProps = Omit<React.ComponentProps<typeof FormattedNumber>, "children">;

export function ServerFormattedNumber({ value, ...options }: ServerFormattedNumberProps): React.ReactNode {
    return <>{useServerIntl().formatNumber(value, options)}</>;
}

export type ServerFormattedPluralProps = Omit<React.ComponentProps<typeof FormattedPlural>, "children">;

export function ServerFormattedPlural(props: ServerFormattedPluralProps): React.ReactNode {
    const pluralCategory = useServerIntl().formatPlural(props.value, props);

    return <>{props[pluralCategory] ?? props.other}</>;
}

export type ServerFormattedListProps = Omit<React.ComponentProps<typeof FormattedList>, "children">;

export function ServerFormattedList({ value, ...options }: ServerFormattedListProps): React.ReactNode {
    return <>{useServerIntl().formatList(value, options)}</>;
}

export type ServerFormattedDisplayNameProps = Omit<React.ComponentProps<typeof FormattedDisplayName>, "children">;

export function ServerFormattedDisplayName({ value, ...options }: ServerFormattedDisplayNameProps): React.ReactNode {
    return <>{useServerIntl().formatDisplayName(value, options)}</>;
}

export type ServerFormattedDurationProps = Omit<React.ComponentProps<typeof FormattedDuration>, "children">;

export function ServerFormattedDuration({ value, ...options }: ServerFormattedDurationProps): React.ReactNode {
    return <>{useServerIntl().formatDuration(value, options)}</>;
}
