package com.gql.microservices.users.deploy.stacks;

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
import software.amazon.awscdk.services.appsync.Schema;

import static com.gql.microservices.users.Manager.withEnv;

public class MicroServiceStack extends Stack {
    public MicroServiceStack(final Construct parent, String id) {
        super(parent, id);

        String apiName = withEnv("users-api");
        Schema schema = Schema.fromAsset("./src/main/java/com/gql/microservices/users/backend/graphql/User.graphql");
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
    }
}
