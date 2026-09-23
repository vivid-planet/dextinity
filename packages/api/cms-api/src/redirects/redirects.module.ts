import { MikroOrmModule } from "@mikro-orm/nestjs";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { ClassProvider, DynamicModule, FactoryProvider, Global, Module, ModuleMetadata, Type, ValueProvider } from "@nestjs/common";

import { Block } from "../blocks/block";
import { ExternalLinkBlock } from "../blocks/externalLink/external-link.block";
import { createOneOfBlock, OneOfBlock } from "../blocks/factories/createOneOfBlock";
import { DependenciesResolverFactory } from "../dependencies/dependencies.resolver.factory";
import { InternalLinkBlock, InternalLinkBlockData, InternalLinkBlockInput } from "../page-tree/blocks/internal-link.block";
import { RedirectInputFactory } from "./dto/redirect-input.factory";
import { RedirectEntityFactory, RedirectInterface } from "./entities/redirect-entity.factory";
import { ImportRedirectsCommand } from "./import-redirects.command";
import { DefaultRedirectTargetUrlService, RedirectTargetUrlServiceInterface } from "./redirect-target-url.service";
import { REDIRECTS_LINK_BLOCK, REDIRECTS_REPOSITORY, REDIRECTS_TARGET_URL_SERVICE } from "./redirects.constants";
import { createRedirectsResolver } from "./redirects.resolver";
import { RedirectsService } from "./redirects.service";
import { RedirectScopeInterface } from "./types";

type CustomTargets = Record<string, Block>;

export type RedirectsLinkBlock = OneOfBlock<
    CustomTargets & { internal: Block<InternalLinkBlockData, InternalLinkBlockInput>; external: typeof ExternalLinkBlock }
>;

interface Config extends Pick<ModuleMetadata, "imports"> {
    customTargets?: CustomTargets;
    Scope?: Type<RedirectScopeInterface>;
    TargetUrlService?: Type<RedirectTargetUrlServiceInterface>;
}
@Global()
@Module({})
export class RedirectsModule {
    static register({ customTargets, Scope, TargetUrlService = DefaultRedirectTargetUrlService, imports }: Config = {}): DynamicModule {
        const linkBlock = createOneOfBlock(
            {
                supportedBlocks: { internal: InternalLinkBlock, external: ExternalLinkBlock, ...customTargets },
                allowEmpty: false,
            },
            "RedirectsLink",
        );

        const Redirect = RedirectEntityFactory.create({ linkBlock, Scope });
        const RedirectInput = RedirectInputFactory.create({ linkBlock });
        const RedirectsResolver = createRedirectsResolver({ Redirect, RedirectInput, Scope });
        const RedirectsDependenciesResolver = DependenciesResolverFactory.create(Redirect);

        const linkBlockProvider: ValueProvider<RedirectsLinkBlock> = {
            provide: REDIRECTS_LINK_BLOCK,
            useValue: linkBlock,
        };

        const targetUrlServiceProvider: ClassProvider<RedirectTargetUrlServiceInterface> = {
            provide: REDIRECTS_TARGET_URL_SERVICE,
            useClass: TargetUrlService,
        };

        const repositoryProvider: FactoryProvider<EntityRepository<RedirectInterface>> = {
            provide: REDIRECTS_REPOSITORY,
            useFactory: (entityManager: EntityManager) => entityManager.getRepository(Redirect),
            inject: [EntityManager],
        };

        const mikroOrmModule = MikroOrmModule.forFeature([Redirect]);

        return {
            module: RedirectsModule,
            imports: [...(imports ?? []), mikroOrmModule],
            providers: [
                RedirectsResolver,
                RedirectsDependenciesResolver,
                RedirectsService,
                linkBlockProvider,
                ImportRedirectsCommand,
                targetUrlServiceProvider,
                repositoryProvider,
            ],
            exports: [RedirectsService, REDIRECTS_LINK_BLOCK, REDIRECTS_REPOSITORY, mikroOrmModule],
        };
    }
}
