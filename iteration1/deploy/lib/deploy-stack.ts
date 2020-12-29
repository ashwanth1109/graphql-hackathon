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

    const notesLambda = new Function(this, "AppSyncNotesHandler", {
      runtime: Runtime.NODEJS_12_X,
      handler: "main.handler",
      code: Code.fromAsset("../lambda-fns"),
      memorySize: 1024,
    });

    const lambdaDs = api.addLambdaDataSource("lambdaDataSource", notesLambda);

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getNoteById",
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listNotes",
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createNote"
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "deleteNote",
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "updateNote",
    });

    const notesTable = new Table(this, "CDKNotesTable", {
      billingMode: BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
    });

    notesTable.grantFullAccess(notesLambda);
    notesLambda.addEnvironment("NOTES_TABLE", notesTable.tableName);
  }
}
