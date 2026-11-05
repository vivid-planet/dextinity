"use client";
import { gql } from "@dextinity/site-react-router";
import { useEffect, useState } from "react";

// A query of a client component, which persistedQueriesPlugin replaces with its hash in the browser
const clientQuery = gql`
    query E2EPersisted {
        e2ePersistedQuery
    }
`;

export function ClientQuery() {
    const [browserQuery, setBrowserQuery] = useState<string>();
    useEffect(() => {
        setBrowserQuery(JSON.stringify(clientQuery));
    }, []);
    return <p id="client-query">{browserQuery}</p>;
}
