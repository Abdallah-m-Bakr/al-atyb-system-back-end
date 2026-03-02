import { ORDER_STATUSES, OrderStatus } from "./orderStatuses";

export const STATUS_TRANSITIONS = ORDER_STATUSES.reduce((acc, status) => {
  acc[status] = ORDER_STATUSES.filter((candidate) => candidate !== status);
  return acc;
}, {} as Record<OrderStatus, OrderStatus[]>);

export const canTransitionStatus = (from: OrderStatus, to: OrderStatus): boolean => {
  return STATUS_TRANSITIONS[from].includes(to);
};
