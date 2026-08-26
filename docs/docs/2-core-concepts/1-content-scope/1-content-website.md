---
title: Content websites
---

In a content website, the content scope can be used to separate multiple areas of content, such as different websites (domains) or languages. Each area stores its content independently of the others.

Different modules can use different scopes and some modules might not use a scope at all. For example, the DAM might only be scoped by domain while the PageTree is scoped by domain and language. Or it might not use a scope at all, resulting in a shared DAM across all content scopes. Most of Dextinity's features will work out-of-the-box even without a scope.

### API: Database

Usually, the scope is stored in a `scope` object as an [embeddable](https://mikro-orm.io/docs/embeddables), which the API Generator will then use to create a standardized API that requires passing the scope.

```ts title="api/src/news/entities/news.entity.ts"
@Embeddable()
@ObjectType()
@InputType("NewsContentScopeInput")
export class NewsContentScope {
    @Property({ columnType: "text" })
    @Field()
    @IsString()
    domain: string;

    @Property({ columnType: "text" })
    @Field()
    @IsString()
    language: string;
}

@Entity()
export class News extends BaseEntity {
    @Embedded(() => NewsContentScope)
    @Field(() => NewsContentScope)
    scope: NewsContentScope;
}
```

### API: GraphQL API

The GraphQL API will have a scope argument (where it makes sense). For example, a query for the `News` from above might look like this:

```
newsList(scope: NewsContentScopeInput!, offset: Int! = 0, limit: Int! = 25, search: String, filter: NewsFilter, sort: [NewsSort!]): PaginatedNews!
```

### Admin: Scope Selector

In the Admin, you need a `ContentScopeProvider` and `ContentScopeControls` in the `MasterHeader` component.

You can then use `useContentScope()` to access the currently selected scope, which you will then usually pass through to API requests.

### API: User permissions

Dextinity's user permission feature will automatically validate `scope` arguments of GraphQL operations and check if a user has access to the entity's scope. The column must be named `scope` for this to work.

For nested entities or operations without a `scope` argument please refer to [Evaluate Content Scopes](evaluate-content-scopes) which describes how to decorate the resolvers/controllers properly.
