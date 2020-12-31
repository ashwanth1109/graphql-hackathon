Notes:

```
mvn io.quarkus:quarkus-maven-plugin:1.10.5.Final:create \
    -DprojectGroupId=com.gql \
    -DprojectArtifactId=users.microservice \
    -DprojectVersion=1.0.0 \
    -Dextensions="resteasy-jackson" \
    -DbuildTool=gradle
```

References:

1. [Quarkus example project with AWS Lambda](https://github.com/aws-samples/aws-quarkus-demo/tree/master/lambda)
2. [Gradle tooling with Quarkus](https://quarkus.io/guides/gradle-tooling)
