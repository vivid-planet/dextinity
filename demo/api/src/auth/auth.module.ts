import {
    createAuthGuardProviders,
    createAuthResolver,
    createBasicAuthService,
    createJwtAuthService,
    createSitePreviewAuthService,
    createStaticUserAuthService,
    DextinityAuthGuard,
} from "@dextinity/cms-api";
import { DynamicModule, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { Config } from "@src/config/config";

import { AccessControlService } from "./access-control.service";
import { staticUsers } from "./static-users";
import { UserService } from "./user.service";

@Module({})
export class AuthModule {
    static forRoot(config: Config): DynamicModule {
        return {
            module: AuthModule,
            imports: [JwtModule],
            providers: [
                createAuthResolver({
                    postLogoutRedirectUri: config.auth.postLogoutRedirectUri,
                    endSessionEndpoint: config.auth.idpEndSessionEndpoint,
                }),
                UserService,
                AccessControlService,
                {
                    provide: APP_GUARD,
                    useClass: DextinityAuthGuard,
                },
                ...createAuthGuardProviders(
                    ...[
                        createBasicAuthService({
                            username: config.auth.systemUserName,
                            password: config.auth.systemUserPassword,
                        }),
                        createSitePreviewAuthService({ sitePreviewSecret: config.sitePreviewSecret }),
                        createJwtAuthService({
                            verifyOptions: {
                                audience: config.auth.idpClientId,
                            },
                            jwksOptions: {
                                jwksUri: config.auth.idpJwksUri,
                            },
                            convertJwtToUser: (jwt) => ({
                                id: jwt.sub,
                                name: jwt.name,
                                email: jwt.email,
                                isAdmin: jwt.isAdmin,
                            }),
                        }),
                        // Additionally, set a static user as fallback that is always authenticated. Used when bypassing OAuth2-Proxy through http://localhost:8001.
                        createStaticUserAuthService({ staticUser: staticUsers[0] }),
                    ],
                ),
            ],
            exports: [AccessControlService, UserService],
        };
    }
}
