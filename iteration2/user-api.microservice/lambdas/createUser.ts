// lambda-fns/createNote.ts
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
import User from "./User";

async function createUser(user: User) {
  const params = {
    TableName: process.env.USERS_TABLE,
    Item: user,
  };
  try {
    await docClient.put(params).promise();
    return user;
  } catch (err) {
    console.log("DynamoDB error: ", err);
    return null;
  }
}

export default createUser;
