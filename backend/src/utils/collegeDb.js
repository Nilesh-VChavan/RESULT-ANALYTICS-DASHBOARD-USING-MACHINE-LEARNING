// backend/src/utils/collegeDb.js

import mongoose from "mongoose";

const REQUIRED_COLLECTIONS = [
  "users",
  "departments",
  "students",
  "subjects",
  "results",
  "resultUploads"
];

export function createCollegeDatabaseName(collegeCode) {
  return `college_${collegeCode
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")}`;
}

export async function provisionCollegeDatabase(databaseName) {
  const db = mongoose.connection.useDb(databaseName, {
    useCache: true
  });

  for (const collectionName of REQUIRED_COLLECTIONS) {
    try {
      await db.createCollection(collectionName);
      console.log(`✅ Created: ${databaseName}.${collectionName}`);
    } catch (error) {
      // MongoDB error 48 = collection already exists
      if (error.code === 48) {
        console.log(`ℹ️ Exists: ${databaseName}.${collectionName}`);
        continue;
      }

      throw error;
    }
  }

  return db;
}

export function getCollegeDatabase(databaseName) {
  return mongoose.connection.useDb(databaseName, {
    useCache: true
  });
}