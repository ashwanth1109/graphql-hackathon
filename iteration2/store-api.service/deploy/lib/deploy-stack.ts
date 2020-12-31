import {
  App,
  CfnOutput,
  Duration,
  Expiration,
  Stack,
  StackProps,
} from "@aws-cdk/core";
import {
  AuthorizationType,
  GraphqlApi,
  MappingTemplate,
  Schema,
} from "@aws-cdk/aws-appsync";

export class DeployStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const apiName = "iter2-store-service-api";
    const api = new GraphqlApi(this, apiName, {
      name: apiName,
      schema: Schema.fromAsset("../Store.graphql"),
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

    const userApiDs = api.addHttpDataSource(
      "UserMicroServiceApi",
      "https://3afmbsfphfea7oakt2c4x55nei.appsync-api.us-east-1.amazonaws.com",
      {
        name: "UserMicroServiceApi",
      }
    );

    userApiDs.createResolver({
      typeName: "Query",
      fieldName: "listUsers",
      requestMappingTemplate: MappingTemplate.fromFile(
        "../Query.listUsers.req.vtl"
      ),
      responseMappingTemplate: MappingTemplate.fromFile(
        "../Query.listUsers.res.vtl"
      ),
    });
  }
}
