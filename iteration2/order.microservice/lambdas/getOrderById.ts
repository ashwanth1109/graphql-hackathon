// lambda-fns/getUserById.ts

const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();

async function getOrderById(orderId: string) {
  const params = {
    TableName: process.env.ORDERS_TABLE,
    Key: { id: orderId },
  };
  try {
    const { Item } = await docClient.get(params).promise();
    return Item;
  } catch (err) {
    console.log("DynamoDB error: ", err);
  }
}

export default getOrderById;
