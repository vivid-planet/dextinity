import { Button } from "@dextinity/ui";
import { useIntl } from "react-intl";

interface LoadMoreSearchResultsButtonProps {
    onClick: () => void;
    loading: boolean;
}

export function LoadMoreSearchResultsButton({ onClick, loading }: LoadMoreSearchResultsButtonProps) {
    const intl = useIntl();
    return (
        <Button size="small" variant="outlined" color="secondary" onClick={onClick} loading={loading}>
            {intl.formatMessage({ id: "dextinity.damFinder.loadMoreResults", defaultMessage: "Show more results" })}
        </Button>
    );
}
