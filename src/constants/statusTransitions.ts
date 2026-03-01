import { OrderStatus } from "./orderStatuses";

export const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  "Received": ["Under Review", "Reviewed", "Confirmed", "Cancelled"],
  "Under Review": ["Reviewed", "Confirmed", "Cancelled"],
  "Reviewed": ["Confirmed", "Cancelled"],
  "Confirmed": ["In Preparation", "Cancelled"],
  "In Preparation": ["Prepared", "Under Review", "Cancelled"],
  "Prepared": ["Waiting for Courier", "Handed Over", "Cancelled"],
  "Waiting for Courier": ["Handed Over", "Cancelled"],
  "Handed Over": ["Delivered", "Cancelled"],
  "Delivered": [],
  "Cancelled": []
};

export const canTransitionStatus = (from: OrderStatus, to: OrderStatus): boolean => {
  if (from === to) {
    return true;
  }

  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
};
