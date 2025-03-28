export const conf = {
    mongoDbUrl: process.env.MONGO_DB_URI,
    dbName: process.env.DB_NAME,
    jwtSecret: process.env.JWT_ACCESS_SECRET,
    jwtExpiry: process.env.JWT_ACCESS_EXPIRESIN,
    refreshSecret: JWT_REFRESH_SECRET,
    refreshExpiry: JWT_REFRESH_EXPIRESIN,
};
