import { z } from "zod";
import { ORDER_STATUSES } from "../constants/orderStatuses";

const requiredText = (field: string) =>
  z
    .string()
    .trim()
    .min(1, `${field} is required`);

const dateInput = (field: string) =>
  z
    .union([z.string(), z.number(), z.date()])
    .transform((value) => new Date(value))
    .refine((value) => !Number.isNaN(value.getTime()), `${field} must be a valid date`);

const orderItemSchema = z.object({
  productId: z.string().optional().default(""),
  productName: requiredText("items[].productName"),
  unit: requiredText("items[].unit"),
  description: z.string().optional().default(""),
  quantity: z.coerce.number().finite("items[].quantity must be a valid number"),
  unitPrice: z.coerce.number().finite("items[].unitPrice must be a valid number"),
  note: z.string().optional().default(""),
  availability: z.string().optional().default("Available"),
  cancelReason: z.string().optional().default("")
});

const embeddedCustomerSchema = z.object({
  name: requiredText("customer.name"),
  accountName: z.string().optional().default(""),
  phones: z.array(z.string()).optional().default([]),
  addresses: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  previousOrdersCount: z.coerce.number().optional().default(0),
  monthlyAverage: z.coerce.number().optional().default(0),
  notes: z.string().optional().default(""),
  deliveryFee: z.coerce.number().optional().default(0),
  defaultDiscount: z.coerce.number().optional().default(0),
  loyaltyPoints: z.coerce.number().optional().default(0)
});

const embeddedCustomerUpdateSchema = z.object({
  name: requiredText("customer.name").optional(),
  accountName: z.string().optional(),
  phones: z.array(z.string()).optional(),
  addresses: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  previousOrdersCount: z.coerce.number().optional(),
  monthlyAverage: z.coerce.number().optional(),
  notes: z.string().optional(),
  deliveryFee: z.coerce.number().optional(),
  defaultDiscount: z.coerce.number().optional(),
  loyaltyPoints: z.coerce.number().optional()
});

const orderDiscountSchema = z.object({
  type: z.enum(["fixed", "percentage"]).default("fixed"),
  value: z.coerce.number().default(0),
  reason: z.string().default("")
});

const orderMetadataSchema = z.object({
  receivingSupervisor: z.string().default(""),
  preparingStaff: z.string().default(""),
  deliveryMethod: z.enum(["Internal", "Shipping Company"]).default("Internal"),
  courierName: z.string().default(""),
  courierPhone: z.string().default(""),
  companyPhone: z.string().default(""),
  orderSource: z.string().default("WhatsApp"),
  isPaidByCourier: z.boolean().default(false),
  paymentMethod: z.string().default("Cash"),
  marketingCampaign: z.unknown().default("بدون حملة"),
  orderTiming: z.string().default("Normal"),
  orderTimingValue: z.string().default(""),
  loyaltyDiscountUsed: z.coerce.number().default(0)
});

const orderMetadataUpdateSchema = z.object({
  receivingSupervisor: z.string().optional(),
  preparingStaff: z.string().optional(),
  deliveryMethod: z.enum(["Internal", "Shipping Company"]).optional(),
  courierName: z.string().optional(),
  courierPhone: z.string().optional(),
  companyPhone: z.string().optional(),
  orderSource: z.string().optional(),
  isPaidByCourier: z.boolean().optional(),
  paymentMethod: z.string().optional(),
  marketingCampaign: z.unknown().optional(),
  orderTiming: z.string().optional(),
  orderTimingValue: z.string().optional(),
  loyaltyDiscountUsed: z.coerce.number().optional()
});

const orderEvaluationSchema = z.object({
  productQuality: z.string().optional().default(""),
  productQualityNote: z.string().optional().default(""),
  deliverySpeed: z.string().optional().default(""),
  deliverySpeedNote: z.string().optional().default(""),
  courierBehavior: z.string().optional().default(""),
  courierBehaviorNote: z.string().optional().default(""),
  status: z.string().optional().default(""),
  statusNote: z.string().optional().default("")
});

const orderEvaluationUpdateSchema = z.object({
  productQuality: z.string().optional(),
  productQualityNote: z.string().optional(),
  deliverySpeed: z.string().optional(),
  deliverySpeedNote: z.string().optional(),
  courierBehavior: z.string().optional(),
  courierBehaviorNote: z.string().optional(),
  status: z.string().optional(),
  statusNote: z.string().optional()
});

const orderTimestampsSchema = z.object({
  received: dateInput("timestamps.received").optional(),
  preparationStarted: dateInput("timestamps.preparationStarted").nullable().optional(),
  prepared: dateInput("timestamps.prepared").nullable().optional(),
  courierPickedUp: dateInput("timestamps.courierPickedUp").nullable().optional(),
  delivered: dateInput("timestamps.delivered").nullable().optional()
});

const orderCreateSchema = z.object({
  invoiceNumber: requiredText("invoiceNumber"),
  createdAt: dateInput("createdAt"),
  operationalDay: requiredText("operationalDay"),
  status: z.enum(ORDER_STATUSES),
  customer: embeddedCustomerSchema,
  items: z.array(orderItemSchema).min(1, "items must include at least one item"),
  discount: orderDiscountSchema.optional(),
  metadata: orderMetadataSchema.optional(),
  evaluation: orderEvaluationSchema.optional(),
  timestamps: orderTimestampsSchema.optional()
});

const orderUpdateSchema = z
  .object({
    invoiceNumber: requiredText("invoiceNumber").optional(),
    createdAt: dateInput("createdAt").optional(),
    operationalDay: requiredText("operationalDay").optional(),
    customer: embeddedCustomerUpdateSchema.optional(),
    items: z.array(orderItemSchema).optional(),
    discount: orderDiscountSchema.partial().optional(),
    metadata: orderMetadataUpdateSchema.optional(),
    evaluation: orderEvaluationUpdateSchema.optional(),
    timestamps: orderTimestampsSchema.partial().optional(),
    status: z.any().optional()
  })
  .superRefine((value, ctx) => {
    if (value.status !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "status must be updated through /orders/:id/status"
      });
    }
  });

const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES)
});

const customerCreateSchema = z.object({
  name: requiredText("name"),
  accountName: z.string().optional().default(""),
  phones: z.array(z.string()).optional().default([]),
  addresses: z.array(z.string()).optional().default([]),
  tags: z.array(z.string()).optional().default([]),
  previousOrdersCount: z.coerce.number().optional().default(0),
  monthlyAverage: z.coerce.number().optional().default(0),
  notes: z.string().optional().default(""),
  deliveryFee: z.coerce.number().optional().default(35),
  defaultDiscount: z.coerce.number().optional().default(0),
  loyaltyPoints: z.coerce.number().optional().default(0),
  rating: z.coerce.number().optional().default(0),
  lastOrderDate: dateInput("lastOrderDate").nullable().optional().default(null)
});

const customerUpdateSchema = customerCreateSchema.partial();

const productCreateSchema = z.object({
  name: requiredText("name"),
  status: z.enum(["Available", "Out of Stock", "Hidden"]).optional().default("Available"),
  category: requiredText("category"),
  unitPrices: z.record(z.coerce.number()).optional().default({}),
  offerDescription: z.string().optional().default(""),
  note: z.string().optional().default("")
});

const productUpdateSchema = productCreateSchema.partial();

const userPermissionsOverrideSchema = z
  .object({
    allow: z.array(z.string()).optional(),
    deny: z.array(z.string()).optional()
  })
  .transform((value) => ({
    allow: value.allow || [],
    deny: value.deny || []
  }));

const userCreateSchema = z.object({
  name: requiredText("name"),
  phone: z.string().optional().default(""),
  roleId: requiredText("roleId"),
  username: requiredText("username").optional(),
  password: requiredText("password").min(6, "password must be at least 6 characters").optional(),
  status: z.enum(["Active", "Suspended"]).optional().default("Active"),
  userPermissionsOverride: userPermissionsOverrideSchema.optional()
});

const userUpdateSchema = z.object({
  name: requiredText("name").optional(),
  phone: z.string().optional(),
  roleId: requiredText("roleId").optional(),
  status: z.enum(["Active", "Suspended"]).optional(),
  userPermissionsOverride: userPermissionsOverrideSchema.optional()
});

const userCredentialsSchema = z.object({
  username: requiredText("username").optional(),
  password: requiredText("password").min(6, "password must be at least 6 characters").optional(),
  regenerate: z.boolean().optional().default(false)
});

const settingsCategorySchema = z.object({
  id: requiredText("categories[].id"),
  label: requiredText("categories[].label"),
  description: z.string().optional().default(""),
  items: z
    .array(
      z.object({
        name: requiredText("categories[].items[].name"),
        active: z.boolean().optional().default(true),
        sortOrder: z.coerce.number().optional().default(0)
      })
    )
    .default([])
});

const settingsDefinitionsSchema = z.array(settingsCategorySchema);

const parsePayload = <T>(schema: z.ZodType<T>, payload: unknown): T => {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw new Error(result.error.issues[0]?.message || "Validation error");
  }

  return result.data;
};

export const parseOrderCreatePayload = (payload: unknown) => parsePayload(orderCreateSchema, payload);
export const parseOrderUpdatePayload = (payload: unknown) => parsePayload(orderUpdateSchema, payload);
export const parseOrderStatusPayload = (payload: unknown) => parsePayload(orderStatusSchema, payload);
export const parseOrderEvaluationPayload = (payload: unknown) =>
  parsePayload(orderEvaluationUpdateSchema, payload);

export const parseCustomerCreatePayload = (payload: unknown) =>
  parsePayload(customerCreateSchema, payload);
export const parseCustomerUpdatePayload = (payload: unknown) =>
  parsePayload(customerUpdateSchema, payload);

export const parseProductCreatePayload = (payload: unknown) => parsePayload(productCreateSchema, payload);
export const parseProductUpdatePayload = (payload: unknown) => parsePayload(productUpdateSchema, payload);

export const parseUserCreatePayload = (payload: unknown) => parsePayload(userCreateSchema, payload);
export const parseUserUpdatePayload = (payload: unknown) => parsePayload(userUpdateSchema, payload);
export const parseUserCredentialsPayload = (payload: unknown) =>
  parsePayload(userCredentialsSchema, payload);

export const parseSettingsDefinitionsPayload = (payload: unknown) =>
  parsePayload(settingsDefinitionsSchema, payload);

