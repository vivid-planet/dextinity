/**
 * Options gathered under their group header, in the order the groups first appear. Options without a group form a group without a header.
 */
export interface OptionGroup<Item> {
    label: string | undefined;
    items: Item[];
}

export function groupOptions<Item>(items: Item[], getGroup: (item: Item) => string | undefined): OptionGroup<Item>[] {
    const groups = new Map<string | undefined, OptionGroup<Item>>();
    for (const item of items) {
        const label = getGroup(item);
        let group = groups.get(label);
        if (group == null) {
            group = { label, items: [] };
            groups.set(label, group);
        }
        group.items.push(item);
    }
    return [...groups.values()];
}

export function hasGroups<Item>(items: Item[], getGroup: (item: Item) => string | undefined): boolean {
    return items.some((item) => getGroup(item) != null);
}
