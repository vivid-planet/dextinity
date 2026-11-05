import { differenceInMinutes, isSameDay } from "date-fns";
import { FormattedDate, FormattedMessage, useIntl } from "react-intl";

interface RuntimeProps {
    startTime?: Date;
    completionTime?: Date;
}

export function JobRuntime(props: RuntimeProps) {
    const { startTime, completionTime } = props;
    const intl = useIntl();

    if (startTime && completionTime) {
        const runtime = differenceInMinutes(completionTime, startTime);

        return (
            <FormattedMessage
                id="dextinity.jobRuntime.startCompletionTime"
                defaultMessage="{start} - {completion} ({runtime} min)"
                values={{
                    start: intl.formatDate(startTime, { dateStyle: "short", timeStyle: "short" }),
                    completion: isSameDay(new Date(), completionTime)
                        ? intl.formatTime(completionTime)
                        : intl.formatDate(completionTime, { dateStyle: "short", timeStyle: "short" }),
                    runtime:
                        runtime <= 0
                            ? intl.formatMessage({ id: "dextinity.jobRuntime.runtimeSmallerThanOneMinute", defaultMessage: "< 1" })
                            : runtime,
                }}
            />
        );
    }

    if (startTime) {
        return <FormattedDate value={startTime} dateStyle="short" timeStyle="short" />;
    }

    return null;
}
