import type { Route } from "./+types/contactFormRoute";

export async function action(args: Route.ActionArgs) {
    // Loaded on use, so that missing environment variables of this route don't break the whole site
    const { handleContactFormRequest } = await import("./contactForm.server");
    return handleContactFormRequest(args);
}
