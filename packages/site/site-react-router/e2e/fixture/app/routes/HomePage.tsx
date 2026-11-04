import { createMeta, Image } from "@dextinity/site-react-router";

import { ClientQuery } from "./ClientQuery";

export const meta = () =>
    createMeta({ title: "Home", description: "The home page", alternates: { canonical: "/" } }, { baseUrl: "https://www.example.com" });

export function ServerComponent() {
    return (
        <>
            <h1>Home</h1>
            <ClientQuery />
            <Image src="/image/$resizeWidth/$resizeHeight/photo.jpg" aspectRatio="16x9" sizes="50vw" alt="A photo" />
        </>
    );
}
