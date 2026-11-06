import { gql, useApolloClient, useQuery } from "@apollo/client";
import { CommandPalette, type CommandPaletteGroup, type CommandPaletteItem, Icon } from "@dextinity/ui";
import { useState } from "react";
import { useIntl } from "react-intl";
import { useHistory } from "react-router";
import { useDebounce } from "use-debounce";

import { useContentScope } from "../contentScope/Provider";
import { useDependenciesConfig } from "../dependencies/dependenciesConfig";
import type { DependencyInterface } from "../dependencies/types";
import { useUserPermissionCheck } from "../userPermissions/hooks/currentUser";
import type { GQLAppFrameFullTextSearchQuery, GQLAppFrameFullTextSearchQueryVariables } from "./AppFrameCommandPalette.generated";
import type { AppFrameMenuEntry } from "./useAppFrameMenu";

const fullTextSearchQuery = gql`
    query AppFrameFullTextSearch($search: String!, $scope: JSONObject) {
        myFullTextSearch(search: $search, scope: $scope, limit: 10) {
            nodes {
                id
                entityName
                name
                secondaryInformation
            }
        }
    }
`;

const breadcrumbSeparator = " › ";

function termsOf(query: string) {
    return query.toLowerCase().split(/\s+/).filter(Boolean);
}

function matchesTerms(item: CommandPaletteItem, terms: string[]) {
    const text = [item.label, ...(item.keywords ?? [])].join(" ").toLowerCase();
    return terms.every((term) => text.includes(term));
}

interface AppFrameCommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    menuEntries: AppFrameMenuEntry[];
    commands: CommandPaletteItem[];
}

export function AppFrameCommandPalette({ open, onOpenChange, menuEntries, commands }: AppFrameCommandPaletteProps) {
    const intl = useIntl();
    const history = useHistory();
    const apolloClient = useApolloClient();
    const contentScope = useContentScope();
    const { entityDependencyMap } = useDependenciesConfig();
    const isAllowed = useUserPermissionCheck();
    const [query, setQuery] = useState("");
    const [debouncedSearch] = useDebounce(query.trim(), 250);
    const canSearchContent = isAllowed("fullTextSearch");

    const { data, loading } = useQuery<GQLAppFrameFullTextSearchQuery, GQLAppFrameFullTextSearchQueryVariables>(fullTextSearchQuery, {
        variables: { search: debouncedSearch, scope: contentScope.scope },
        skip: !open || debouncedSearch.length === 0 || !canSearchContent,
    });

    async function openSearchResult(result: { id: string; entityName: string }) {
        const dependency = entityDependencyMap[result.entityName] as DependencyInterface | undefined;
        if (!dependency) {
            return;
        }
        const path = await dependency.resolvePath({ apolloClient, id: result.id });
        history.push(contentScope.match.url + path);
    }

    const terms = termsOf(query);
    const contentItems: CommandPaletteItem[] =
        terms.length > 0
            ? (data?.myFullTextSearch.nodes ?? [])
                  .filter((result) => entityDependencyMap[result.entityName] !== undefined)
                  .map((result) => ({
                      id: `content:${result.entityName}:${result.id}`,
                      label: result.secondaryInformation ? `${result.name}${breadcrumbSeparator}${result.secondaryInformation}` : result.name,
                      icon: <Icon name="page" />,
                      onSelect: () => void openSearchResult(result),
                  }))
            : [];
    const jumpToItems: CommandPaletteItem[] = menuEntries
        .map(({ item, parentLabels, external }) => ({
            id: `menu:${item.id}`,
            label: [...parentLabels, item.label].join(breadcrumbSeparator),
            icon: <Icon name={external ? "external-link" : "arrow-right"} />,
            onSelect: () => {
                if (item.href == null) {
                    return;
                }
                if (external) {
                    window.open(item.href, "_blank", "noopener,noreferrer");
                } else {
                    history.push(item.href);
                }
            },
        }))
        .filter((item) => matchesTerms(item, terms));

    const groups: CommandPaletteGroup[] = [
        { label: intl.formatMessage({ id: "dextinity.appFrame.commandPalette.content", defaultMessage: "Content" }), items: contentItems },
        { label: intl.formatMessage({ id: "dextinity.appFrame.commandPalette.jumpTo", defaultMessage: "Jump to" }), items: jumpToItems },
        {
            label: intl.formatMessage({ id: "dextinity.appFrame.commandPalette.commands", defaultMessage: "Commands" }),
            items: commands.filter((item) => matchesTerms(item, terms)),
        },
    ];
    const isSearching = loading || (canSearchContent && debouncedSearch !== query.trim());

    return (
        <CommandPalette
            open={open}
            onOpenChange={(nextOpen) => {
                onOpenChange(nextOpen);
                if (!nextOpen) {
                    setQuery("");
                }
            }}
            query={query}
            onQueryChange={setQuery}
            groups={groups}
            filter={false}
            labels={{
                title: intl.formatMessage({ id: "dextinity.appFrame.commandPalette.title", defaultMessage: "Search and commands" }),
                placeholder: intl.formatMessage({
                    id: "dextinity.appFrame.commandPalette.placeholder",
                    defaultMessage: "Search content, jump to a page, run a command …",
                }),
                empty: isSearching
                    ? intl.formatMessage({ id: "dextinity.appFrame.commandPalette.searching", defaultMessage: "Searching …" })
                    : intl.formatMessage({ id: "dextinity.appFrame.commandPalette.empty", defaultMessage: "No results" }),
                navigate: intl.formatMessage({ id: "dextinity.appFrame.commandPalette.navigate", defaultMessage: "Navigate" }),
                select: intl.formatMessage({ id: "dextinity.appFrame.commandPalette.select", defaultMessage: "Open" }),
                close: intl.formatMessage({ id: "dextinity.appFrame.commandPalette.close", defaultMessage: "Close" }),
                escapeKey: intl.formatMessage({ id: "dextinity.appFrame.commandPalette.escapeKey", defaultMessage: "Esc" }),
            }}
        />
    );
}
