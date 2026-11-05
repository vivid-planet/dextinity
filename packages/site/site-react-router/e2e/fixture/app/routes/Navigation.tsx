"use client";
import { useState } from "react";
import { Link } from "react-router";

export function Navigation() {
    const [count, setCount] = useState(0);
    return (
        <nav>
            <button onClick={() => setCount(count + 1)}>Clicked {count} times</button>
            <Link to="/">Home</Link>
            <Link to="/cached">Cached</Link>
            <Link to="/not-found">Not found</Link>
            <Link to="/render-error">Render error</Link>
            <Link to="/redirect">Redirect</Link>
        </nav>
    );
}
