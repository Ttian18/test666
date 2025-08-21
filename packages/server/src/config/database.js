import dotenv from "dotenv";

dotenv.config();

const databaseConfig = {
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  dialect: process.env.DB_DIALECT || "postgresql",
  logging: process.env.NODE_ENV === "development",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

export default databaseConfig;
