import mongoose from "mongoose";
import { connectDb } from "../config/db";
import { ensureSeedData } from "./migrateLocalToAtlas";

const main = async (): Promise<void> => {
  try {
    await connectDb();

    const seedResult = await ensureSeedData();

    if (seedResult.seededRoleKeys.length > 0) {
      console.log(`Seeded missing roles: ${seedResult.seededRoleKeys.join(", ")}`);
    }

    if (seedResult.seededPermissionKeys.length > 0) {
      console.log(`Seeded missing permissions: ${seedResult.seededPermissionKeys.join(", ")}`);
    }

    console.log("\nSeeded demo accounts:");
    for (const credential of seedResult.demoCredentials) {
      console.log(`- ${credential.username} / ${credential.password}`);
    }
  } finally {
    await mongoose.disconnect().catch(() => undefined);
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
