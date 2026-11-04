import { useEffect, useState } from "react";

import { createFetch, FetchProvider, useFetch } from "../fetch";

function ExampleFetch() {
    const fetch = useFetch();
    const [data, setData] = useState<object | null>(null);
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`/users`);
            setData(await response.json());
        };
        fetchData();
    }, [fetch]);
    return <div>{JSON.stringify(data)}</div>;
}

export default {
    title: "components/fetchProvider/FetchProvider",
};

export const _FetchProvider = {
    render: () => {
        const fetch = createFetch({
            interceptHeaders: async (headers: Headers) => {
                // headers.append("x-foo", "bar");
            },
        });

        return (
            <FetchProvider value={fetch}>
                <ExampleFetch />
            </FetchProvider>
        );
    },

    name: "FetchProvider",
};
