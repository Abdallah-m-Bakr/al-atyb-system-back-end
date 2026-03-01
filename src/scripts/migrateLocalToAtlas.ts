import fs from "fs";
import path from "path";
import { parse } from "dotenv";
import mongoose, { Model } from "mongoose";
import { AnyBulkWriteOperation, Db, Document, MongoClient, MongoServerError } from "mongodb";

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
import { randomPassword } from "../utils/credentials";

type EnvMap = Record<string, string>;

interface MigrationOptions {
  localUri: string;
  localDbName: string;
  atlasUri: string;
  atlasDbName: string;
  batchSize: number;
}

interface CollectionReport {
  name: string;
  localCount: number;
  atlasCount: number;
  migratedCount: number;
  mismatch: boolean;
}

interface SeedResult {
  adminUserCreated: boolean;
  rolesSeeded: boolean;
  permissionsSeeded: boolean;
  seededRoleKeys: string[];
  seededPermissionKeys: string[];
}

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

const getArgValue = (name: string): string | undefined => {
  const prefix = `--${name}=`;
  const arg = process.argv.find((entry) => entry.startsWith(prefix));
  return arg ? arg.slice(prefix.length).trim() : undefined;
};

const readEnvFile = (filePath: string): EnvMap => {
  if (!fs.existsSync(filePath)) return {};

  const content = fs.readFileSync(filePath, "utf8");
  return parse(content);
};

const getDbNameFromMongoUri = (uri: string): string | undefined => {
  const withoutQuery = uri.split("?")[0];
  const lastSlash = withoutQuery.lastIndexOf("/");

  if (lastSlash === -1) return undefined;

  const dbName = withoutQuery.slice(lastSlash + 1);
  if (!dbName) return undefined;

  return dbName;
};

const resolveOptions = (): MigrationOptions => {
  const cwd = process.cwd();
  const envDefault = readEnvFile(path.join(cwd, ".env"));
  const envLocal = readEnvFile(path.join(cwd, ".env.local"));
  const envProduction = readEnvFile(path.join(cwd, ".env.production"));

  const localUri =
    getArgValue("local-uri") ||
    process.env.MIGRATION_LOCAL_URI ||
    process.env.LOCAL_MONGODB_URI ||
    envLocal.MONGODB_URI ||
    envDefault.MONGODB_URI;

  const atlasUri =
    getArgValue("atlas-uri") ||
    process.env.MIGRATION_ATLAS_URI ||
    process.env.ATLAS_MONGODB_URI ||
    envProduction.MONGODB_URI;

  if (!localUri) {
    throw new Error("Local MongoDB URI was not found. Provide --local-uri or MIGRATION_LOCAL_URI.");
  }

  if (!atlasUri) {
    throw new Error("Atlas MongoDB URI was not found. Provide --atlas-uri or MIGRATION_ATLAS_URI.");
  }

  const localDbName =
    getArgValue("local-db") ||
    process.env.MIGRATION_LOCAL_DB ||
    process.env.LOCAL_DB_NAME ||
    getDbNameFromMongoUri(localUri);

  const atlasDbName =
    getArgValue("atlas-db") ||
    process.env.MIGRATION_ATLAS_DB ||
    process.env.ATLAS_DB_NAME ||
    getDbNameFromMongoUri(atlasUri);

  if (!localDbName) {
    throw new Error("Local DB name is missing. Set --local-db or MIGRATION_LOCAL_DB.");
  }

  if (!atlasDbName) {
    throw new Error("Atlas DB name is missing. Set --atlas-db or MIGRATION_ATLAS_DB.");
  }

  const batchSizeRaw = getArgValue("batch-size") || process.env.MIGRATION_BATCH_SIZE || "1000";
  const batchSize = Number(batchSizeRaw);

  if (!Number.isInteger(batchSize) || batchSize <= 0) {
    throw new Error(`Invalid batch size: ${batchSizeRaw}`);
  }

  return {
    localUri,
    localDbName,
    atlasUri,
    atlasDbName,
    batchSize
  };
};

const ensureDatabaseDroppedIfNeeded = async (db: Db): Promise<void> => {
  const collections = await db.listCollections({}, { nameOnly: true }).toArray();

  if (collections.length === 0) {
    console.log("Atlas database is already empty.");
    return;
  }

  const stats = await db.stats();
  const hadData = stats.objects > 0;

  await db.dropDatabase();

  const afterDrop = await db.listCollections({}, { nameOnly: true }).toArray();
  if (afterDrop.length > 0) {
    throw new Error("Failed to clean Atlas database. Collections still exist after dropDatabase().");
  }

  const reason = hadData ? "contained documents" : "contained collections";
  console.log(`Atlas database was dropped because it ${reason}.`);
};

const ensureModelCollectionsAndIndexes = async (): Promise<void> => {
  for (const model of projectModels) {
    try {
      await model.createCollection();
    } catch (error) {
      if (!(error instanceof MongoServerError) || error.code !== 48) {
        throw error;
      }
    }
  }

  for (const model of projectModels) {
    await model.syncIndexes();
  }
};

const ensureCollectionExists = async (db: Db, collectionName: string): Promise<void> => {
  try {
    await db.createCollection(collectionName);
  } catch (error) {
    if (!(error instanceof MongoServerError) || error.code !== 48) {
      throw error;
    }
  }
};

const syncIndexesFromLocal = async (localDb: Db, atlasDb: Db, collectionName: string): Promise<void> => {
  const localIndexes = await localDb.collection(collectionName).indexes();

  for (const index of localIndexes) {
    if (index.name === "_id_") continue;

    const {
      key,
      name,
      ns: _ns,
      v: _v,
      background: _background,
      ...rawOptions
    } = index as Record<string, unknown>;

    const indexKey = key as Record<string, 1 | -1 | "text" | "hashed">;
    const options = rawOptions as Record<string, unknown>;

    await atlasDb.collection(collectionName).createIndex(indexKey, {
      name: name as string,
      ...options
    });
  }
};

const migrateCollection = async (
  localDb: Db,
  atlasDb: Db,
  collectionName: string,
  batchSize: number
): Promise<number> => {
  const source = localDb.collection(collectionName);
  const target = atlasDb.collection(collectionName);

  const cursor = source.find({}, { batchSize });
  let migrated = 0;
  let operations: AnyBulkWriteOperation<Document>[] = [];

  const flush = async () => {
    if (operations.length === 0) return;

    await target.bulkWrite(operations, { ordered: false });
    migrated += operations.length;
    operations = [];
  };

  for await (const doc of cursor) {
    if (doc && "_id" in doc) {
      operations.push({
        replaceOne: {
          filter: { _id: doc._id },
          replacement: doc,
          upsert: true
        }
      });
    } else {
      operations.push({
        insertOne: {
          document: doc
        }
      });
    }

    if (operations.length >= batchSize) {
      await flush();
    }
  }

  await flush();
  return migrated;
};

const verifyCollections = async (
  localDb: Db,
  atlasDb: Db,
  migratedByCollection: Map<string, number>
): Promise<CollectionReport[]> => {
  const localCollections = await localDb.listCollections({}, { nameOnly: true }).toArray();
  const sortedNames = localCollections.map((c) => c.name).sort((a, b) => a.localeCompare(b));

  const reports: CollectionReport[] = [];

  for (const name of sortedNames) {
    const localCount = await localDb.collection(name).countDocuments();
    const atlasCount = await atlasDb.collection(name).countDocuments();

    reports.push({
      name,
      localCount,
      atlasCount,
      migratedCount: migratedByCollection.get(name) ?? 0,
      mismatch: localCount !== atlasCount
    });
  }

  return reports;
};

const ensureUniqueUsername = async (baseUsername: string): Promise<string> => {
  let username = baseUsername;
  let suffix = 1;

  while (await UserModel.exists({ username })) {
    username = `${baseUsername}_${suffix}`;
    suffix += 1;
  }

  return username;
};

const ensureSeedData = async (): Promise<SeedResult> => {
  const seededRoleKeys: string[] = [];
  const seededPermissionKeys: string[] = [];

  const existingPermissions = await PermissionModel.find({}, { key: 1, _id: 0 }).lean();
  const permissionKeySet = new Set(existingPermissions.map((item) => item.key));

  const missingPermissionKeys = PERMISSIONS.filter((key) => !permissionKeySet.has(key));

  if (missingPermissionKeys.length > 0) {
    await PermissionModel.insertMany(
      missingPermissionKeys.map((key) => ({
        key,
        labelArabic: permissionLabels[key] || key
      })),
      { ordered: false }
    );

    seededPermissionKeys.push(...missingPermissionKeys);
  }

  const existingRoles = await RoleModel.find({}, { key: 1, _id: 0 }).lean();
  const roleKeySet = new Set(existingRoles.map((item) => item.key));

  const missingRoles = roleDefinitions.filter((role) => !roleKeySet.has(role.key));

  if (missingRoles.length > 0) {
    await RoleModel.insertMany(missingRoles, { ordered: false });
    seededRoleKeys.push(...missingRoles.map((role) => role.key));
  }

  const defaultAdminAccounts = [
    {
      displayName: "System Admin",
      baseUsername: "admin_001",
      roleKey: "management"
    },
    {
      displayName: "System Super Admin",
      baseUsername: "gm_001",
      roleKey: "general_manager"
    }
  ];

  let adminUserCreated = false;

  for (const account of defaultAdminAccounts) {
    const role = await RoleModel.findOne({ key: account.roleKey }).lean();
    if (!role) {
      continue;
    }

    const existsByRole = await UserModel.exists({ roleId: role._id });
    const existsByUsername = await UserModel.exists({ username: account.baseUsername });

    if (existsByRole || existsByUsername) {
      continue;
    }

    const username = await ensureUniqueUsername(account.baseUsername);
    const passwordHash = await hashPassword(randomPassword(20));

    await UserModel.create({
      name: account.displayName,
      username,
      phone: "",
      status: "Active",
      passwordHash,
      roleId: role._id,
      userPermissionsOverride: { allow: [], deny: [] },
      sessions: []
    });

    adminUserCreated = true;
  }

  return {
    adminUserCreated,
    rolesSeeded: seededRoleKeys.length > 0,
    permissionsSeeded: seededPermissionKeys.length > 0,
    seededRoleKeys,
    seededPermissionKeys
  };
};

const printCollectionReport = (reports: CollectionReport[]): void => {
  console.log("\nCollection verification:");

  for (const report of reports) {
    const mismatchText = report.mismatch ? "YES" : "NO";
    console.log(
      `- ${report.name}: migrated=${report.migratedCount}, local=${report.localCount}, atlas=${report.atlasCount}, mismatch=${mismatchText}`
    );
  }
};

const printFinalSummary = (
  dbName: string,
  collectionsCreated: number,
  totalMigrated: number,
  seedResult: SeedResult,
  mismatches: CollectionReport[],
  errors: string[]
): void => {
  const mismatchSummary =
    mismatches.length === 0
      ? "None"
      : mismatches
          .map((item) => `${item.name} (local=${item.localCount}, atlas=${item.atlasCount})`)
          .join(", ");

  console.log("\nFinal report:");
  console.log(`✔ Database Created: ${dbName}`);
  console.log(`✔ Collections Created: ${collectionsCreated}`);
  console.log(`✔ Total Documents Migrated: ${totalMigrated}`);
  console.log(`✔ Admin User Created: ${seedResult.adminUserCreated ? "Yes" : "No"}`);
  console.log(
    `✔ Roles Seeded: ${seedResult.rolesSeeded || seedResult.permissionsSeeded ? "Yes" : "No"}`
  );
  console.log(`✔ Any Mismatch: ${mismatchSummary}`);
  console.log(`✔ Any Errors: ${errors.length === 0 ? "None" : errors.join(" | ")}`);
};

const main = async (): Promise<void> => {
  const options = resolveOptions();

  if (options.localUri === options.atlasUri && options.localDbName === options.atlasDbName) {
    throw new Error("Source and target point to the same database. Aborting to prevent data loss.");
  }

  const localClient = new MongoClient(options.localUri);
  const atlasClient = new MongoClient(options.atlasUri);
  const errors: string[] = [];

  try {
    await localClient.connect();
    await atlasClient.connect();

    const localDb = localClient.db(options.localDbName);
    const atlasDb = atlasClient.db(options.atlasDbName);

    console.log(`Source: ${options.localDbName}`);
    console.log(`Target: ${options.atlasDbName}`);

    await ensureDatabaseDroppedIfNeeded(atlasDb);

    await mongoose.connect(options.atlasUri, {
      dbName: options.atlasDbName
    });

    await ensureModelCollectionsAndIndexes();

    const localCollections = await localDb.listCollections({}, { nameOnly: true }).toArray();
    const migratedByCollection = new Map<string, number>();

    for (const { name } of localCollections) {
      await ensureCollectionExists(atlasDb, name);
      const migratedCount = await migrateCollection(localDb, atlasDb, name, options.batchSize);
      migratedByCollection.set(name, migratedCount);
      await syncIndexesFromLocal(localDb, atlasDb, name);
    }

    const verification = await verifyCollections(localDb, atlasDb, migratedByCollection);
    printCollectionReport(verification);

    const seedResult = await ensureSeedData();

    if (seedResult.seededRoleKeys.length > 0) {
      console.log(`\nSeeded missing roles: ${seedResult.seededRoleKeys.join(", ")}`);
    }

    if (seedResult.seededPermissionKeys.length > 0) {
      console.log(`Seeded missing permissions: ${seedResult.seededPermissionKeys.join(", ")}`);
    }

    const atlasCollections = await atlasDb.listCollections({}, { nameOnly: true }).toArray();
    const totalMigrated = Array.from(migratedByCollection.values()).reduce((sum, value) => sum + value, 0);
    const mismatches = verification.filter((item) => item.mismatch);

    printFinalSummary(
      options.atlasDbName,
      atlasCollections.length,
      totalMigrated,
      seedResult,
      mismatches,
      errors
    );

    if (mismatches.length > 0) {
      process.exitCode = 2;
    }
  } catch (error) {
    const message = error instanceof Error ? error.stack || error.message : String(error);
    errors.push(message);

    printFinalSummary(
      options.atlasDbName,
      0,
      0,
      {
        adminUserCreated: false,
        rolesSeeded: false,
        permissionsSeeded: false,
        seededRoleKeys: [],
        seededPermissionKeys: []
      },
      [],
      errors
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect().catch(() => undefined);
    await localClient.close().catch(() => undefined);
    await atlasClient.close().catch(() => undefined);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
