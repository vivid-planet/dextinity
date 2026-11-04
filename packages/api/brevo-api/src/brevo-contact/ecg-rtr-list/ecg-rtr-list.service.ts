import { Inject, Injectable } from "@nestjs/common";
import crypto from "crypto";

import { BrevoModuleConfig } from "../../config/brevo-module.config";
import { BREVO_MODULE_CONFIG } from "../../config/brevo-module.constants";

@Injectable()
export class EcgRtrListService {
    constructor(@Inject(BREVO_MODULE_CONFIG) private readonly config: BrevoModuleConfig) {}

    async getContainedEcgRtrListEmails(emails: string[]): Promise<string[]> {
        /*
        When changing anything here, be aware of:
         - emails have to be in lowercase before hashing
         - dots have to be removed before hashing
         - domains have to be hashed as well, because a whole domain can be in the list instead of single emails
         - domain has to be in lowercase as well
        For more information, read: https://www.rtr.at/TKP/service/ecg-liste/ECG-Beschreibung-Entwickler-Schnittstelle.pdf
        */

        // Save emails with their hash, so we can access them later again
        const emailsAndHashedEmails = emails.map((email) => ({
            email,
            hashedEmail: crypto.createHash("sha512").update(this.prepareEmailForHash(email)).digest("hex"),
        }));

        // get unique domains
        let domains = emails.map((email) => email.substring(email.indexOf("@") + 1));
        domains = [...new Set(domains)]; // get unique domains

        // Save domains with their hash, so we can access them later again
        const domainsAndHashedDomains = domains.map((domain) => {
            return {
                domain,
                hashedDomain: crypto.createHash("sha512").update(domain.toLowerCase()).digest("hex"),
            };
        });

        const emailsAndDomains = [
            ...emailsAndHashedEmails.map((item) => item.hashedEmail),
            ...domainsAndHashedDomains.map((item) => item.hashedDomain),
        ];

        const headers = { "X-API-KEY": this.config.ecgRtrList.apiKey, "Content-Type": "application/json" };
        const body = { emails: emailsAndDomains, contained: true, hashed: true };
        const response = await fetch("https://ecg.rtr.at/dev/api/v1/emails/check/batch", { method: "POST", body: JSON.stringify(body), headers });

        if (!response.ok) {
            throw new Error("ECG-RTR List check could not be executed.");
        }

        const data = (await response.json()) as { emails?: string[] };
        const hashedResponseValues: string[] = data.emails ?? [];

        let containedEmails: string[] = [];

        for (const hashedResponseValue of hashedResponseValues) {
            const email = emailsAndHashedEmails.find((item) => item.hashedEmail === hashedResponseValue)?.email;
            const domain = domainsAndHashedDomains.find((item) => item.hashedDomain === hashedResponseValue)?.domain;

            if (domain) {
                const emailsWithDomain = emails.filter((item) => item.endsWith(`@${domain}`));
                containedEmails = containedEmails.concat(emailsWithDomain);
            }

            if (email) {
                containedEmails.push(email);
            }
        }

        return containedEmails;
    }

    prepareEmailForHash(email: string): string {
        // - emails have to be in lowercase before hashing
        // - dots have to be removed before hashing (but only from the part before the @)

        const emailParts = email.toLowerCase().split("@");

        if (emailParts.length !== 2) {
            throw Error("Error: No valid email.");
        }

        emailParts[0] = emailParts[0].replace(/\./g, "");

        return emailParts.join("@");
    }
}
