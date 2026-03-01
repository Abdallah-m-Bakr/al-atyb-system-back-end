import { PERMISSIONS } from "../constants/permissions";
import { RoleModel } from "../models/Role";
import { PermissionModel } from "../models/Permission";
import { UserModel } from "../models/User";
import { hashPassword } from "../utils/hash";
import { randomPassword } from "../utils/credentials";
import { SettingsModel } from "../models/Settings";
import { CustomerModel } from "../models/Customer";
import { ProductModel } from "../models/Product";
import { OrderModel } from "../models/Order";
import { ChatRoomModel } from "../models/ChatRoom";
import { ChatMessageModel } from "../models/ChatMessage";

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

const rolePermissions: Record<string, string[]> = {
  general_manager: [...PERMISSIONS],
  management: [
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
  ],
  receiving_officer: [
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
  ],
  preparation_officer: [
    "view_preparation",
    "view_history",
    "view_products",
    "view_chat",
    "orders_edit",
    "orders_change_status",
    "orders_assign_shipping",
    "chat_send_message"
  ],
  pilot: [
    "view_shipping",
    "view_history",
    "view_chat",
    "orders_change_status",
    "orders_assign_shipping",
    "chat_send_message"
  ]
};

const roleNamesArabic: Record<string, string> = {
  receiving_officer: "مسؤول استقبال",
  preparation_officer: "مسؤول تحضير",
  pilot: "طيار",
  management: "إدارة",
  general_manager: "مدير عام"
};

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
      { name: "تم التأكيد", active: true, sortOrder: 3 },
      { name: "جاري التجهيز", active: true, sortOrder: 4 },
      { name: "تم التحضير", active: true, sortOrder: 5 },
      { name: "انتظار طيار", active: true, sortOrder: 6 },
      { name: "تم التسليم للمندوب", active: true, sortOrder: 7 },
      { name: "تم التوصيل", active: true, sortOrder: 8 },
      { name: "تم الإلغاء", active: true, sortOrder: 9 }
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

const getOperationalDay = (date: Date): string => {
  const current = new Date(date);
  if (current.getHours() < 3) {
    current.setDate(current.getDate() - 1);
  }

  return current.toISOString().split("T")[0];
};

const invoiceNumber = (offset: number) => {
  const d = new Date();
  const day = `${d.getDate()}`.padStart(2, "0");
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const year = `${d.getFullYear()}`.slice(-2);
  return `${day}${month}${year}${`${offset}`.padStart(5, "0")}`;
};

export const runSeedIfNeeded = async (): Promise<void> => {
  const roleCount = await RoleModel.countDocuments();
  if (roleCount > 0) {
    return;
  }

  await PermissionModel.insertMany(
    PERMISSIONS.map((key) => ({
      key,
      labelArabic: permissionLabels[key] || key
    }))
  );

  const roles = await RoleModel.insertMany([
    {
      key: "receiving_officer",
      nameArabic: roleNamesArabic.receiving_officer,
      permissions: rolePermissions.receiving_officer
    },
    {
      key: "preparation_officer",
      nameArabic: roleNamesArabic.preparation_officer,
      permissions: rolePermissions.preparation_officer
    },
    {
      key: "pilot",
      nameArabic: roleNamesArabic.pilot,
      permissions: rolePermissions.pilot
    },
    {
      key: "management",
      nameArabic: roleNamesArabic.management,
      permissions: rolePermissions.management
    },
    {
      key: "general_manager",
      nameArabic: roleNamesArabic.general_manager,
      permissions: rolePermissions.general_manager
    }
  ]);

  const roleByKey = new Map(roles.map((role) => [role.key, role]));

  const defaultUsers = [
    { key: "receiving_officer", username: "reception_001", name: "محمود الاستقبال" },
    { key: "preparation_officer", username: "prep_001", name: "أحمد التحضير" },
    { key: "pilot", username: "pilot_001", name: "كريم الطيار" },
    { key: "management", username: "admin_001", name: "مدير الإدارة" },
    { key: "general_manager", username: "gm_001", name: "المدير العام" }
  ];

  const generatedCreds: Array<{ username: string; password: string; role: string }> = [];

  for (const user of defaultUsers) {
    const role = roleByKey.get(user.key);
    if (!role) continue;

    const password = randomPassword(12);
    const passwordHash = await hashPassword(password);

    await UserModel.create({
      name: user.name,
      username: user.username,
      passwordHash,
      roleId: role._id,
      status: "Active",
      phone: "",
      userPermissionsOverride: { allow: [], deny: [] },
      sessions: []
    });

    generatedCreds.push({
      username: user.username,
      password,
      role: role.nameArabic
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
      loyaltyPoints: 120
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
      loyaltyPoints: 45
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
      loyaltyPoints: 30
    }
  ]);

  const products = await ProductModel.insertMany([
    {
      name: "طماطم بلدي",
      status: "Available",
      category: "خضروات",
      unitPrices: { Kilo: 15, Piece: 2, Package: 40 }
    },
    {
      name: "خيار صوبة",
      status: "Available",
      category: "خضروات",
      unitPrices: { Kilo: 12, Piece: 1.5, Package: 30 }
    },
    {
      name: "مانجو عويس",
      status: "Available",
      category: "فواكه",
      unitPrices: { Kilo: 85, Package: 240, Offer: 500 }
    },
    {
      name: "تفاح أحمر سكري",
      status: "Available",
      category: "فواكه",
      unitPrices: { Kilo: 65, Piece: 8, Package: 180 }
    }
  ]);

  const now = new Date();
  const opDay = getOperationalDay(now);

  const orders = await OrderModel.insertMany([
    {
      invoiceNumber: invoiceNumber(1),
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
      operationalDay: opDay,
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
          availability: "Available"
        }
      ],
      discount: { type: "fixed", value: 10, reason: "خصم عميل VIP" },
      metadata: {
        receivingSupervisor: "محمود الاستقبال",
        preparingStaff: "",
        deliveryMethod: "Internal",
        orderSource: "WhatsApp",
        marketingCampaign: ["بدون حملة"],
        orderTiming: "Normal",
        orderTimingValue: "",
        isPaidByCourier: false,
        paymentMethod: "Cash",
        loyaltyDiscountUsed: 0
      },
      timestamps: { received: new Date(Date.now() - 60 * 60 * 1000) }
    },
    {
      invoiceNumber: invoiceNumber(2),
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      operationalDay: opDay,
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
          availability: "Available"
        },
        {
          productId: products[3]._id.toString(),
          productName: products[3].name,
          unit: "Kilo",
          description: "سكري",
          quantity: 3,
          unitPrice: 65,
          availability: "Available"
        }
      ],
      discount: { type: "percentage", value: 5, reason: "خصم افتراضي" },
      metadata: {
        receivingSupervisor: "محمود الاستقبال",
        preparingStaff: "أحمد التحضير",
        deliveryMethod: "Shipping Company",
        courierName: "أرامكس",
        courierPhone: "16999",
        orderSource: "Facebook",
        marketingCampaign: ["حملة المؤثرين"],
        orderTiming: "Urgent",
        orderTimingValue: "",
        isPaidByCourier: false,
        paymentMethod: "Cash",
        loyaltyDiscountUsed: 0
      },
      timestamps: {
        received: new Date(Date.now() - 2 * 60 * 60 * 1000),
        preparationStarted: new Date(Date.now() - 90 * 60 * 1000)
      }
    },
    {
      invoiceNumber: invoiceNumber(3),
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      operationalDay: opDay,
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
          availability: "Available"
        }
      ],
      discount: { type: "fixed", value: 0, reason: "" },
      metadata: {
        receivingSupervisor: "محمود الاستقبال",
        preparingStaff: "أحمد التحضير",
        deliveryMethod: "Internal",
        courierName: "كريم الطيار",
        courierPhone: "01099998888",
        orderSource: "Instagram",
        marketingCampaign: ["بدون حملة"],
        orderTiming: "Normal",
        orderTimingValue: "",
        isPaidByCourier: false,
        paymentMethod: "Cash",
        loyaltyDiscountUsed: 0
      },
      timestamps: {
        received: new Date(Date.now() - 3 * 60 * 60 * 1000),
        preparationStarted: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        prepared: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    }
  ]);

  const firstUser = await UserModel.findOne({ username: "admin_001" }).lean();
  const secondUser = await UserModel.findOne({ username: "prep_001" }).lean();

  for (const order of orders) {
    const room = await ChatRoomModel.create({
      type: "order",
      orderId: order._id.toString(),
      name: `محادثة طلب #${order.invoiceNumber}`,
      unreadCount: 0,
      lastMessage: "تم إنشاء الغرفة",
      lastTimestamp: new Date()
    });

    if (firstUser && secondUser) {
      await ChatMessageModel.insertMany([
        {
          roomId: room._id,
          senderUserId: firstUser._id,
          senderName: firstUser.name,
          senderRoleKey: "management",
          text: `متابعة طلب ${order.invoiceNumber}`,
          createdAt: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          roomId: room._id,
          senderUserId: secondUser._id,
          senderName: secondUser.name,
          senderRoleKey: "preparation_officer",
          text: "تم استلام الملاحظة وجارٍ التنفيذ",
          createdAt: new Date(Date.now() - 25 * 60 * 1000)
        }
      ]);
    }
  }

  console.log("\nSeed generated accounts (printed once on empty DB):");
  generatedCreds.forEach((cred) => {
    console.log(`[${cred.role}] ${cred.username} / ********`);
  });
  console.log("");
};
