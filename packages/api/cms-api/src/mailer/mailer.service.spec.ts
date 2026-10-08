import type { EntityManager } from "@mikro-orm/postgresql";
import { Logger } from "@nestjs/common";
import type { Transporter } from "nodemailer";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MailerLog } from "./entities/mailer-log.entity";
import { MailerService } from "./mailer.service";

describe("MailerService.sendMail", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    function createService({ nativeDelete }: { nativeDelete: () => Promise<number> }) {
        const mailerTransport = { sendMail: vi.fn().mockResolvedValue({ messageId: "message-id" }) } as unknown as Transporter;
        const entityManager = { nativeDelete: vi.fn(nativeDelete) } as unknown as EntityManager;

        const service = new MailerService({ defaultFrom: "sender@example.com" }, mailerTransport, entityManager);

        return { service, entityManager };
    }

    it("deletes outdated mail logs", async () => {
        const { service, entityManager } = createService({ nativeDelete: () => Promise.resolve(1) });

        await service.sendMail({ to: "recipient@example.com", subject: "Subject", text: "Text", logMail: false });

        expect(entityManager.nativeDelete).toHaveBeenCalledWith(MailerLog, { createdAt: { $lt: expect.any(Date) } });
    });

    it("logs instead of rejecting when deleting outdated mail logs fails", async () => {
        const loggerErrorSpy = vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
        const { service } = createService({ nativeDelete: () => Promise.reject(new Error("delete failed")) });

        await expect(service.sendMail({ to: "recipient@example.com", subject: "Subject", text: "Text", logMail: false })).resolves.toEqual({
            messageId: "message-id",
        });

        await vi.waitFor(() => expect(loggerErrorSpy).toHaveBeenCalledWith("Failed to delete outdated mail logs", expect.any(Error)));
    });
});
