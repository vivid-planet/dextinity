import { File, Image, Link, News, PageTree, Tag } from "@dextinity/admin-icons";
import type { SvgIconProps } from "@mui/material";
import type { ComponentType, ReactNode } from "react";
import { FormattedMessage } from "react-intl";

interface EntityType {
    icon: ComponentType<SvgIconProps>;
    label: ReactNode;
    pluralLabel: ReactNode;
}

const entityTypes: Record<string, EntityType> = {
    Page: {
        icon: PageTree,
        label: <FormattedMessage id="fullTextSearchPrototype.entity.page" defaultMessage="Page" />,
        pluralLabel: <FormattedMessage id="fullTextSearchPrototype.entity.pages" defaultMessage="Pages" />,
    },
    News: {
        icon: News,
        label: <FormattedMessage id="fullTextSearchPrototype.entity.news" defaultMessage="News" />,
        pluralLabel: <FormattedMessage id="fullTextSearchPrototype.entity.newsPlural" defaultMessage="News" />,
    },
    Product: {
        icon: Tag,
        label: <FormattedMessage id="fullTextSearchPrototype.entity.product" defaultMessage="Product" />,
        pluralLabel: <FormattedMessage id="fullTextSearchPrototype.entity.products" defaultMessage="Products" />,
    },
    DamFile: {
        icon: Image,
        label: <FormattedMessage id="fullTextSearchPrototype.entity.file" defaultMessage="File" />,
        pluralLabel: <FormattedMessage id="fullTextSearchPrototype.entity.files" defaultMessage="Files" />,
    },
    Redirect: {
        icon: Link,
        label: <FormattedMessage id="fullTextSearchPrototype.entity.redirect" defaultMessage="Redirect" />,
        pluralLabel: <FormattedMessage id="fullTextSearchPrototype.entity.redirects" defaultMessage="Redirects" />,
    },
};

export function getEntityType(entityName: string): EntityType {
    return entityTypes[entityName] ?? { icon: File, label: entityName, pluralLabel: entityName };
}
