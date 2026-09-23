import type { Meta } from "@storybook/react-vite";

import { type Breadcrumb, Breadcrumbs } from "../Breadcrumbs";

const config: Meta<typeof Breadcrumbs> = {
    component: Breadcrumbs,
    title: "components/breadcrumbs/Breadcrumbs",
    decorators: [(story) => <div style={{ height: "400px", display: "flex", flexDirection: "column" }}>{story()}</div>],
};

export default config;

const singleItem: Breadcrumb[] = [{ url: "/one", title: "Breadcrumb One" }];
const twoItems: Breadcrumb[] = [...singleItem, { url: "/two", title: "BC 2" }];
const threeItems: Breadcrumb[] = [...twoItems, { url: "/three", title: "BrdCrmb 3" }];
const fiveItems: Breadcrumb[] = [
    ...threeItems,
    { url: "/four", title: "Really long Breadcrumb Number Four" },
    { url: "/five", title: "Breadcrumb Five" },
];
const sevenItems: Breadcrumb[] = [...fiveItems, { url: "/six", title: "Breadcrumb Six" }, { url: "/seven", title: "Breadcrumb Seven" }];

export const Single = () => {
    return <Breadcrumbs items={singleItem} />;
};

export const Two = () => {
    return <Breadcrumbs items={twoItems} />;
};

export const Three = () => {
    return <Breadcrumbs items={threeItems} />;
};

export const Five = () => {
    return <Breadcrumbs items={fiveItems} />;
};

export const Seven = () => {
    return <Breadcrumbs items={sevenItems} />;
};

export const ResponsiveDesktop = () => {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[760, 560, 400, 280].map((width) => (
                <div key={width} style={{ maxWidth: width }}>
                    <Breadcrumbs items={sevenItems} />
                </div>
            ))}
        </div>
    );
};
