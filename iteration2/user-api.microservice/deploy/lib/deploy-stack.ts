import {
  App,
  CfnOutput,
  Duration,
  Expiration,
  Stack,
  StackProps,
} from "@aws-cdk/core";
import { AuthorizationType, GraphqlApi, Schema } from "@aws-cdk/aws-appsync";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { AttributeType, BillingMode, Table } from "@aws-cdk/aws-dynamodb";

export class DeployStack extends Stack {
  constructor(scope: App, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new GraphqlApi(this, "Api", {
      name: "iter2-users-microservice-api",
      schema: Schema.fromAsset("../User.graphql"),
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

    const usersLambda = new Function(this, "UsersMicroservicesLambda", {
      runtime: Runtime.NODEJS_12_X,
      handler: "main.handler",
      code: Code.fromAsset("../lambdas"),
      memorySize: 1024,
    });

    const lambdaDs = api.addLambdaDataSource(
      "usersLambdaDataSource",
      usersLambda
    );

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createUser",
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listUsers",
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getUserById",
    });

    const usersTable = new Table(this, "iter2-users-table", {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
    });

    usersTable.grantFullAccess(usersLambda);
    usersLambda.addEnvironment("USERS_TABLE", usersTable.tableName);
  }
}
