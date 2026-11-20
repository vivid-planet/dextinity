export interface SearchResult {
    id: string;
    entityName: string;
    name: string;
    secondaryInformation?: string | null;
}

export interface SearchDropdownVariantProps {
    onSelectResult: (result: SearchResult) => void;
}
