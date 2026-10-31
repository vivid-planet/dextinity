import { Link } from "@dextinity/site-vite-rsc";

import { ClientRouterInfo, RouterControls } from "./clientComponents.js";
import { RenderCount } from "./serverComponents.js";
import { StyledText } from "./StyledText.js";

const paragraphNumbers = Array.from({ length: 60 }, (_, index) => index + 1);

function Paragraphs() {
    return paragraphNumbers.map((number) => <p key={number}>{`Paragraph ${number}`}</p>);
}

/**
 * A long page with links for the browser tests, available as `/pages/:name`
 */
export function TestPage({ name, imageDelay }: { name: string; imageDelay?: number }) {
    return (
        <main>
            <h1>{name}</h1>
            <RenderCount />
            <ClientRouterInfo />
            <RouterControls />
            <StyledText />
            <nav>
                <Link href="/pages/second">Second</Link>
                <Link href="/pages/second?page=2">Second with search</Link>
                <Link href="/pages/second#section">Section of second</Link>
                <Link href="#section">Section</Link>
                <Link href="/pages/second" replace>
                    Replace with second
                </Link>
                <Link href="/pages/second" scroll={false}>
                    Second without scrolling
                </Link>
                <Link href="/pages/slow?delay=1000">Slow</Link>
                <a href="/pages/second">Plain link to second</a>
                <Link href="/pages/second" target="_blank">
                    Second in new tab
                </Link>
                <Link href="/not-found">Not found</Link>
                <Link href="/redirect">Redirect</Link>
                <Link href="/redirect-with-cookie#details">Redirect with cookie</Link>
                <Link href={`/redirect?location=${encodeURIComponent("https://example.com/target")}`}>Redirect to other origin</Link>
                <Link href="/redirect-loop">Redirect loop</Link>
                <Link href="/server-error">Server error</Link>
                <Link href="/client-error">Client error</Link>
            </nav>
            <Paragraphs />
            <h2 id="section">Section</h2>
            <Paragraphs />
            {imageDelay !== undefined && <img src={`/tall-image?delay=${imageDelay}`} alt="" />}
        </main>
    );
}
