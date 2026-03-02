import mongoose, { Model } from "mongoose";
import { PERMISSIONS } from "../constants/permissions";
import { PermissionModel } from "../models/Permission";
import { RoleModel } from "../models/Role";
import { UserModel } from "../models/User";
import { SettingsModel } from "../models/Settings";
import { CustomerModel } from "../models/Customer";
import { ProductModel } from "../models/Product";
import { OrderModel } from "../models/Order";
import { ChatRoomModel } from "../models/ChatRoom";
import { ChatMessageModel } from "../models/ChatMessage";
import { hashPassword } from "../utils/hash";

const permissionLabels: Record<string, string> = {
  view_receiving: "??? ?????????",
  view_preparation: "??? ???????",
  view_shipping: "??? ?????",
  view_history: "??? ?????",
  view_analytics: "??? ?????????",
  view_chat: "??? ?????",
  view_customers: "??? ???????",
  view_products: "??? ???????",
  view_staff: "??? ????????",
  view_settings: "??? ?????????",
  orders_create: "????? ???",
  orders_edit: "????? ???",
  orders_delete: "??? ???",
  orders_change_status: "????? ???? ?????",
  orders_assign_shipping: "????? ?????",
  customers_create: "????? ????",
  customers_edit: "????? ????",
  customers_delete: "??? ????",
  products_create: "????? ???",
  products_edit: "????? ???",
  products_delete: "??? ???",
  staff_create: "????? ??????",
  staff_edit: "????? ??????",
  staff_delete: "??? ??????",
  roles_edit_permissions: "????? ??????? ???????",
  settings_edit_definitions: "????? ??????? ??????",
  chat_send_message: "????? ?????"
};

const roleDefinitions: Array<{ key: string; nameArabic: string; permissions: string[] }> = [
  {
    key: "receiving_officer",
    nameArabic: "????? ???????",
    permissions: [
      "view_receiving",
      "view_history",
      "view_customers",
      "view_products",
      "view_chat",
      "orders_create",
      "orders_edit",
      "orders_change_status",
      "customers_create",
      "customers_edit",
      "chat_send_message"
    ]
  },
  {
    key: "preparation_officer",
    nameArabic: "????? ?????",
    permissions: [
      "view_preparation",
      "view_history",
      "view_products",
      "view_chat",
      "orders_edit",
      "orders_change_status",
      "orders_assign_shipping",
      "chat_send_message"
    ]
  },
  {
    key: "pilot",
    nameArabic: "????",
    permissions: [
      "view_shipping",
      "view_history",
      "view_chat",
      "orders_change_status",
      "orders_assign_shipping",
      "chat_send_message"
    ]
  },
  {
    key: "management",
    nameArabic: "?????",
    permissions: [
      "view_receiving",
      "view_preparation",
      "view_shipping",
      "view_history",
      "view_analytics",
      "view_chat",
      "view_customers",
      "view_products",
      "view_staff",
      "view_settings",
      "orders_create",
      "orders_edit",
      "orders_change_status",
      "orders_assign_shipping",
      "customers_create",
      "customers_edit",
      "customers_delete",
      "products_create",
      "products_edit",
      "products_delete",
      "staff_create",
      "staff_edit",
      "staff_delete",
      "roles_edit_permissions",
      "settings_edit_definitions",
      "chat_send_message"
    ]
  },
  {
    key: "general_manager",
    nameArabic: "???? ???",
    permissions: [...PERMISSIONS]
  }
];

const settingsDefinitions = [
  {
    id: "cust_tags",
    label: "??????? ???????",
    description: "???? ???????",
    items: [
      { name: "???? VIP", active: true, sortOrder: 1 },
      { name: "???? ?????", active: true, sortOrder: 2 },
      { name: "??? ???????", active: true, sortOrder: 3 },
      { name: "????? ????", active: true, sortOrder: 4 },
      { name: "???? ????", active: true, sortOrder: 5 }
    ]
  },
  {
    id: "units",
    label: "????? ??????",
    description: "????? ?????",
    items: [
      { name: "????", active: true, sortOrder: 1 },
      { name: "????", active: true, sortOrder: 2 },
      { name: "????", active: true, sortOrder: 3 },
      { name: "??????", active: true, sortOrder: 4 },
      { name: "???", active: true, sortOrder: 5 }
    ]
  },
  {
    id: "sources",
    label: "???? ?????",
    description: "????? ??????",
    items: [
      { name: "??????", active: true, sortOrder: 1 },
      { name: "??????", active: true, sortOrder: 2 },
      { name: "????????", active: true, sortOrder: 3 },
      { name: "??? ???", active: true, sortOrder: 4 },
      { name: "?????? ????", active: true, sortOrder: 5 },
      { name: "??????", active: true, sortOrder: 6 }
    ]
  },
  {
    id: "campaigns",
    label: "???? ???????",
    description: "??????? ??????",
    items: [
      { name: "???? ????", active: true, sortOrder: 1 },
      { name: "??? ?????? ???????", active: true, sortOrder: 2 },
      { name: "???? ????????", active: true, sortOrder: 3 },
      { name: "??????? ?????", active: true, sortOrder: 4 }
    ]
  },
  {
    id: "order_status_msg",
    label: "???? ????? (?????)",
    description: "??? ????? ?????",
    items: [
      { name: "????", active: true, sortOrder: 1 },
      { name: "?????? ????", active: true, sortOrder: 2 },
      { name: "????? ????", active: true, sortOrder: 3 }
    ]
  },
  {
    id: "item_status",
    label: "???? ?????",
    description: "????? ???????",
    items: [
      { name: "?????", active: true, sortOrder: 1 },
      { name: "??? ?????", active: true, sortOrder: 2 },
      { name: "???? ???", active: true, sortOrder: 3 },
      { name: "???? ??????", active: true, sortOrder: 4 },
      { name: "???? ?? ??????", active: true, sortOrder: 5 }
    ]
  },
  {
    id: "payment_methods",
    label: "????? ???????",
    description: "??? ?????",
    items: [
      { name: "???? (Cash)", active: true, sortOrder: 1 },
      { name: "??????? ???", active: true, sortOrder: 2 },
      { name: "????????", active: true, sortOrder: 3 }
    ]
  },
  {
    id: "order_workflow",
    label: "???? ?????",
    description: "????? ?????",
    items: [
      { name: "?? ?????????", active: true, sortOrder: 1 },
      { name: "??? ????????", active: true, sortOrder: 2 },
      { name: "?? ???????", active: true, sortOrder: 3 },
      { name: "???? ???????", active: true, sortOrder: 4 },
      { name: "?? ???????", active: true, sortOrder: 5 },
      { name: "?????? ????", active: true, sortOrder: 6 },
      { name: "?? ??????? ???????", active: true, sortOrder: 7 },
      { name: "?? ???????", active: true, sortOrder: 8 },
      { name: "?? ???????", active: true, sortOrder: 9 }
    ]
  },
  {
    id: "invoice_status",
    label: "???? ????????",
    description: "?????? ????????",
    items: [
      { name: "?????", active: true, sortOrder: 1 },
      { name: "????? ???????", active: true, sortOrder: 2 },
      { name: "???????", active: true, sortOrder: 3 },
      { name: "???? (????? ????)", active: true, sortOrder: 4 },
      { name: "????", active: true, sortOrder: 5 }
    ]
  },
  {
    id: "product_categories",
    label: "????????? (???????)",
    description: "??????? ????????",
    items: [
      { name: "??????", active: true, sortOrder: 1 },
      { name: "?????", active: true, sortOrder: 2 },
      { name: "?????", active: true, sortOrder: 3 },
      { name: "??????", active: true, sortOrder: 4 },
      { name: "??? ??????", active: true, sortOrder: 5 }
    ]
  }
];

const demoUsers: Array<{ roleKey: string; username: string; password: string; name: string }> = [
  {
    roleKey: "receiving_officer",
    username: "receiving_officer",
    password: "receiving_officer123456",
    name: "????? ?????????"
  },
  {
    roleKey: "preparation_officer",
    username: "preparation_officer",
    password: "preparation_officer123456",
    name: "????? ???????"
  },
  {
    roleKey: "pilot",
    username: "pilot",
    password: "pilot123456",
    name: "??????"
  },
  {
    roleKey: "management",
    username: "management",
    password: "management123456",
    name: "???????"
  },
  {
    roleKey: "general_manager",
    username: "general_manager",
    password: "general_manager123456",
    name: "?????? ?????"
  },
  {
    roleKey: "management",
    username: "alateeb",
    password: "admin123456",
    name: "Admin"
  }
];

const projectModels: Model<unknown>[] = [
  PermissionModel as unknown as Model<unknown>,
  RoleModel as unknown as Model<unknown>,
  UserModel as unknown as Model<unknown>,
  SettingsModel as unknown as Model<unknown>,
  CustomerModel as unknown as Model<unknown>,
  ProductModel as unknown as Model<unknown>,
  OrderModel as unknown as Model<unknown>,
  ChatRoomModel as unknown as Model<unknown>,
  ChatMessageModel as unknown as Model<unknown>
];

const getOperationalDay = (date: Date): string => {
  const current = new Date(date);
  if (current.getHours() < 3) {
    current.setDate(current.getDate() - 1);
  }

  return current.toISOString().split("T")[0];
};

const ensureModelCollectionsAndIndexes = async (): Promise<void> => {
  for (const model of projectModels) {
    try {
      await model.createCollection();
    } catch (error) {
      if ((error as any)?.code !== 48) {
        throw error;
      }
    }
  }

  for (const model of projectModels) {
    await model.syncIndexes();
  }
};

const seedDemoData = async (): Promise<void> => {
  await PermissionModel.insertMany(
    PERMISSIONS.map((key) => ({
      key,
      labelArabic: permissionLabels[key] || key
    }))
  );

  const roles = await RoleModel.insertMany(roleDefinitions);
  const roleByKey = new Map(roles.map((role) => [role.key, role]));

  for (const account of demoUsers) {
    const role = roleByKey.get(account.roleKey);
    if (!role) {
      throw new Error(`Cannot seed user ${account.username}. Role ${account.roleKey} is missing.`);
    }

    const passwordHash = await hashPassword(account.password);

    await UserModel.create({
      name: account.name,
      username: account.username,
      passwordHash,
      roleId: role._id,
      status: "Active",
      phone: "",
      userPermissionsOverride: { allow: [], deny: [] },
      sessions: []
    });
  }

  await SettingsModel.create({
    key: "definitions",
    categories: settingsDefinitions
  });

  const customers = await CustomerModel.insertMany([
    {
      name: "???? ????",
      accountName: "taher_alwa_fb",
      phones: ["01010303303", ""],
      addresses: ["???????? - ???? ?????????", ""],
      tags: ["???? VIP", "???? ?????"],
      previousOrdersCount: 45,
      monthlyAverage: 8.5,
      notes: "???? ????",
      deliveryFee: 35,
      defaultDiscount: 10,
      loyaltyPoints: 120,
      rating: 5
    },
    {
      name: "???? ??? ???",
      accountName: "ahmed_ali_fb",
      phones: ["01011223344", "01299887766"],
      addresses: ["??????? - ???????", "?????? - ????? ????"],
      tags: ["???? ?????"],
      previousOrdersCount: 15,
      monthlyAverage: 3,
      notes: "???? ??????? ??? 6 ????",
      deliveryFee: 45,
      defaultDiscount: 5,
      loyaltyPoints: 45,
      rating: 4
    },
    {
      name: "??? ?????",
      accountName: "mona_inst",
      phones: ["01122334455", ""],
      addresses: ["?????? ??????", ""],
      tags: ["???? ????"],
      previousOrdersCount: 5,
      monthlyAverage: 1.2,
      notes: "????? ??? 3",
      deliveryFee: 50,
      defaultDiscount: 0,
      loyaltyPoints: 30,
      rating: 4
    }
  ]);

  const products = await ProductModel.insertMany([
    {
      name: "????? ????",
      status: "Available",
      category: "??????",
      unitPrices: { Kilo: 15, Piece: 2, Package: 40, Offer: 70 },
      offerDescription: "",
      note: ""
    },
    {
      name: "???? ????",
      status: "Available",
      category: "??????",
      unitPrices: { Kilo: 12, Piece: 1.5, Package: 30, Offer: 55 },
      offerDescription: "",
      note: ""
    },
    {
      name: "????? ????",
      status: "Available",
      category: "?????",
      unitPrices: { Kilo: 85, Piece: 18, Package: 240, Offer: 500 },
      offerDescription: "",
      note: ""
    },
    {
      name: "???? ???? ????",
      status: "Available",
      category: "?????",
      unitPrices: { Kilo: 65, Piece: 8, Package: 180, Offer: 330 },
      offerDescription: "",
      note: ""
    }
  ]);

  const now = new Date();
  const operationalDay = getOperationalDay(now);

  await OrderModel.insertMany([
    {
      invoiceNumber: "DEMO-10001",
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      operationalDay,
      status: "Received",
      customer: {
        name: customers[0].name,
        accountName: customers[0].accountName,
        phones: customers[0].phones,
        addresses: customers[0].addresses,
        tags: customers[0].tags,
        previousOrdersCount: customers[0].previousOrdersCount,
        monthlyAverage: customers[0].monthlyAverage,
        notes: customers[0].notes,
        deliveryFee: customers[0].deliveryFee,
        defaultDiscount: customers[0].defaultDiscount,
        loyaltyPoints: customers[0].loyaltyPoints
      },
      items: [
        {
          productId: products[0]._id.toString(),
          productName: products[0].name,
          unit: "Kilo",
          description: "???? ????",
          quantity: 5,
          unitPrice: 15,
          note: "",
          availability: "Available",
          cancelReason: ""
        }
      ],
      discount: { type: "fixed", value: 10, reason: "??? ???? VIP" },
      metadata: {
        receivingSupervisor: "????? ?????????",
        preparingStaff: "",
        deliveryMethod: "Internal",
        courierName: "",
        courierPhone: "",
        companyPhone: "",
        orderSource: "WhatsApp",
        isPaidByCourier: false,
        paymentMethod: "Cash",
        marketingCampaign: ["???? ????"],
        orderTiming: "Normal",
        orderTimingValue: "",
        loyaltyDiscountUsed: 0
      },
      evaluation: {
        productQuality: "",
        productQualityNote: "",
        deliverySpeed: "",
        deliverySpeedNote: "",
        courierBehavior: "",
        courierBehaviorNote: "",
        status: "",
        statusNote: ""
      },
      timestamps: {
        received: new Date(Date.now() - 60 * 60 * 1000),
        preparationStarted: null,
        prepared: null,
        courierPickedUp: null,
        delivered: null
      }
    },
    {
      invoiceNumber: "DEMO-10002",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      operationalDay,
      status: "In Preparation",
      customer: {
        name: customers[1].name,
        accountName: customers[1].accountName,
        phones: customers[1].phones,
        addresses: customers[1].addresses,
        tags: customers[1].tags,
        previousOrdersCount: customers[1].previousOrdersCount,
        monthlyAverage: customers[1].monthlyAverage,
        notes: customers[1].notes,
        deliveryFee: customers[1].deliveryFee,
        defaultDiscount: customers[1].defaultDiscount,
        loyaltyPoints: customers[1].loyaltyPoints
      },
      items: [
        {
          productId: products[2]._id.toString(),
          productName: products[2].name,
          unit: "Package",
          description: "?????? ?????",
          quantity: 2,
          unitPrice: 240,
          note: "",
          availability: "Available",
          cancelReason: ""
        },
        {
          productId: products[3]._id.toString(),
          productName: products[3].name,
          unit: "Kilo",
          description: "????",
          quantity: 3,
          unitPrice: 65,
          note: "",
          availability: "Available",
          cancelReason: ""
        }
      ],
      discount: { type: "percentage", value: 5, reason: "??? ???????" },
      metadata: {
        receivingSupervisor: "????? ?????????",
        preparingStaff: "????? ???????",
        deliveryMethod: "Shipping Company",
        courierName: "??????",
        courierPhone: "16999",
        companyPhone: "16999",
        orderSource: "Facebook",
        isPaidByCourier: false,
        paymentMethod: "Cash",
        marketingCampaign: ["???? ????????"],
        orderTiming: "Urgent",
        orderTimingValue: "",
        loyaltyDiscountUsed: 0
      },
      evaluation: {
        productQuality: "",
        productQualityNote: "",
        deliverySpeed: "",
        deliverySpeedNote: "",
        courierBehavior: "",
        courierBehaviorNote: "",
        status: "",
        statusNote: ""
      },
      timestamps: {
        received: new Date(Date.now() - 2 * 60 * 60 * 1000),
        preparationStarted: new Date(Date.now() - 90 * 60 * 1000),
        prepared: null,
        courierPickedUp: null,
        delivered: null
      }
    },
    {
      invoiceNumber: "DEMO-10003",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      operationalDay,
      status: "Waiting for Courier",
      customer: {
        name: customers[2].name,
        accountName: customers[2].accountName,
        phones: customers[2].phones,
        addresses: customers[2].addresses,
        tags: customers[2].tags,
        previousOrdersCount: customers[2].previousOrdersCount,
        monthlyAverage: customers[2].monthlyAverage,
        notes: customers[2].notes,
        deliveryFee: customers[2].deliveryFee,
        defaultDiscount: customers[2].defaultDiscount,
        loyaltyPoints: customers[2].loyaltyPoints
      },
      items: [
        {
          productId: products[1]._id.toString(),
          productName: products[1].name,
          unit: "Kilo",
          description: "????",
          quantity: 10,
          unitPrice: 12,
          note: "",
          availability: "Available",
          cancelReason: ""
        }
      ],
      discount: { type: "fixed", value: 0, reason: "" },
      metadata: {
        receivingSupervisor: "????? ?????????",
        preparingStaff: "????? ???????",
        deliveryMethod: "Internal",
        courierName: "??????",
        courierPhone: "01099998888",
        companyPhone: "",
        orderSource: "Instagram",
        isPaidByCourier: false,
        paymentMethod: "Cash",
        marketingCampaign: ["???? ????"],
        orderTiming: "Normal",
        orderTimingValue: "",
        loyaltyDiscountUsed: 0
      },
      evaluation: {
        productQuality: "",
        productQualityNote: "",
        deliverySpeed: "",
        deliverySpeedNote: "",
        courierBehavior: "",
        courierBehaviorNote: "",
        status: "",
        statusNote: ""
      },
      timestamps: {
        received: new Date(Date.now() - 3 * 60 * 60 * 1000),
        preparationStarted: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        prepared: new Date(Date.now() - 2 * 60 * 60 * 1000),
        courierPickedUp: null,
        delivered: null
      }
    }
  ]);

  console.log("\nSeeded demo accounts:");
  for (const account of demoUsers) {
    console.log(`- ${account.username} / ${account.password}`);
  }
};

export const runSeedIfNeeded = async (): Promise<void> => {
  const roleCount = await RoleModel.countDocuments();
  if (roleCount > 0) {
    return;
  }

  await ensureModelCollectionsAndIndexes();
  await seedDemoData();
};

export const resetDatabaseForDemo = async (): Promise<void> => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection is not ready");
  }

  await db.dropDatabase();
  await ensureModelCollectionsAndIndexes();
  await seedDemoData();
};
