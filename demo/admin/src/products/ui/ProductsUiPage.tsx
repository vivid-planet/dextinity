import { Route, Switch, useRouteMatch } from "react-router";

import { ProductEditPage } from "./ProductEditPage";
import { ProductsListPanelPage } from "./ProductsListPanelPage";
import { ProductVariantEditPage } from "./ProductVariantEditPage";

export function ProductsUiPage() {
    const match = useRouteMatch();
    const getEditUrl = (id: string) => `${match.url}/${id}/edit`;

    return (
        <Switch>
            <Route exact path={match.path}>
                <ProductsListPanelPage baseUrl={match.url} />
            </Route>
            <Route path={`${match.path}/add`}>
                <ProductEditPage listUrl={match.url} pageUrl={`${match.url}/add`} getEditUrl={getEditUrl} />
            </Route>
            <Route
                path={`${match.path}/:productId/edit/variants/add`}
                render={({ match: variantMatch }) => {
                    const variantsUrl = `${getEditUrl(variantMatch.params.productId)}/variants`;
                    return (
                        <ProductVariantEditPage
                            productId={variantMatch.params.productId}
                            variantsUrl={variantsUrl}
                            pageUrl={variantMatch.url}
                            getEditUrl={(id) => `${variantsUrl}/${id}`}
                        />
                    );
                }}
            />
            <Route
                path={`${match.path}/:productId/edit/variants/:variantId`}
                render={({ match: variantMatch }) => {
                    const variantsUrl = `${getEditUrl(variantMatch.params.productId)}/variants`;
                    return (
                        <ProductVariantEditPage
                            key={variantMatch.params.variantId}
                            productId={variantMatch.params.productId}
                            variantsUrl={variantsUrl}
                            pageUrl={variantMatch.url}
                            getEditUrl={(id) => `${variantsUrl}/${id}`}
                            id={variantMatch.params.variantId}
                        />
                    );
                }}
            />
            <Route
                path={`${match.path}/:productId/edit`}
                render={({ match: editMatch }) => (
                    <ProductEditPage
                        key={editMatch.params.productId}
                        listUrl={match.url}
                        pageUrl={editMatch.url}
                        getEditUrl={getEditUrl}
                        id={editMatch.params.productId}
                    />
                )}
            />
        </Switch>
    );
}
