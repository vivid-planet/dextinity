import { differenceInMinutes, isSameDay } from "date-fns";
import { FormattedDate, FormattedMessage, FormattedTime } from "react-intl";

interface RuntimeProps {
    startTime?: Date;
    completionTime?: Date;
}

export function JobRuntime(props: RuntimeProps) {
    const { startTime, completionTime } = props;

    if (startTime && completionTime) {
        const runtime = differenceInMinutes(completionTime, startTime);

        return (
            <FormattedMessage
                id="dextinity.jobRuntime.startCompletionTime"
                defaultMessage="{start} - {completion} ({runtime} min)"
                values={{
                    start: <FormattedDate value={startTime} dateStyle="short" timeStyle="short" />,
                    completion: isSameDay(new Date(), completionTime) ? (
                        <FormattedTime value={completionTime} />
                    ) : (
                        <FormattedDate value={completionTime} dateStyle="short" timeStyle="short" />
                    ),
                    runtime: runtime <= 0 ? <FormattedMessage id="dextinity.jobRuntime.runtimeSmallerThanOneMinute" defaultMessage="< 1" /> : runtime,
                }}
            />
        );
    }

    if (startTime) {
        return <FormattedDate value={startTime} dateStyle="short" timeStyle="short" />;
    }

    return null;
}
