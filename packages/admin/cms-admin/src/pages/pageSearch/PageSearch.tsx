import { SearchInput } from "../../common/SearchInput";
import type { PageSearchApi } from "./usePageSearch";

interface PageSearchProps {
    query: string;
    onQueryChange: (query: string) => void;
    pageSearchApi: PageSearchApi;
}

export function PageSearch({ query, onQueryChange, pageSearchApi }: PageSearchProps) {
    return (
        <SearchInput
            query={query}
            onQueryChange={onQueryChange}
            currentMatch={pageSearchApi.currentMatch}
            totalMatches={pageSearchApi.totalMatches}
            jumpToPreviousMatch={pageSearchApi.jumpToPreviousMatch}
            jumpToNextMatch={pageSearchApi.jumpToNextMatch}
        />
    );
}
