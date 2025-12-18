require("dotenv").config();

module.exports = {
  databaseUrl: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432", 10),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  migrationsTable: "pgmigrations",
  dir: "migrations",
  direction: "up",
  count: Infinity,
  verbose: true,
};
