import { Route, Switch, useRouteMatch } from "react-router";

import ProductsHandmadePage from "../ProductsPage";
import { ProductsListPanelPage } from "./ProductsListPanelPage";

export function ProductsUiPage() {
    const match = useRouteMatch();

    return (
        <Switch>
            <Route exact path={match.path}>
                <ProductsListPanelPage baseUrl={match.url} />
            </Route>
            <Route>
                <ProductsHandmadePage />
            </Route>
        </Switch>
    );
}
