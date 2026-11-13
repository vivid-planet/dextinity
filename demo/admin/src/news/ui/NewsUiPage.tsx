import { useContentScopeConfig } from "@dextinity/cms-admin";
import { Route, Switch, useRouteMatch } from "react-router";

import { NewsEditPage } from "./NewsEditPage";
import { NewsListPage } from "./NewsListPage";

export function NewsUiPage() {
    const match = useRouteMatch();
    useContentScopeConfig({ redirectPathAfterChange: "/structured-content/news" });

    return (
        <Switch>
            <Route exact path={match.path}>
                <NewsListPage baseUrl={match.url} />
            </Route>
            <Route path={`${match.path}/add`}>
                <NewsEditPage baseUrl={match.url} />
            </Route>
            <Route
                path={`${match.path}/:id/edit`}
                render={({ match: editMatch }) => <NewsEditPage key={editMatch.params.id} baseUrl={match.url} id={editMatch.params.id} />}
            />
        </Switch>
    );
}
