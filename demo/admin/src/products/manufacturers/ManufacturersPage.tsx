import { Route, Switch, useRouteMatch } from "react-router";

import { ManufacturerEditPage } from "./ManufacturerEditPage";
import { ManufacturersListPage } from "./ManufacturersListPage";

export function ManufacturersPage() {
    const match = useRouteMatch();
    const getEditUrl = (id: string) => `${match.url}/${id}/edit`;

    return (
        <Switch>
            <Route exact path={match.path}>
                <ManufacturersListPage baseUrl={match.url} />
            </Route>
            <Route path={`${match.path}/add`}>
                <ManufacturerEditPage listUrl={match.url} pageUrl={`${match.url}/add`} getEditUrl={getEditUrl} />
            </Route>
            <Route
                path={`${match.path}/:id/edit`}
                render={({ match: editMatch }) => (
                    <ManufacturerEditPage
                        key={editMatch.params.id}
                        listUrl={match.url}
                        pageUrl={editMatch.url}
                        getEditUrl={getEditUrl}
                        id={editMatch.params.id}
                    />
                )}
            />
        </Switch>
    );
}
