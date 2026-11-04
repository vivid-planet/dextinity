import type { BooleanFilter } from "../common/filter/boolean.filter";
import type { DateTimeFilter } from "../common/filter/date-time.filter";
import type { EnumFilterInterface } from "../common/filter/enum.filter.factory";
import type { StringFilter } from "../common/filter/string.filter";
import type { RedirectFilter } from "./dto/redirects.filter";
import type { RedirectInterface } from "./entities/redirect-entity.factory";

export type FilterableRedirect = Pick<
    RedirectInterface,
    "generationType" | "source" | "sourceType" | "active" | "createdAt" | "updatedAt" | "activatedAt"
> & {
    target?: string;
};

export function redirectMatchesFilter(redirect: FilterableRedirect, filter: RedirectFilter): boolean {
    let matches: boolean | undefined;

    if (isEmptyFilter(filter)) {
        matches = true;
    }

    if (filter.generationType) {
        matches = (matches ?? true) && stringMatchesFilter(redirect.generationType, filter.generationType);
    }

    if (filter.source) {
        matches = (matches ?? true) && stringMatchesFilter(redirect.source, filter.source);
    }

    if (filter.target) {
        const isAbsoluteUrl = redirect.target?.startsWith("http://") || redirect.target?.startsWith("https://");

        if (isAbsoluteUrl && redirect.target) {
            const url = new URL(redirect.target);
            matches = (matches ?? true) && (stringMatchesFilter(redirect.target, filter.target) || stringMatchesFilter(url.pathname, filter.target));
        } else {
            matches = (matches ?? true) && stringMatchesFilter(redirect.target, filter.target);
        }
    }

    if (filter.active) {
        matches = (matches ?? true) && booleanMatchesFilter(redirect.active, filter.active);
    }

    if (filter.sourceType) {
        matches = (matches ?? true) && enumMatchesFilter(redirect.sourceType, filter.sourceType);
    }

    if (filter.createdAt) {
        matches = (matches ?? true) && dateTimeMatchesFilter(redirect.createdAt, filter.createdAt);
    }

    if (filter.updatedAt) {
        matches = (matches ?? true) && dateTimeMatchesFilter(redirect.updatedAt, filter.updatedAt);
    }

    if (filter.activatedAt) {
        matches = (matches ?? true) && dateTimeMatchesFilter(redirect.activatedAt, filter.activatedAt);
    }

    if (filter.and) {
        if (matches === undefined) {
            matches = filter.and.every((subFilter) => redirectMatchesFilter(redirect, subFilter));
        } else {
            matches = matches && filter.and.every((subFilter) => redirectMatchesFilter(redirect, subFilter));
        }
    }

    if (filter.or) {
        if (matches !== true) {
            if (filter.or.length > 0) {
                matches = filter.or.some((subFilter) => redirectMatchesFilter(redirect, subFilter));
            } else {
                matches = true;
            }
        }
    }

    return matches ?? false;
}

function stringMatchesFilter(string: string | undefined, filter: StringFilter): boolean {
    if (!string) {
        return filter.isEmpty === true;
    } else if (filter.contains && string.includes(filter.contains)) {
        return true;
    } else if (filter.notContains && !string.includes(filter.notContains)) {
        return true;
    } else if (filter.startsWith && string.startsWith(filter.startsWith)) {
        return true;
    } else if (filter.endsWith && string.endsWith(filter.endsWith)) {
        return true;
    } else if (filter.equal && string === filter.equal) {
        return true;
    } else if (filter.notEqual && string !== filter.notEqual) {
        return true;
    } else if (filter.isAnyOf && filter.isAnyOf.includes(string)) {
        return true;
    } else if (filter.isNotEmpty && string !== undefined) {
        return true;
    }
    return false;
}

function booleanMatchesFilter(boolean: boolean, filter: BooleanFilter) {
    if (filter.equal !== undefined && boolean === filter.equal) {
        return true;
    } else if (filter.equal === undefined) {
        return true;
    }

    return false;
}

function dateTimeMatchesFilter(date: Date | undefined, filter: DateTimeFilter): boolean {
    if (!date) {
        return filter.isEmpty === true;
    } else if (filter.equal && date.getTime() === filter.equal.getTime()) {
        return true;
    } else if (filter.lowerThan && date.getTime() < filter.lowerThan.getTime()) {
        return true;
    } else if (filter.greaterThan && date.getTime() > filter.greaterThan.getTime()) {
        return true;
    } else if (filter.lowerThanEqual && date.getTime() <= filter.lowerThanEqual.getTime()) {
        return true;
    } else if (filter.greaterThanEqual && date.getTime() >= filter.greaterThanEqual.getTime()) {
        return true;
    } else if (filter.notEqual && date.getTime() !== filter.notEqual.getTime()) {
        return true;
    } else if (filter.isNotEmpty) {
        return true;
    }
    return false;
}

function enumMatchesFilter<TEnum>(value: TEnum, filter: EnumFilterInterface<TEnum>): boolean {
    if (filter.equal !== undefined && value === filter.equal) {
        return true;
    } else if (filter.notEqual !== undefined && value !== filter.notEqual) {
        return true;
    } else if (filter.isAnyOf && filter.isAnyOf.includes(value)) {
        return true;
    }
    return false;
}

export function isEmptyFilter(filter: RedirectFilter): boolean {
    const filters = Object.keys(filter);

    return (
        filters.length === 0 ||
        (filters.length === 1 && filter.and !== undefined && filter.and.length === 0) ||
        (filters.length === 1 && filter.or !== undefined && filter.or.length === 0)
    );
}
