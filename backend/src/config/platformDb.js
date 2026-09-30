// backend/src/config/platformDb.js

import mongoose from "mongoose";

const platformDbName =
  process.env.PLATFORM_DB_NAME || "result_analytics_platform";

export const platformDB = mongoose.connection.useDb(platformDbName, {
  useCache: true
});

export { platformDbName };