import { type NextRequest, NextResponse } from "next/server";

export type CustomMiddleware = (request: NextRequest) => NextResponse | Response | Promise<NextResponse | Response>;

type MiddlewareFactory = (middleware: CustomMiddleware) => CustomMiddleware;
export function chain(functions: MiddlewareFactory[], index = 0): CustomMiddleware {
    const current = functions[index];

    if (current) {
        const next = chain(functions, index + 1);
        return current(next);
    }

    return () => NextResponse.next();
}
