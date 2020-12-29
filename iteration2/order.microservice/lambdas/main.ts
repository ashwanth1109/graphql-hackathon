import Order from "./Order";
import getOrderById from "./getOrderById";
import createOrder from "./createOrder";
import listOrders from "./listOrders";

type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    orderId: string;
    order: Order;
  };
};

exports.handler = async (event: AppSyncEvent) => {
  switch (event.info.fieldName) {
    case "getOrderById":
      return await getOrderById(event.arguments.orderId);
    case "createOrder":
      return await createOrder(event.arguments.order);
    case "listOrders":
      return await listOrders();
    default:
      return null;
  }
};
