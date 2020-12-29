import {
  App,
  CfnOutput,
  Duration,
  Expiration,
  Stack,
  StackProps,
} from "@aws-cdk/core";
import { AuthorizationType, GraphqlApi, Schema } from "@aws-cdk/aws-appsync";

export class DeployStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new GraphqlApi(this, "Api", {
      name: "cdk-appsync-test-api",
      schema: Schema.fromAsset("../graphql/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: Expiration.after(Duration.days(365)),
          },
        },
      },
      xrayEnabled: true,
    });

    new CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });

    new CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || "",
    });

    new CfnOutput(this, "Stack Region", {
      value: this.region,
    });
  }
}
