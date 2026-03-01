export const ORDER_STATUSES = [
  "Received",
  "Under Review",
  "Reviewed",
  "Confirmed",
  "In Preparation",
  "Prepared",
  "Waiting for Courier",
  "Handed Over",
  "Delivered",
  "Cancelled"
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_LABELS_AR: Record<OrderStatus, string> = {
  "Received": "تم الاستقبال",
  "Under Review": "تحت المراجعة",
  "Reviewed": "تمت المراجعة",
  "Confirmed": "تم التأكيد",
  "In Preparation": "جاري التجهيز",
  "Prepared": "تم التجهيز",
  "Waiting for Courier": "في انتظار طيار",
  "Handed Over": "تم التسليم للمندوب",
  "Delivered": "تم التوصيل",
  "Cancelled": "تم الإلغاء"
};
