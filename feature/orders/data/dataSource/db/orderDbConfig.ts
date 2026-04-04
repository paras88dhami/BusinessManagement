import { OrderLineModel } from "./orderLine.model";
import { orderLinesTable } from "./orderLine.schema";
import { OrderModel } from "./order.model";
import { ordersTable } from "./order.schema";

export const orderDbConfig = {
  models: [OrderModel, OrderLineModel],
  tables: [ordersTable, orderLinesTable],
};
