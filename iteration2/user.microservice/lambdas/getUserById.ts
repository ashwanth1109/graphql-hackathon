// lambda-fns/getUserById.ts

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

async function getUserById(userId: string) {
  const params = {
    TableName: process.env.USERS_TABLE,
    Key: { id: userId },
  };
  try {
    const { Item } = await docClient.get(params).promise();
    return Item;
  } catch (err) {
    console.log("DynamoDB error: ", err);
  }
}

export default getUserById;
