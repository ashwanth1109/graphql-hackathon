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
      name: "iter2-orders-microservice-api",
      schema: Schema.fromAsset("../Order.graphql"),
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

    const ordersLambda = new Function(this, "OrdersMicroservicesLambda", {
      runtime: Runtime.NODEJS_12_X,
      handler: "main.handler",
      code: Code.fromAsset("../lambdas"),
      memorySize: 1024,
    });

    const lambdaDs = api.addLambdaDataSource(
      "ordersLambdaDataSource",
      ordersLambda
    );

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createOrder",
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listOrders",
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getOrderById",
    });

    const ordersTable = new Table(this, "iter2-orders-table", {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
    });

    ordersTable.grantFullAccess(ordersLambda);
    ordersLambda.addEnvironment("ORDERS_TABLE", ordersTable.tableName);
  }
}
