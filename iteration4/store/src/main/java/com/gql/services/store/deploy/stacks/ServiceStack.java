package com.gql.services.store.deploy.stacks;

import software.amazon.awscdk.core.CfnOutput;
import software.amazon.awscdk.core.CfnOutputProps;
import software.amazon.awscdk.core.Construct;
import software.amazon.awscdk.core.Duration;
import software.amazon.awscdk.core.Expiration;
import software.amazon.awscdk.core.Stack;
import software.amazon.awscdk.services.appsync.ApiKeyConfig;
import software.amazon.awscdk.services.appsync.AuthorizationConfig;
import software.amazon.awscdk.services.appsync.AuthorizationMode;
import software.amazon.awscdk.services.appsync.AuthorizationType;
import software.amazon.awscdk.services.appsync.GraphqlApi;
import software.amazon.awscdk.services.appsync.GraphqlApiProps;
import software.amazon.awscdk.services.appsync.HttpDataSource;
import software.amazon.awscdk.services.appsync.MappingTemplate;
import software.amazon.awscdk.services.appsync.ResolverProps;
import software.amazon.awscdk.services.appsync.Schema;

import static com.gql.services.store.Manager.withEnv;

public class ServiceStack extends Stack {
    public ServiceStack(final Construct parent, String id) {
        super(parent, id);

        String gqlPath = "./src/main/java/com/gql/services/store/backend/graphql/";
        String apiName = withEnv("store-api");
        Schema schema = Schema.fromAsset(gqlPath + "Store.graphql");
        AuthorizationConfig authorizationConfig = AuthorizationConfig.builder()
                .defaultAuthorization(AuthorizationMode.builder()
                        .authorizationType(AuthorizationType.API_KEY)
                        .apiKeyConfig(ApiKeyConfig.builder()
                                .expires(Expiration.after(Duration.days(365)))
                                .build())
                        .build())
                .build();
        GraphqlApiProps graphqlApiProps = GraphqlApiProps.builder()
                .name(apiName)
                .schema(schema)
                .authorizationConfig(authorizationConfig)
                .xrayEnabled(true)
                .build();
        GraphqlApi api = new GraphqlApi(this, apiName, graphqlApiProps);

        new CfnOutput(this, "GraphQLAPIURL", CfnOutputProps.builder()
                .value(api.getGraphqlUrl()).build());

        new CfnOutput(this, "GraphQLAPIKey", CfnOutputProps.builder()
                .value(api.getApiKey()).build());

        HttpDataSource usersDataSource = api.addHttpDataSource(
                "UserMicroServiceApi",
                "https://ptt4cxj6arepjftfz6u4fwdlrq.appsync-api.us-east-1.amazonaws.com/graphql"
        );

        ResolverProps allUsers = ResolverProps.builder()
                .api(api)
                .typeName("Query")
                .fieldName("allUsers")
                .requestMappingTemplate(MappingTemplate.fromFile(gqlPath + "resolvers/Query.allUsers.req.vtl"))
                .responseMappingTemplate(MappingTemplate.fromFile(gqlPath + "resolvers/Query.allUsers.res.vtl"))
                .build();
        usersDataSource.createResolver(allUsers);

        ResolverProps addUser = ResolverProps.builder()
                .api(api)
                .typeName("Mutation")
                .fieldName("addUser")
                .requestMappingTemplate(MappingTemplate.fromFile(gqlPath + "resolvers/Mutation.addUser.req.vtl"))
                .responseMappingTemplate(MappingTemplate.fromFile(gqlPath + "resolvers/Mutation.addUser.res.vtl"))
                .build();
        usersDataSource.createResolver(addUser);

        ResolverProps getUser = ResolverProps.builder()
                .api(api)
                .typeName("Query")
                .fieldName("getUser")
                .requestMappingTemplate(MappingTemplate.fromFile(gqlPath + "resolvers/Query.getUser.req.vtl"))
                .responseMappingTemplate(MappingTemplate.fromFile(gqlPath + "resolvers/Query.getUser.res.vtl"))
                .build();
        usersDataSource.createResolver(getUser);
    }
}
