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
  view_receiving: "عرض الاستقبال",
  view_preparation: "عرض التحضير",
  view_shipping: "عرض الشحن",
  view_history: "عرض السجل",
  view_analytics: "عرض التحليلات",
  view_chat: "عرض الشات",
  view_customers: "عرض العملاء",
  view_products: "عرض الأصناف",
  view_staff: "عرض الموظفين",
  view_settings: "عرض الإعدادات",
  orders_create: "إنشاء طلب",
  orders_edit: "تعديل طلب",
  orders_delete: "حذف طلب",
  orders_change_status: "تغيير حالة الطلب",
  orders_assign_shipping: "تعيين الشحن",
  customers_create: "إنشاء عميل",
  customers_edit: "تعديل عميل",
  customers_delete: "حذف عميل",
  products_create: "إنشاء صنف",
  products_edit: "تعديل صنف",
  products_delete: "حذف صنف",
  staff_create: "إنشاء مستخدم",
  staff_edit: "تعديل مستخدم",
  staff_delete: "حذف مستخدم",
  roles_edit_permissions: "تعديل صلاحيات الأدوار",
  settings_edit_definitions: "تعديل تعريفات النظام",
  chat_send_message: "إرسال رسالة"
};

const roleDefinitions: Array<{ key: string; nameArabic: string; permissions: string[] }> = [
  {
    key: "receiving_officer",
    nameArabic: "مسؤول استقبال",
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
    nameArabic: "مسؤول تحضير",
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
    nameArabic: "طيار",
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
    nameArabic: "إدارة",
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
    nameArabic: "مدير عام",
    permissions: [...PERMISSIONS]
  }
];

const settingsDefinitions = [
  {
    id: "cust_tags",
    label: "تصنيفات العملاء",
    description: "وسوم العملاء",
    items: [
      { name: "عميل VIP", active: true, sortOrder: 1 },
      { name: "عميل منتظم", active: true, sortOrder: 2 },
      { name: "صعب الإرضاء", active: true, sortOrder: 3 },
      { name: "طلبات قيمة", active: true, sortOrder: 4 },
      { name: "عميل جديد", active: true, sortOrder: 5 }
    ]
  },
  {
    id: "units",
    label: "وحدات القياس",
    description: "وحدات البيع",
    items: [
      { name: "كيلو", active: true, sortOrder: 1 },
      { name: "قطعة", active: true, sortOrder: 2 },
      { name: "عبوة", active: true, sortOrder: 3 },
      { name: "كرتونة", active: true, sortOrder: 4 },
      { name: "عرض", active: true, sortOrder: 5 }
    ]
  },
  {
    id: "sources",
    label: "مصدر الطلب",
    description: "قنوات المصدر",
    items: [
      { name: "واتساب", active: true, sortOrder: 1 },
      { name: "فيسبوك", active: true, sortOrder: 2 },
      { name: "انستجرام", active: true, sortOrder: 3 },
      { name: "تيك توك", active: true, sortOrder: 4 },
      { name: "تليفون أرضي", active: true, sortOrder: 5 },
      { name: "موبايل", active: true, sortOrder: 6 }
    ]
  },
  {
    id: "campaigns",
    label: "حملة تسويقية",
    description: "الحملات النشطة",
    items: [
      { name: "بدون حملة", active: true, sortOrder: 1 },
      { name: "عرض الجمعة البيضاء", active: true, sortOrder: 2 },
      { name: "حملة المؤثرين", active: true, sortOrder: 3 },
      { name: "إعلانات ممولة", active: true, sortOrder: 4 }
    ]
  },
  {
    id: "order_status_msg",
    label: "حالة الطلب (توقيت)",
    description: "وصف توقيت الطلب",
    items: [
      { name: "عادي", active: true, sortOrder: 1 },
      { name: "مستعجل جداً", active: true, sortOrder: 2 },
      { name: "توقيت محدد", active: true, sortOrder: 3 }
    ]
  },
  {
    id: "item_status",
    label: "موقف الصنف",
    description: "حالات الأصناف",
    items: [
      { name: "متوفر", active: true, sortOrder: 1 },
      { name: "غير متوفر", active: true, sortOrder: 2 },
      { name: "كمية أقل", active: true, sortOrder: 3 },
      { name: "جودة متوسطة", active: true, sortOrder: 4 },
      { name: "ملغي من العميل", active: true, sortOrder: 5 }
    ]
  },
  {
    id: "payment_methods",
    label: "طريقة التحصيل",
    description: "طرق الدفع",
    items: [
      { name: "نقدي (Cash)", active: true, sortOrder: 1 },
      { name: "فودافون كاش", active: true, sortOrder: 2 },
      { name: "إنستاباي", active: true, sortOrder: 3 }
    ]
  },
  {
    id: "order_workflow",
    label: "موقف الطلب",
    description: "مراحل الطلب",
    items: [
      { name: "تم الاستقبال", active: true, sortOrder: 1 },
      { name: "تحت المراجعة", active: true, sortOrder: 2 },
      { name: "تمت المراجعة", active: true, sortOrder: 3 },
      { name: "تم التأكيد", active: true, sortOrder: 4 },
      { name: "جاري التجهيز", active: true, sortOrder: 5 },
      { name: "تم التجهيز", active: true, sortOrder: 6 },
      { name: "في انتظار طيار", active: true, sortOrder: 7 },
      { name: "تم التسليم للمندوب", active: true, sortOrder: 8 },
      { name: "تم التوصيل", active: true, sortOrder: 9 },
      { name: "تم الإلغاء", active: true, sortOrder: 10 }
    ]
  },
  {
    id: "invoice_status",
    label: "حالة الفاتورة",
    description: "الحالة النهائية",
    items: [
      { name: "مكتمل", active: true, sortOrder: 1 },
      { name: "مرتجع بالكامل", active: true, sortOrder: 2 },
      { name: "استبدال", active: true, sortOrder: 3 },
      { name: "ناقص (مرتجع جزئي)", active: true, sortOrder: 4 },
      { name: "شكوى", active: true, sortOrder: 5 }
    ]
  },
  {
    id: "product_categories",
    label: "التصنيفات (الأصناف)",
    description: "تصنيفات المنتجات",
    items: [
      { name: "خضروات", active: true, sortOrder: 1 },
      { name: "فواكه", active: true, sortOrder: 2 },
      { name: "ألبان", active: true, sortOrder: 3 },
      { name: "مجمدات", active: true, sortOrder: 4 },
      { name: "سلع غذائية", active: true, sortOrder: 5 }
    ]
  }
];

const demoUsers: Array<{ roleKey: string; username: string; password: string; name: string }> = [
  {
    roleKey: "receiving_officer",
    username: "receiving_officer",
    password: "receiving_officer123456",
    name: "محمود الاستقبال"
  },
  {
    roleKey: "preparation_officer",
    username: "preparation_officer",
    password: "preparation_officer123456",
    name: "أحمد التحضير"
  },
  {
    roleKey: "pilot",
    username: "pilot",
    password: "pilot123456",
    name: "كريم الطيار"
  },
  {
    roleKey: "management",
    username: "management",
    password: "management123456",
    name: "مدير الإدارة"
  },
  {
    roleKey: "general_manager",
    username: "general_manager",
    password: "general_manager123456",
    name: "المدير العام"
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
      name: "طاهر علوه",
      accountName: "taher_alwa_fb",
      phones: ["01010303303", ""],
      addresses: ["المنصورة - شارع الجمهورية", ""],
      tags: ["عميل VIP", "عميل منتظم"],
      previousOrdersCount: 45,
      monthlyAverage: 8.5,
      notes: "عميل مميز",
      deliveryFee: 35,
      defaultDiscount: 10,
      loyaltyPoints: 120,
      rating: 5
    },
    {
      name: "أحمد علي حسن",
      accountName: "ahmed_ali_fb",
      phones: ["01011223344", "01299887766"],
      addresses: ["القاهرة - المعادي", "الجيزة - الشيخ زايد"],
      tags: ["عميل منتظم"],
      previousOrdersCount: 15,
      monthlyAverage: 3,
      notes: "يفضل التوصيل بعد 6 مساء",
      deliveryFee: 45,
      defaultDiscount: 5,
      loyaltyPoints: 45,
      rating: 4
    },
    {
      name: "منى محمود",
      accountName: "mona_inst",
      phones: ["01122334455", ""],
      addresses: ["التجمع الخامس", ""],
      tags: ["عميل جديد"],
      previousOrdersCount: 5,
      monthlyAverage: 1.2,
      notes: "بوابة رقم 3",
      deliveryFee: 50,
      defaultDiscount: 0,
      loyaltyPoints: 30,
      rating: 4
    }
  ]);

  const products = await ProductModel.insertMany([
    {
      name: "طماطم بلدي",
      status: "Available",
      category: "خضروات",
      unitPrices: { Kilo: 15, Piece: 2, Package: 40, Offer: 70 },
      offerDescription: "",
      note: ""
    },
    {
      name: "خيار صوبة",
      status: "Available",
      category: "خضروات",
      unitPrices: { Kilo: 12, Piece: 1.5, Package: 30, Offer: 55 },
      offerDescription: "",
      note: ""
    },
    {
      name: "مانجو عويس",
      status: "Available",
      category: "فواكه",
      unitPrices: { Kilo: 85, Piece: 18, Package: 240, Offer: 500 },
      offerDescription: "",
      note: ""
    },
    {
      name: "تفاح أحمر سكري",
      status: "Available",
      category: "فواكه",
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
          description: "درجة أولى",
          quantity: 5,
          unitPrice: 15,
          note: "",
          availability: "Available",
          cancelReason: ""
        }
      ],
      discount: { type: "fixed", value: 10, reason: "خصم عميل VIP" },
      metadata: {
        receivingSupervisor: "محمود الاستقبال",
        preparingStaff: "",
        deliveryMethod: "Internal",
        courierName: "",
        courierPhone: "",
        companyPhone: "",
        orderSource: "WhatsApp",
        isPaidByCourier: false,
        paymentMethod: "Cash",
        marketingCampaign: ["بدون حملة"],
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
          description: "كرتونة كبيرة",
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
          description: "سكري",
          quantity: 3,
          unitPrice: 65,
          note: "",
          availability: "Available",
          cancelReason: ""
        }
      ],
      discount: { type: "percentage", value: 5, reason: "خصم افتراضي" },
      metadata: {
        receivingSupervisor: "محمود الاستقبال",
        preparingStaff: "أحمد التحضير",
        deliveryMethod: "Shipping Company",
        courierName: "أرامكس",
        courierPhone: "16999",
        companyPhone: "16999",
        orderSource: "Facebook",
        isPaidByCourier: false,
        paymentMethod: "Cash",
        marketingCampaign: ["حملة المؤثرين"],
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
          description: "طازج",
          quantity: 10,
          unitPrice: 12,
          note: "",
          availability: "Available",
          cancelReason: ""
        }
      ],
      discount: { type: "fixed", value: 0, reason: "" },
      metadata: {
        receivingSupervisor: "محمود الاستقبال",
        preparingStaff: "أحمد التحضير",
        deliveryMethod: "Internal",
        courierName: "كريم الطيار",
        courierPhone: "01099998888",
        companyPhone: "",
        orderSource: "Instagram",
        isPaidByCourier: false,
        paymentMethod: "Cash",
        marketingCampaign: ["بدون حملة"],
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
